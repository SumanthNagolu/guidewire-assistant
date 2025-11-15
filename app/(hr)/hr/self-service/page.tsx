import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  User, 
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Edit,
  Download
} from 'lucide-react';
import Link from 'next/link';
import LeaveBalanceCard from '@/components/hr/leave/LeaveBalanceCard';
export const metadata: Metadata = {
  title: 'Employee Self-Service | HR Portal',
  description: 'Manage your HR information and requests',
};
export default async function EmployeeSelfServicePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // Get employee details
  const { data: employee } = await supabase
    .from('employees')
    .select(`
      *,
      departments(name),
      hr_roles(name),
      reporting_manager:employees!employees_reporting_manager_id_fkey(first_name, last_name)
    `)
    .eq('user_id', user.id)
    .single();
  // Get leave balances
  const currentYear = new Date().getFullYear();
  const { data: leaveBalances } = await supabase
    .from('leave_balances')
    .select(`
      *,
      leave_types(name, code, days_per_year)
    `)
    .eq('employee_id', employee?.id || '')
    .eq('year', currentYear);
  // Get recent requests
  const { data: recentLeaveRequests } = await supabase
    .from('leave_requests')
    .select('*, leave_types(name)')
    .eq('employee_id', employee?.id || '')
    .order('created_at', { ascending: false })
    .limit(3);
  const { data: recentExpenses } = await supabase
    .from('expense_claims')
    .select('*')
    .eq('employee_id', employee?.id || '')
    .order('claim_date', { ascending: false })
    .limit(3);
  const { data: recentTimesheets } = await supabase
    .from('timesheets')
    .select('*')
    .eq('employee_id', employee?.id || '')
    .order('date', { ascending: false })
    .limit(5);
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={employee?.profile_photo_url} />
                <AvatarFallback className="text-2xl">
                  {employee?.first_name?.[0]}{employee?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">
                  {employee?.first_name} {employee?.last_name}
                </h1>
                <p className="text-lg text-gray-600 mt-1">{employee?.designation}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge>{employee?.hr_roles?.name || 'Employee'}</Badge>
                  <Badge variant="outline">{employee?.employee_id}</Badge>
                  <Badge 
                    variant={employee?.employment_status === 'Active' ? 'default' : 'secondary'}
                  >
                    {employee?.employment_status}
                  </Badge>
                </div>
              </div>
            </div>
            <Button asChild>
              <Link href="/hr/profile/edit">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button asChild variant="outline" className="h-24 flex flex-col space-y-2">
          <Link href="/hr/timesheets/clock">
            <Clock className="h-6 w-6" />
            <span>Clock In/Out</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-24 flex flex-col space-y-2">
          <Link href="/hr/leave/apply">
            <Calendar className="h-6 w-6" />
            <span>Apply Leave</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-24 flex flex-col space-y-2">
          <Link href="/hr/expenses/new">
            <DollarSign className="h-6 w-6" />
            <span>Submit Expense</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-24 flex flex-col space-y-2">
          <Link href="/hr/documents/generate">
            <FileText className="h-6 w-6" />
            <span>Request Document</span>
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{employee?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{employee?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{employee?.departments?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Manager</p>
                  <p className="font-medium">
                    {employee?.reporting_manager 
                      ? `${employee.reporting_manager.first_name} ${employee.reporting_manager.last_name}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Join Date</p>
                  <p className="font-medium">
                    {new Date(employee?.hire_date || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Employment Type</p>
                  <p className="font-medium">{employee?.employment_type || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Recent Timesheets */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Timesheets</CardTitle>
                <Button variant="link" asChild>
                  <Link href="/hr/timesheets">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentTimesheets && recentTimesheets.length > 0 ? (
                <div className="space-y-3">
                  {recentTimesheets.map((ts) => (
                    <div key={ts.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{new Date(ts.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">{ts.total_hours?.toFixed(2)}h</p>
                      </div>
                      <Badge>{ts.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No timesheets found</p>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Right Column */}
        <div className="space-y-6">
          {/* Leave Balances */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Leave Balances</h3>
            {leaveBalances && leaveBalances.length > 0 ? (
              <div className="space-y-3">
                {leaveBalances.map((balance) => (
                  <LeaveBalanceCard key={balance.id} balance={balance} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-6 text-gray-500">
                  No leave balances available
                </CardContent>
              </Card>
            )}
          </div>
          {/* Recent Leave Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLeaveRequests && recentLeaveRequests.length > 0 ? (
                <div className="space-y-3">
                  {recentLeaveRequests.map((lr) => (
                    <div key={lr.id} className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{lr.leave_types?.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(lr.from_date).toLocaleDateString()} - {new Date(lr.to_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">{lr.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No leave requests</p>
              )}
            </CardContent>
          </Card>
          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {recentExpenses && recentExpenses.length > 0 ? (
                <div className="space-y-3">
                  {recentExpenses.map((exp) => (
                    <div key={exp.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="text-sm font-medium">{exp.claim_number}</p>
                        <p className="text-xs text-gray-500">
                          ${exp.total_amount.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{exp.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No expense claims</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
