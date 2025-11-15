import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export default async function ProductivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Allow development mode without authentication
  if (!user && process.env.NODE_ENV === 'development') {
    // Check if there's at least one user profile for testing
    const { data: testProfile } = await adminClient
      .from('user_profiles')
      .select('id, role')
      .eq('email', 'admin@intimesolutions.com')
      .single();
    if (!testProfile) {
      return (
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Setup Required</h1>
            <p className="mb-4">No test user found. Please run the database migration first.</p>
            <pre className="bg-gray-100 p-4 rounded text-sm">
              Run in Supabase SQL Editor:
              database/ai-productivity-complete-schema.sql
            </pre>
          </div>
        </div>
      );
    }
    // Allow access in dev mode
  } else if (!user) {
    redirect('/employee/login');
  }
  // Check if user is employee/admin (only if actually logged in)
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const allowedRoles = ['admin', 'recruiter', 'sales', 'operations', 'employee'];
    const userRole = profile?.role ?? '';
    if (!allowedRoles.includes(userRole)) {
      redirect('/academy'); // Redirect non-employees to academy
    }
  }
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
