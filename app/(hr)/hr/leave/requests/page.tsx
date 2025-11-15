import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import LeaveRequestsTable from '@/components/hr/leave/LeaveRequestsTable';
import LeaveBalanceCard from '@/components/hr/leave/LeaveBalanceCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'Leave Requests | HR Portal',
  description: 'Manage employee leave requests and approvals',
};
export default async function LeaveRequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // Get employee details
  const { data: employee } = await supabase
    .from('employees')
    .select('*, hr_roles(name, permissions)')
    .eq('user_id', user.id)
    .single();
  const isHROrManager = employee?.hr_roles?.permissions?.hr || employee?.hr_roles?.permissions?.team;
  // Fetch leave requests
  const leaveRequestsQuery = supabase
    .from('leave_requests')
    .select(`
      *,
      employees!leave_requests_employee_id_fkey(first_name, last_name, employee_id),
      leave_types(name, code, days_per_year),
      approver:employees!leave_requests_approved_by_fkey(first_name, last_name)
    `)
    .order('created_at', { ascending: false });
  // If not HR/Manager, only show own requests
  if (!isHROrManager) {
    leaveRequestsQuery.eq('employee_id', employee?.id);
  }
  const { data: leaveRequests } = await leaveRequestsQuery;
  // Get leave balances for current user
  const currentYear = new Date().getFullYear();
  const { data: leaveBalances } = await supabase
    .from('leave_balances')
    .select(`
      *,
      leave_types(name, code, days_per_year)
    `)
    .eq('employee_id', employee?.id || '')
    .eq('year', currentYear);
  // Calculate stats
  const stats = {
    total: leaveRequests?.length || 0,
    pending: leaveRequests?.filter(r => r.status === 'Pending').length || 0,
    approved: leaveRequests?.filter(r => r.status === 'Approved').length || 0,
    rejected: leaveRequests?.filter(r => r.status === 'Rejected').length || 0,
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-600 mt-1">Manage leave applications and balances</p>
        </div>
        <Button asChild>
          <Link href="/hr/leave/apply">
            <Plus className="h-4 w-4 mr-2" />
            Apply for Leave
          </Link>
        </Button>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-gray-500">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-gray-500">Confirmed leaves</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-gray-500">Declined requests</p>
          </CardContent>
        </Card>
      </div>
      {/* Leave Balance (for employees) */}
      {!isHROrManager && leaveBalances && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaveBalances.map((balance) => (
            <LeaveBalanceCard key={balance.id} balance={balance} />
          ))}
        </div>
      )}
      {/* Leave Requests Table */}
      <LeaveRequestsTable 
        leaveRequests={leaveRequests || []}
        canApprove={isHROrManager || false}
      />
    </div>
  );
}
