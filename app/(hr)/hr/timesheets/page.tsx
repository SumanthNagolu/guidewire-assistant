import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import TimesheetCalendar from '@/components/hr/timesheets/TimesheetCalendar';
import TimesheetTable from '@/components/hr/timesheets/TimesheetTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'Timesheets | HR Portal',
  description: 'Manage employee timesheets and attendance',
};
export default async function TimesheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  // Get employee details
  const { data: employee } = await supabase
    .from('employees')
    .select('*, hr_roles(name, permissions)')
    .eq('user_id', user.id)
    .single();
  const isHROrManager = employee?.hr_roles?.permissions?.hr || employee?.hr_roles?.permissions?.team;
  // Determine date range
  const currentDate = new Date();
  const year = parseInt(searchParams.year || currentDate.getFullYear().toString());
  const month = parseInt(searchParams.month || (currentDate.getMonth() + 1).toString());
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  // Fetch timesheets for the current period
  const timesheetsQuery = supabase
    .from('timesheets')
    .select(`
      *,
      employees!timesheets_employee_id_fkey(first_name, last_name, employee_id),
      work_shifts(name, start_time, end_time)
    `)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: false });
  // If not HR/Manager, only show own timesheets
  if (!isHROrManager) {
    timesheetsQuery.eq('employee_id', employee?.id);
  }
  const { data: timesheets } = await timesheetsQuery;
  // Calculate stats
  const stats = {
    total: timesheets?.length || 0,
    submitted: timesheets?.filter(t => t.status === 'Submitted').length || 0,
    approved: timesheets?.filter(t => t.status === 'Approved').length || 0,
    rejected: timesheets?.filter(t => t.status === 'Rejected').length || 0,
    totalHours: timesheets?.reduce((sum, t) => sum + (t.total_hours || 0), 0) || 0,
    overtimeHours: timesheets?.reduce((sum, t) => sum + (t.overtime_hours || 0), 0) || 0,
  };
  const view = searchParams.view || 'calendar';
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-gray-600 mt-1">Track and manage work hours</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" asChild>
            <Link href="/hr/timesheets/clock">
              <Clock className="h-4 w-4 mr-2" />
              Clock In/Out
            </Link>
          </Button>
          {isHROrManager && (
            <Button asChild>
              <Link href="/hr/timesheets/approvals">
                <CheckCircle className="h-4 w-4 mr-2" />
                Pending Approvals ({stats.submitted})
              </Link>
            </Button>
          )}
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submitted}</div>
            <p className="text-xs text-gray-500">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-gray-500">Regular time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overtimeHours.toFixed(1)}h</div>
            <p className="text-xs text-gray-500">Extra hours</p>
          </CardContent>
        </Card>
      </div>
      {/* View Toggle */}
      <div className="flex space-x-2">
        <Button
          variant={view === 'calendar' ? 'default' : 'outline'}
          asChild
        >
          <Link href="/hr/timesheets?view=calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Link>
        </Button>
        <Button
          variant={view === 'table' ? 'default' : 'outline'}
          asChild
        >
          <Link href="/hr/timesheets?view=table">
            <Clock className="h-4 w-4 mr-2" />
            Table View
          </Link>
        </Button>
      </div>
      {/* Content */}
      {view === 'calendar' ? (
        <TimesheetCalendar 
          timesheets={timesheets || []} 
          employeeId={employee?.id || ''}
          month={month}
          year={year}
        />
      ) : (
        <TimesheetTable 
          timesheets={timesheets || []}
          canApprove={isHROrManager || false}
        />
      )}
    </div>
  );
}
