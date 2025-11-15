'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Thank You!</CardTitle>
          <CardDescription className="text-base">
            Your account has been created successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">
                  Check your email
                </p>
                <p className="text-sm text-gray-600">
                  We've sent a confirmation link to <strong>{email}</strong>
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium text-gray-900">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Check your inbox (and spam folder if needed)</li>
                <li>Click the confirmation link in the email</li>
                <li>Complete your profile setup</li>
                <li>Start your Guidewire learning journey!</li>
              </ol>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Didn't receive the email?</strong> Check your spam folder or{' '}
                <Link href="/login" className="underline font-medium">
                  try logging in
                </Link>{' '}
                if you've already confirmed your email.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t">
            <Button asChild className="w-full">
              <Link href="/academy-info">
                Visit Academy Page
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                Go to Home Page
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentSignupConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}

