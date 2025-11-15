/**
 * Performance Monitoring Utility
 * 
 * Usage:
 * import { trackApiPerformance } from '@/lib/monitoring/performance';
 * 
 * export async function GET(request: Request) {
 *   return trackApiPerformance('api-route-name', async () => {
 *     // Your handler logic
 *     return NextResponse.json({ data });
 *   });
 * }
 */

interface PerformanceMetrics {
  route: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  error?: string;
}

const metrics: PerformanceMetrics[] = [];
const MAX_METRICS = 1000; // Keep last 1000 metrics in memory

export async function trackApiPerformance<T>(
  route: string,
  handler: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  let statusCode = 200;
  let error: string | undefined;

  try {
    const result = await handler();
    return result;
  } catch (err: any) {
    error = err.message;
    statusCode = err.statusCode || 500;
    throw err;
  } finally {
    const duration = performance.now() - startTime;
    
    // Record metric
    metrics.push({
      route,
      duration,
      statusCode,
      timestamp: new Date(),
      error
    });

    // Keep metrics array bounded
    if (metrics.length > MAX_METRICS) {
      metrics.shift();
    }

    // Log slow requests
    if (duration > 1000) {
      console.log(`Slow request: ${route} took ${duration}ms`);
    }

    // In production, you would send this to a monitoring service
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // Sentry.captureMessage(`API Performance: ${route}`, {
      //   level: duration > 1000 ? 'warning' : 'info',
      //   extra: { duration, statusCode, error }
      // });
    }
  }
}

export function getPerformanceMetrics() {
  return {
    total: metrics.length,
    averageDuration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
    slowestRoutes: [...metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10),
    errorRate: (metrics.filter(m => m.statusCode >= 400).length / metrics.length) * 100,
    recentMetrics: metrics.slice(-100)
  };
}

export function clearMetrics() {
  metrics.length = 0;
}

