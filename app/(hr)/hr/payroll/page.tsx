import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, FileText, PlusCircle, Settings, HelpCircle, BarChart3, Download, History } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Payroll Management | HR Portal',
  description: 'Manage employee payroll and pay stubs',
};

export default async function PayrollDashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Check permissions - Only HR Manager/Payroll role can access
  const { data: employee } = await supabase
    .from('employees')
    .select('*, hr_roles(permissions)')
    .eq('user_id', user.id)
    .single();

  if (!employee?.hr_roles?.permissions?.view_payroll && !employee?.hr_roles?.permissions?.admin) {
    redirect('/hr/dashboard');
  }

  // Fetch recent payroll cycles
  const { data: cycles } = await supabase
    .from('payroll_cycles')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(10);

  // Get current cycle (most recent Draft or Processing)
  const currentCycle = cycles?.find(c => c.status === 'Draft' || c.status === 'Processing');

  // Calculate stats
  const totalCycles = cycles?.length || 0;
  const processedCycles = cycles?.filter(c => c.status === 'Processed').length || 0;
  const totalPayrollThisYear = cycles
    ?.filter(c => c.status === 'Processed' && new Date(c.start_date).getFullYear() === new Date().getFullYear())
    .reduce((sum, c) => sum + Number(c.total_net || 0), 0) || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Processed': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">
            Process monthly payroll and manage pay stubs
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/hr/payroll/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link href="/hr/help/payroll">
            <Button variant="outline" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </Link>
        </div>
      </div>

      {/* Current Cycle Banner */}
      {currentCycle && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-semibold">Current Payroll Cycle</p>
                <h3 className="text-2xl font-bold text-indigo-900 mt-1">{currentCycle.name}</h3>
                <p className="text-sm text-indigo-700 mt-1">
                  {formatDate(currentCycle.start_date)} - {formatDate(currentCycle.end_date)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-indigo-600">Total Employees</p>
                  <p className="text-2xl font-bold text-indigo-900">{currentCycle.total_employees}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-indigo-600">Total Cost</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {formatCurrency(currentCycle.total_net || 0)}
                  </p>
                </div>
                <Badge className={getStatusColor(currentCycle.status)}>
                  {currentCycle.status}
                </Badge>
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <Link href={`/hr/payroll/${currentCycle.id}`}>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Review & Process
                </Button>
              </Link>
              <Link href={`/hr/payroll/reports?cycle=${currentCycle.id}`}>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Run Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cycles</p>
                <p className="text-3xl font-bold">{totalCycles}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-3xl font-bold">{processedCycles}</p>
              </div>
              <Users className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">YTD Payroll</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPayrollThisYear)}</p>
              </div>
              <DollarSign className="h-10 w-10 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-3xl font-bold">{employee?.id ? 'All' : '0'}</p>
              </div>
              <Users className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Link href="/hr/payroll/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Cycle
          </Button>
        </Link>
        <Link href="/hr/payroll/reports">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </Link>
        <Link href="/hr/payroll/export">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </Link>
      </div>

      {/* Recent Payroll Cycles Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Payroll Cycles</CardTitle>
            <Link href="/hr/payroll/history">
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {cycles && cycles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Period</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Dates</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Employees</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Total Cost</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map((cycle) => (
                    <tr key={cycle.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{cycle.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}
                      </td>
                      <td className="py-3 px-4 text-right">{cycle.total_employees}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(cycle.total_net || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(cycle.status)}>
                          {cycle.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/hr/payroll/${cycle.id}`}>
                          <Button variant="outline" size="sm">
                            {cycle.status === 'Draft' ? 'Review' : 'View'}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No payroll cycles created yet</p>
              <Link href="/hr/payroll/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Cycle
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/hr/payroll/reports/summary" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <BarChart3 className="h-8 w-8 text-indigo-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Payroll Summary</h4>
                <p className="text-sm text-gray-600 mt-1">View detailed payroll reports</p>
              </div>
            </Link>
            <Link href="/hr/payroll/export" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <Download className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Export Data</h4>
                <p className="text-sm text-gray-600 mt-1">Export to accounting software</p>
              </div>
            </Link>
            <Link href="/hr/payroll/audit" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <History className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Audit Trail</h4>
                <p className="text-sm text-gray-600 mt-1">View all payroll changes</p>
              </div>
            </Link>
            <Link href="/hr/payroll/settings" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <Settings className="h-8 w-8 text-amber-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Configure</h4>
                <p className="text-sm text-gray-600 mt-1">Salary components & settings</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

