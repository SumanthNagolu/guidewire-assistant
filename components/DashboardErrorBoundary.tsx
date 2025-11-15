'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';

/**
 * Error Boundary specifically for Dashboard content
 * Provides a user-friendly fallback with navigation options
 */
export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>Unable to Load Content</CardTitle>
              </div>
              <CardDescription>
                We encountered an error while loading this page. This might be temporary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4 text-sm">
                <p className="font-medium">What you can do:</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• Refresh the page to try again</li>
                  <li>• Go back to the dashboard</li>
                  <li>• Contact support if the problem persists</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                >
                  Refresh Page
                </Button>
                <Link href="/academy" className="flex-1">
                  <Button className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      }
      onError={(error, errorInfo) => {
        // Log to console in development
                
        // In production, send to error tracking service
        // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

