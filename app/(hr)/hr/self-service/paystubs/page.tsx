import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Mail, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Pay Stubs | Employee Portal',
  description: 'View and download your pay stubs',
};

export default async function EmployeePayStubsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Get employee details
  const { data: employee } = await supabase
    .from('employees')
    .select('id, employee_id, first_name, last_name')
    .eq('user_id', user.id)
    .single();

  if (!employee) {
    redirect('/hr/dashboard');
  }

  // Get all pay stubs for this employee
  const { data: payStubs } = await supabase
    .from('pay_stubs')
    .select('*, payroll_cycles(name, start_date, end_date)')
    .eq('employee_id', employee.id)
    .order('pay_period_start', { ascending: false });

  // Calculate YTD stats
  const currentYear = new Date().getFullYear();
  const ytdStubs = payStubs?.filter(stub => 
    new Date(stub.pay_period_start).getFullYear() === currentYear &&
    stub.status !== 'Draft'
  ) || [];

  const ytdGross = ytdStubs.reduce((sum, stub) => sum + Number(stub.gross_pay || 0), 0);
  const ytdDeductions = ytdStubs.reduce((sum, stub) => sum + Number(stub.total_deductions || 0), 0);
  const ytdNet = ytdStubs.reduce((sum, stub) => sum + Number(stub.net_pay || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Pay Stubs</h1>
        <p className="text-gray-600 mt-1">
          View and download your salary information
        </p>
      </div>

      {/* YTD Summary Cards - TC-PAY-032 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">YTD Gross Pay</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(ytdGross)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Year to date {currentYear}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">YTD Deductions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(ytdDeductions)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total deducted</p>
              </div>
              <TrendingUp className="h-10 w-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">YTD Net Pay</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(ytdNet)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Take-home amount</p>
              </div>
              <DollarSign className="h-10 w-10 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pay Stubs List - TC-PAY-031 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pay Stubs for {currentYear}</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                <Download className="h-4 w-4 mr-2" />
                Download All as ZIP
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {payStubs && payStubs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Period</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Dates</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Gross Pay</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Net Pay</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payStubs.map((stub) => (
                    <tr key={stub.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {stub.payroll_cycles?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(stub.pay_period_start)} - {formatDate(stub.pay_period_end)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(stub.gross_pay)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">
                        {formatCurrency(stub.net_pay)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge 
                          className={stub.status === 'Generated' || stub.status === 'Sent' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'}
                        >
                          {stub.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <Link href={`/hr/self-service/paystubs/${stub.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          {stub.pdf_url && (
                            <a href={stub.pdf_url} download target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No pay stubs available yet</p>
              <p className="text-sm text-gray-400">
                Pay stubs will appear here once payroll is processed
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-indigo-900 mb-2">💡 About Your Pay Stubs</h3>
          <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
            <li>New pay stubs are generated at the end of each pay period</li>
            <li>Click "View" to see detailed earnings and deductions breakdown</li>
            <li>Download PDF copies for your records or tax filing</li>
            <li>YTD totals update automatically as new stubs are added</li>
            <li>Contact HR if you notice any discrepancies</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

