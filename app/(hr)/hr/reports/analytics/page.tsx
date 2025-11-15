import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployeeAnalytics from '@/components/hr/reports/EmployeeAnalytics';
import AttendanceReport from '@/components/hr/reports/AttendanceReport';
import LeaveReport from '@/components/hr/reports/LeaveReport';
import ExpenseReport from '@/components/hr/reports/ExpenseReport';
import { BarChart3, Users, Calendar, DollarSign, Clock } from 'lucide-react';
export const metadata: Metadata = {
  title: 'HR Analytics | HR Portal',
  description: 'Comprehensive HR analytics and reports',
};
export default async function HRAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // Get current year and month
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  // Fetch comprehensive analytics data
  const [
    { data: employees },
    { data: leaveRequests },
    { data: expenseClaims },
    { data: timesheets },
    { data: departments },
  ] = await Promise.all([
    supabase.from('employees').select('*').eq('employment_status', 'Active'),
    supabase.from('leave_requests').select('*, leave_types(name)').gte('from_date', `${currentYear}-01-01`),
    supabase.from('expense_claims').select('*').gte('claim_date', `${currentYear}-01-01`),
    supabase.from('timesheets').select('*').gte('date', `${currentYear}-01-01`),
    supabase.from('departments').select('*, employees(id)').eq('is_active', true),
  ]);
  // Calculate summary stats
  const stats = {
    totalEmployees: employees?.length || 0,
    totalDepartments: departments?.length || 0,
    leaveRequestsThisYear: leaveRequests?.length || 0,
    totalExpensesClaimed: expenseClaims?.reduce((sum, claim) => sum + claim.total_amount, 0) || 0,
    totalHoursWorked: timesheets?.reduce((sum, ts) => sum + (ts.total_hours || 0), 0) || 0,
    averageAttendance: timesheets ? (timesheets.length / (employees?.length || 1)) : 0,
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive insights and reports</p>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-gray-500">{stats.totalDepartments} departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leaveRequestsThisYear}</div>
            <p className="text-xs text-gray-500">{currentYear} YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses Claimed</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalExpensesClaimed.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">{currentYear} YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalHoursWorked.toLocaleString()}h
            </div>
            <p className="text-xs text-gray-500">{currentYear} YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageAttendance.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
      </div>
      {/* Detailed Reports Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports</CardTitle>
          <CardDescription>View comprehensive analytics across different modules</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="employees" className="space-y-4">
            <TabsList>
              <TabsTrigger value="employees">
                <Users className="h-4 w-4 mr-2" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="attendance">
                <Clock className="h-4 w-4 mr-2" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="leave">
                <Calendar className="h-4 w-4 mr-2" />
                Leave
              </TabsTrigger>
              <TabsTrigger value="expense">
                <DollarSign className="h-4 w-4 mr-2" />
                Expenses
              </TabsTrigger>
            </TabsList>
            <TabsContent value="employees" className="space-y-4">
              <EmployeeAnalytics 
                employees={employees || []}
                departments={departments || []}
              />
            </TabsContent>
            <TabsContent value="attendance" className="space-y-4">
              <AttendanceReport 
                timesheets={timesheets || []}
                employees={employees || []}
              />
            </TabsContent>
            <TabsContent value="leave" className="space-y-4">
              <LeaveReport 
                leaveRequests={leaveRequests || []}
                employees={employees || []}
              />
            </TabsContent>
            <TabsContent value="expense" className="space-y-4">
              <ExpenseReport 
                expenseClaims={expenseClaims || []}
                employees={employees || []}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
