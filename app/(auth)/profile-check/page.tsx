'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfileCheckPage() {
  const [status, setStatus] = useState<{
    user: any;
    profile: any;
    error: string | null;
  }>({
    user: null,
    profile: null,
    error: null,
  });

  useEffect(() => {
    async function checkStatus() {
      const supabase = createClient();
      
      try {
        // Check auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          setStatus({ user: null, profile: null, error: authError.message });
          return;
        }

        if (!user) {
          setStatus({ user: null, profile: null, error: 'Not authenticated' });
          return;
        }

        // Check for duplicate profiles first
        const { data: allProfiles, error: countError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id);

        if (countError) {
          setStatus({ 
            user, 
            profile: null, 
            error: `Profile query error: ${countError.message}` 
          });
          return;
        }

        if (!allProfiles || allProfiles.length === 0) {
          setStatus({ 
            user, 
            profile: null, 
            error: 'No profile found. Please run the setup script in Supabase.' 
          });
          return;
        }

        if (allProfiles.length > 1) {
          setStatus({ 
            user, 
            profile: null, 
            error: `DUPLICATE PROFILES FOUND! You have ${allProfiles.length} profiles. Run FIX-DUPLICATE-PROFILE.sql in Supabase to fix this.` 
          });
          return;
        }

        setStatus({ user, profile: allProfiles[0], error: null });
      } catch (err) {
        setStatus({ 
          user: null, 
          profile: null, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }

    checkStatus();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Profile Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{status.error}</p>
            </div>
          )}

          {status.user && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Auth Status: ✅ Authenticated</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(
                  {
                    id: status.user.id,
                    email: status.user.email,
                    created_at: status.user.created_at,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {status.profile && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Profile Status</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(status.profile, null, 2)}
              </pre>
              
              {status.profile.onboarding_completed ? (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    ✅ Onboarding completed - You should be able to access the dashboard
                  </p>
                  <Link href="/dashboard">
                    <Button className="mt-2">Go to Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Onboarding NOT completed - Need to complete profile setup
                  </p>
                  <Link href="/profile-setup">
                    <Button className="mt-2">Complete Profile Setup</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {!status.user && !status.error && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Link href="/login">
              <Button variant="outline">Go to Login</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

