import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PlatformSidebar } from '@/components/platform/platform-sidebar';
import { PlatformHeader } from '@/components/platform/platform-header';
import { SupabaseProvider } from '@/providers/supabase-provider';
export default async function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  // Check if user has platform access
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  // For demo/testing: Allow access if no profile or treat as admin
  // In production, uncomment the redirect below
  // if (!profile || !['admin', 'manager', 'recruiter', 'sourcer', 'screener'].includes(profile.role)) {
  //   redirect('/academy');
  // }
  return (
    <SupabaseProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <PlatformSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <PlatformHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SupabaseProvider>
  );
}
