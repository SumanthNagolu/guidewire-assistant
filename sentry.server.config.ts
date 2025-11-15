/**
 * SENTRY CONFIGURATION - Server Side
 * Error tracking and monitoring for production
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: 1.0,

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Error filtering
  beforeSend(event, hint) {
    // Filter out known errors
    if (event.exception) {
      const error = hint.originalException;
      
      // Ignore NEXT_REDIRECT (expected behavior)
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        return null;
      }
    }

    return event;
  },

  // Add context
  initialScope: {
    tags: {
      app: 'trikala',
      version: '2.0'
    }
  }
});
