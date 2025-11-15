import { NextResponse } from 'next/server';

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(options: RateLimitOptions) {
  return {
    check: async (request: Request, limit: number): Promise<void> => {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      
      const key = `${ip}:${new URL(request.url).pathname}`;
      const now = Date.now();

      if (!store[key] || now > store[key].resetTime) {
        store[key] = {
          count: 0,
          resetTime: now + options.interval
        };
      }

      store[key].count++;

      if (store[key].count > limit) {
        throw new Error('Rate limit exceeded');
      }

      // Clean up old entries periodically
      if (Math.random() < 0.01) { // 1% chance
        Object.keys(store).forEach(k => {
          if (now > store[k].resetTime) {
            delete store[k];
          }
        });
      }
    }
  };
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { 
      status: 429,
      headers: {
        'Retry-After': '60'
      }
    }
  );
}




