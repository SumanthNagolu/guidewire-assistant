import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CEODashboard from '@/components/admin/CEODashboard';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/employee/login');
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/employee/dashboard');
  }

  return <CEODashboard />;
}

