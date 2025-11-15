import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardStats from '@/components/hr/dashboard/DashboardStats';
import AttendanceOverview from '@/components/hr/dashboard/AttendanceOverview';
import PendingApprovals from '@/components/hr/dashboard/PendingApprovals';
import UpcomingEvents from '@/components/hr/dashboard/UpcomingEvents';
import QuickActions from '@/components/hr/dashboard/QuickActions';
import RecentActivities from '@/components/hr/dashboard/RecentActivities';
export const metadata: Metadata = {
  title: 'HR Dashboard | IntimeSolutions',
  description: 'Human Resources Management Dashboard',
};
export default async function HRDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }
  // Fetch employee details
  const { data: employee } = await supabase
    .from('employees')
    .select('*, hr_roles(name, permissions), departments(name)')
    .eq('user_id', user.id)
    .single();
  // Fetch dashboard statistics
  const [
    { count: totalEmployees },
    { count: activeLeaveRequests },
    { count: pendingExpenses },
    { count: todayAttendance }
  ] = await Promise.all([
    supabase.from('employees').select('*', { count: 'exact', head: true }).eq('employment_status', 'Active'),
    supabase.from('leave_requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabase.from('expense_claims').select('*', { count: 'exact', head: true }).eq('status', 'Submitted'),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', new Date().toISOString().split('T')[0]).eq('status', 'Present')
  ]);
  const stats = {
    totalEmployees: totalEmployees || 0,
    activeLeaveRequests: activeLeaveRequests || 0,
    pendingExpenses: pendingExpenses || 0,
    todayAttendance: todayAttendance || 0,
  };
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {employee?.first_name}!
        </h1>
        <p className="text-indigo-100">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      {/* Quick Actions for Employees */}
      {employee && <QuickActions employee={employee} />}
      {/* Stats Overview */}
      <DashboardStats stats={stats} />
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 cols wide */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Overview */}
          <AttendanceOverview />
          {/* Pending Approvals (for managers/HR) */}
          {(employee?.hr_roles?.permissions?.hr || 
            employee?.hr_roles?.permissions?.team) && (
            <PendingApprovals employeeId={employee.id} />
          )}
          {/* Recent Activities */}
          <RecentActivities />
        </div>
        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
}
