'use client';
import { useState, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { resendVerificationEmail } from '@/modules/auth/actions';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');
  const [loading, setLoading] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email address not found. Please sign up again.');
      return;
    }

    setLoading(true);
    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        toast.error(result.error || 'Failed to resend email');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showError = error === 'access_denied' && errorCode === 'otp_expired';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${showError ? 'bg-red-100' : 'bg-blue-100'}`}>
              {showError ? (
                <AlertCircle className="w-8 h-8 text-red-600" />
              ) : (
                <Mail className="w-8 h-8 text-blue-600" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {showError ? 'Email Link Expired' : 'Verify Your Email'}
          </CardTitle>
          <CardDescription className="text-base">
            {showError 
              ? 'The verification link has expired or is invalid' 
              : 'Please check your email to continue'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showError ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {errorDescription || 'Email verification link has expired'}
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                Email verification links expire after a short period for security reasons. 
                Please request a new verification email below.
              </p>

              {email && (
                <div className="space-y-3">
                  <Button 
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 w-4 h-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500">
                    We'll send a new verification email to: <strong>{email}</strong>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  We've sent a verification email to <strong>{email}</strong>
                </p>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Check your inbox (and spam folder if needed)</li>
                  <li>Click the verification link in the email</li>
                  <li>Complete your profile setup</li>
                  <li>Start learning!</li>
                </ol>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 border-t">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">
                Go to Login
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/signup">
                Back to Signup
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}

