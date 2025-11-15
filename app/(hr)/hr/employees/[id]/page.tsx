import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Building2, Mail, Phone, Calendar, MapPin, 
  FileText, Clock, DollarSign, Edit, Trash2, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Employee Profile | HR Portal',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmployeeProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Fetch employee details
  const { data: employee } = await supabase
    .from('employees')
    .select(`
      *,
      departments(id, name, code),
      hr_roles(id, name),
      reporting_manager:employees!employees_reporting_manager_id_fkey(
        id, first_name, last_name, employee_id
      )
    `)
    .eq('id', id)
    .single();

  if (!employee) {
    redirect('/hr/employees');
  }

  // Fetch leave balances
  const { data: leaveBalances } = await supabase
    .from('leave_balances')
    .select(`
      *,
      leave_types(name, code)
    `)
    .eq('employee_id', id)
    .eq('year', new Date().getFullYear());

  // Fetch recent leave requests
  const { data: leaveRequests } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent timesheets
  const { data: timesheets } = await supabase
    .from('timesheets')
    .select('*')
    .eq('employee_id', id)
    .order('date', { ascending: false })
    .limit(10);

  // Fetch recent expenses
  const { data: expenses } = await supabase
    .from('expense_claims')
    .select('*')
    .eq('employee_id', id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/hr/employees">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-gray-600 mt-1">
              {employee.employee_id} • {employee.designation}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/hr/employees/${id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <div className="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-indigo-600" />
            </div>
            <div className="flex-1 grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="font-medium">{employee.departments?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-medium">{employee.hr_roles?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge variant={employee.employment_status === 'Active' ? 'default' : 'secondary'}>
                  {employee.employment_status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Employment Type</p>
                <p className="font-medium">{employee.employment_type}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{employee.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Hire Date</p>
                <p className="font-medium">
                  {new Date(employee.hire_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Full Name:</span>{' '}
                  <span className="font-medium">
                    {employee.first_name} {employee.middle_name} {employee.last_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Date of Birth:</span>{' '}
                  <span className="font-medium">
                    {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Gender:</span>{' '}
                  <span className="font-medium">{employee.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Marital Status:</span>{' '}
                  <span className="font-medium">{employee.marital_status || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Nationality:</span>{' '}
                  <span className="font-medium">{employee.nationality || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Employee ID:</span>{' '}
                  <span className="font-medium font-mono">{employee.employee_id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Department:</span>{' '}
                  <span className="font-medium">{employee.departments?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Role:</span>{' '}
                  <span className="font-medium">{employee.hr_roles?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Designation:</span>{' '}
                  <span className="font-medium">{employee.designation}</span>
                </div>
                <div>
                  <span className="text-gray-600">Reporting To:</span>{' '}
                  <span className="font-medium">
                    {employee.reporting_manager
                      ? `${employee.reporting_manager.first_name} ${employee.reporting_manager.last_name}`
                      : 'No manager assigned'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Hire Date:</span>{' '}
                  <span className="font-medium">
                    {new Date(employee.hire_date).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Work Email:</span>{' '}
                  <span className="font-medium">{employee.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Personal Email:</span>{' '}
                  <span className="font-medium">{employee.personal_email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>{' '}
                  <span className="font-medium">{employee.phone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Alternate Phone:</span>{' '}
                  <span className="font-medium">{employee.alternate_phone || 'N/A'}</span>
                </div>
                {employee.current_address && (
                  <div>
                    <span className="text-gray-600">Current Address:</span>{' '}
                    <span className="font-medium">
                      {employee.current_address.street}, {employee.current_address.city},{' '}
                      {employee.current_address.state} {employee.current_address.zip}
                    </span>
                  </div>
                )}
                {employee.emergency_contact && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Emergency Contact:</p>
                    <p className="font-medium">{employee.emergency_contact.name}</p>
                    <p className="text-xs text-gray-600">
                      {employee.emergency_contact.relationship} • {employee.emergency_contact.phone}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Leave Requests</span>
                  <span className="font-medium">{leaveRequests?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Timesheets</span>
                  <span className="font-medium">{timesheets?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Expense Claims</span>
                  <span className="font-medium">{expenses?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-gray-600">Tenure</span>
                  <span className="font-medium">
                    {Math.floor((new Date().getTime() - new Date(employee.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave Balances - {new Date().getFullYear()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {leaveBalances?.map((balance: any) => (
                  <div key={balance.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">
                      {balance.leave_types?.name}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entitled:</span>
                        <span className="font-medium">{balance.entitled_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Used:</span>
                        <span className="text-red-600">{balance.used_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending:</span>
                        <span className="text-orange-600">{balance.pending_days} days</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-semibold">
                        <span>Available:</span>
                        <span className="text-green-600">{balance.balance_days} days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Leave Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {leaveRequests && leaveRequests.length > 0 ? (
                <div className="space-y-2">
                  {leaveRequests.map((request: any) => (
                    <div key={request.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(request.from_date).toLocaleDateString()} -{' '}
                            {new Date(request.to_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">{request.total_days} days</p>
                        </div>
                        <Badge variant={
                          request.status === 'Approved' ? 'default' :
                          request.status === 'Rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                      {request.reason && (
                        <p className="text-xs text-gray-600 mt-2">{request.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No leave requests yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Timesheets</CardTitle>
            </CardHeader>
            <CardContent>
              {timesheets && timesheets.length > 0 ? (
                <div className="space-y-2">
                  {timesheets.map((sheet: any) => (
                    <div key={sheet.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(sheet.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sheet.total_hours} hours
                            {sheet.overtime_hours > 0 && ` (OT: ${sheet.overtime_hours}h)`}
                          </p>
                        </div>
                        <Badge variant={
                          sheet.status === 'Approved' ? 'default' :
                          sheet.status === 'Rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {sheet.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No timesheets yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Expense Claims</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses && expenses.length > 0 ? (
                <div className="space-y-2">
                  {expenses.map((expense: any) => (
                    <div key={expense.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{expense.claim_number}</p>
                          <p className="text-xs text-gray-500">
                            ${expense.total_amount.toFixed(2)} • {new Date(expense.claim_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          expense.status === 'Approved' || expense.status === 'Paid' ? 'default' :
                          expense.status === 'Rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {expense.status}
                        </Badge>
                      </div>
                      {expense.description && (
                        <p className="text-xs text-gray-600 mt-2">{expense.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No expense claims yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employee Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Document management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

