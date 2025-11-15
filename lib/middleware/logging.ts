import { NextRequest, NextResponse } from 'next/server';
import { loggers } from '@/lib/logger';

// Middleware for API logging
export function withLogging(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const start = Date.now();
    const method = req.method;
    const url = req.url;
    
    try {
      // Log request
      loggers.api.request(method, url);
      
      // Execute handler
      const response = await handler(req, ...args);
      
      // Log response
      const duration = Date.now() - start;
      loggers.api.response(method, url, response.status, duration);
      
      return response;
    } catch (error: any) {
      // Log error
      loggers.api.error(method, url, error);
      
      // Re-throw to let error handlers deal with it
      throw error;
    }
  };
}

// Express-style middleware for Next.js API routes
export function apiLogger(req: any, res: any, next: () => void) {
  const start = Date.now();
  const method = req.method;
  const url = req.url;
  
  // Log request
  loggers.api.request(method, url, req.headers['x-user-id']);
  
  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - start;
    loggers.api.response(method, url, res.statusCode, duration);
    originalEnd.apply(res, args);
  };
  
  next();
}
