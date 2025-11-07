/**
 * Simple in-memory rate limiter
 * For production, consider Redis-based solution (Upstash, Vercel KV)
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if request should be rate limited
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No existing entry or expired
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  // Existing entry within window
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000), // seconds
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RateLimits = {
  // Bootstrap key attempts: 5 attempts per 15 minutes per IP
  // This prevents brute-force attacks on the bootstrap key
  BOOTSTRAP_SETUP: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },

  // Auth endpoints: 10 attempts per 5 minutes per IP
  AUTH_LOGIN: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
  },

  AUTH_SIGNUP: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5,
  },

  // Password reset: 3 attempts per 15 minutes per email
  PASSWORD_RESET: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3,
  },
} as const;

/**
 * Get client IP from request (considering proxies)
 */
export function getClientIp(request: Request): string {
  // Vercel provides this header
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Fallback to real IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Last resort
  return 'unknown';
}

/**
 * Create rate limit response with headers
 */
export function createRateLimitResponse(
  message: string,
  resetAt: number,
  retryAfter: number
): Response {
  return Response.json(
    {
      success: false,
      error: message,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
      },
    }
  );
}

