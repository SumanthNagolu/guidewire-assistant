import { Suspense } from 'react';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TeamSidebar from '@/components/productivity/TeamSidebar';
import EmployeeDashboard from '@/components/productivity/EmployeeDashboard';
// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full p-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
export default async function AIProductivityDashboard() {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Allow access in development without auth for testing
  let currentUserId: string;
  let isAdmin = false;
  if (!user && process.env.NODE_ENV === 'development') {
    // Development mode: use test user
    const { data: testProfile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('id, role')
      .eq('email', 'admin@intimesolutions.com')
      .single();
    if (profileError || !testProfile) {
      return (
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">🚀 Setup Required</h1>
            <p className="mb-4">Please run the database migration to create AI productivity tables:</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
              <p className="font-semibold mb-2">Step 1: Run Migration</p>
              <p className="text-sm mb-2">Open Supabase SQL Editor and execute:</p>
              <pre className="bg-white p-3 rounded text-xs border">
                database/ai-productivity-complete-schema.sql
              </pre>
            </div>
            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <p className="font-semibold mb-2">Step 2: Add API Key</p>
              <p className="text-sm mb-2">Add to .env.local:</p>
              <pre className="bg-white p-3 rounded text-xs border">
                ANTHROPIC_API_KEY=your_key_here
              </pre>
            </div>
            {profileError && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Database Error:</strong> {profileError.message || 'Unknown error'}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    currentUserId = testProfile.id;
    isAdmin = testProfile.role === 'admin';
  } else if (!user) {
    redirect('/employee/login');
  } else {
    currentUserId = user.id;
    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Productivity Intelligence
            </h1>
            <p className="text-sm text-gray-600">Powered by Claude Opus • Real-time Insights</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {isAdmin ? 'Admin Dashboard' : 'My Productivity'}
              </p>
              <p className="text-xs text-gray-500">Live Monitoring</p>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Team Sidebar - Fixed */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto shadow-lg">
          <Suspense fallback={<LoadingSpinner />}>
            <TeamSidebar isAdmin={isAdmin} currentUserId={currentUserId} />
          </Suspense>
        </aside>
        {/* Main Dashboard - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<LoadingSpinner />}>
            <EmployeeDashboard currentUserId={currentUserId} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
