"use client";
import Link from "next/link";
import { useEffect } from "react";
import * as Sentry from '@sentry/nextjs';
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 px-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold text-trust-blue">Unexpected error</h1>
        <p className="text-wisdom-gray">
          Something broke on our side. Try again, or head back to the homepage while we fix it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-trust-blue text-white font-semibold hover:bg-trust-blue-600 transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-trust-blue text-trust-blue font-semibold hover:bg-trust-blue/10 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
