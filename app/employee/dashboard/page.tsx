import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RecruiterDashboard from '@/components/employee/dashboards/RecruiterDashboard';
import SalesDashboard from '@/components/employee/dashboards/SalesDashboard';
import OperationsDashboard from '@/components/employee/dashboards/OperationsDashboard';
import EmployeeDashboard from '@/components/employee/dashboards/EmployeeDashboard';
import SourcerDashboard from '@/components/employee/dashboards/SourcerDashboard';

export default async function EmployeeDashboardPage() {
  const supabase = await createClient() as any; // Type cast for CRM tables

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/employee/login');
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, first_name, last_name, email, department, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/employee/login');
  }

  // Check if user is an employee (not a student)
  const employeeRoles = ['admin', 'recruiter', 'sales', 'account_manager', 'operations', 'employee'];
  
  if (!employeeRoles.includes(profile.role)) {
    // Student trying to access employee portal
    redirect('/dashboard'); // Redirect to student dashboard
  }

  // Check for pod-specific role FIRST (sourcer, screener, account_manager)
  // This allows admins to test pod roles
  const { data: podMember } = await supabase
    .from('pod_members')
    .select('role, pod_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  // If no pod role and user is admin, redirect to admin portal
  if (!podMember && profile.role === 'admin') {
    redirect('/admin');
  }

  // Route based on pod role first (more specific), then profile role
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pod-specific roles (most specific) */}
      {podMember?.role === 'sourcer' && <SourcerDashboard />}
      
      {/* Profile roles (fallback) */}
      {!podMember && profile.role === 'recruiter' && <RecruiterDashboard user={user} profile={profile} />}
      {!podMember && profile.role === 'sales' && <SalesDashboard user={user} profile={profile} />}
      {!podMember && (profile.role === 'account_manager' || profile.role === 'operations') && (
        <OperationsDashboard user={user} profile={profile} />
      )}
      {!podMember && profile.role === 'employee' && <EmployeeDashboard user={user} profile={profile} />}
    </div>
  );
}

