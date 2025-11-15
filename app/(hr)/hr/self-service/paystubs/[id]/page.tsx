import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Mail, Printer } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'View Pay Stub | Employee Portal',
};

export default async function ViewPayStubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Get employee details
  const { data: employee } = await supabase
    .from('employees')
    .select('id, employee_id, first_name, last_name, departments(name)')
    .eq('user_id', user.id)
    .single();

  if (!employee) {
    redirect('/hr/dashboard');
  }

  // Get pay stub - TC-PAY-033
  const { data: payStub } = await supabase
    .from('pay_stubs')
    .select('*, payroll_cycles(name, start_date, end_date)')
    .eq('id', id)
    .eq('employee_id', employee.id) // Security: can only view own pay stubs
    .single();

  if (!payStub) {
    redirect('/hr/self-service/paystubs');
  }

  // Mark as viewed
  if (payStub.status !== 'Viewed' && payStub.status !== 'Downloaded') {
    await supabase
      .from('pay_stubs')
      .update({ 
        status: 'Viewed',
        viewed_at: new Date().toISOString()
      })
      .eq('id', id);
  }

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownload = async () => {
    // TC-PAY-034: Download action
    // Would trigger PDF generation/download here
    // For now, just mark as downloaded
    await supabase
      .from('pay_stubs')
      .update({ 
        status: 'Downloaded',
        downloaded_at: new Date().toISOString()
      })
      .eq('id', id);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/hr/self-service/paystubs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pay Stub</h1>
            <p className="text-gray-600 mt-1">
              {payStub.payroll_cycles?.name || 'Pay Stub Details'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {/* TC-PAY-035 */}
          <Button variant="outline" size="sm" disabled>
            <Mail className="h-4 w-4 mr-2" />
            Email to Me
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {/* TC-PAY-034 */}
          <form action={handleDownload}>
            <Button variant="default" size="sm" type="submit">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </form>
        </div>
      </div>

      {/* Pay Stub Document - TC-PAY-033 */}
      <Card className="print:shadow-none">
        <CardContent className="pt-8 pb-8">
          {/* Company Header */}
          <div className="text-center border-b pb-6 mb-6">
            <h2 className="text-3xl font-bold text-gray-900">INTIMESOLUTIONS</h2>
            <p className="text-gray-600 mt-2">PAY STUB</p>
          </div>

          {/* Employee & Pay Period Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Employee Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{employee.first_name} {employee.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Employee ID:</span>
                  <span className="font-medium">{employee.employee_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{employee.departments?.name || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Pay Period</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">
                    {formatDate(payStub.pay_period_start)} - {formatDate(payStub.pay_period_end)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date:</span>
                  <span className="font-medium">
                    {payStub.payment_date ? formatDate(payStub.payment_date) : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{payStub.payment_method}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Side by Side */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* EARNINGS */}
            <div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-t-lg p-3">
                <h3 className="font-bold text-emerald-900">EARNINGS</h3>
              </div>
              <div className="border border-t-0 border-emerald-200 rounded-b-lg p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2">
                    <span className="font-medium text-gray-700">Description</span>
                    <span className="font-medium text-gray-700">Amount</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span className="font-medium">{formatCurrency(payStub.basic_salary)}</span>
                  </div>

                  {/* Allowances */}
                  {payStub.allowances && Object.keys(payStub.allowances).length > 0 && (
                    <>
                      {Object.entries(payStub.allowances).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium">{formatCurrency(value as number)}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Bonuses */}
                  {payStub.bonuses && Object.keys(payStub.bonuses).length > 0 && (
                    <>
                      {Object.entries(payStub.bonuses).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium">{formatCurrency(value as number)}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Overtime */}
                  {payStub.overtime_amount && Number(payStub.overtime_amount) > 0 && (
                    <div className="flex justify-between">
                      <span>Overtime Pay</span>
                      <span className="font-medium">{formatCurrency(payStub.overtime_amount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t-2 pt-3 font-bold text-emerald-700">
                    <span>Gross Earnings</span>
                    <span>{formatCurrency(payStub.gross_pay)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DEDUCTIONS */}
            <div>
              <div className="bg-red-50 border border-red-200 rounded-t-lg p-3">
                <h3 className="font-bold text-red-900">DEDUCTIONS</h3>
              </div>
              <div className="border border-t-0 border-red-200 rounded-b-lg p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2">
                    <span className="font-medium text-gray-700">Description</span>
                    <span className="font-medium text-gray-700">Amount</span>
                  </div>
                  
                  {payStub.deductions && Object.keys(payStub.deductions).length > 0 ? (
                    <>
                      {Object.entries(payStub.deductions).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium">{formatCurrency(value as number)}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-gray-500 text-center py-4">No deductions</div>
                  )}

                  {/* Adjustments */}
                  {payStub.adjustment_amount && Number(payStub.adjustment_amount) !== 0 && (
                    <div className="flex justify-between">
                      <span>Adjustments</span>
                      <span className="font-medium">{formatCurrency(payStub.adjustment_amount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t-2 pt-3 font-bold text-red-700">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(payStub.total_deductions)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NET PAY - Highlighted */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-indigo-200 text-sm mb-1">NET PAY</p>
                <p className="text-4xl font-bold">{formatCurrency(payStub.net_pay)}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-200 text-sm">Payment Method</p>
                <p className="text-lg font-semibold">{payStub.payment_method}</p>
                {payStub.bank_account_last4 && (
                  <p className="text-sm text-indigo-200">Acc: ****{payStub.bank_account_last4}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="border-t pt-4 text-xs text-gray-500 text-center space-y-1">
            <p>This is a computer-generated pay stub and does not require a signature.</p>
            <p>For any queries, please contact HR at hr@intimesolutions.com</p>
            <p className="font-medium text-gray-700 mt-2">Pay Stub ID: {payStub.stub_number}</p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info Card */}
      <Card className="bg-gray-50 border-gray-200 print:hidden">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Understanding Your Pay Stub</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-emerald-700 mb-1">Gross Pay</p>
              <p>Total earnings before any deductions are applied</p>
            </div>
            <div>
              <p className="font-semibold text-red-700 mb-1">Deductions</p>
              <p>Taxes, insurance, and other withholdings subtracted from gross pay</p>
            </div>
            <div>
              <p className="font-semibold text-indigo-700 mb-1">Net Pay</p>
              <p>Take-home amount deposited to your bank account</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

