import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'AUTHENTICATION_ERROR');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN_ERROR');
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND_ERROR');
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(429, message, 'RATE_LIMIT_ERROR');
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(500, message, 'INTERNAL_SERVER_ERROR');
  }
}

export function handleApiError(error: unknown): NextResponse {
  
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode
        }
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error);
          }

    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message;

    return NextResponse.json(
      {
        error: {
          message,
          code: 'INTERNAL_ERROR',
          statusCode: 500
        }
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 500
      }
    },
    { status: 500 }
  );
}




