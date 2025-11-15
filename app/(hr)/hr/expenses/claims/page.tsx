import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ExpenseClaimsTable from '@/components/hr/expenses/ExpenseClaimsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'Expense Claims | HR Portal',
  description: 'Manage expense claims and reimbursements',
};
export default async function ExpenseClaimsPage() {
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
  // Fetch expense claims
  const claimsQuery = supabase
    .from('expense_claims')
    .select(`
      *,
      employees!expense_claims_employee_id_fkey(first_name, last_name, employee_id),
      approver:employees!expense_claims_approved_by_fkey(first_name, last_name),
      expense_items(
        id,
        amount,
        expense_categories(name)
      )
    `)
    .order('claim_date', { ascending: false });
  // If not HR/Manager, only show own claims
  if (!isHROrManager) {
    claimsQuery.eq('employee_id', employee?.id);
  }
  const { data: expenseClaims } = await claimsQuery;
  // Calculate stats
  const stats = {
    total: expenseClaims?.length || 0,
    pending: expenseClaims?.filter(c => c.status === 'Submitted').length || 0,
    approved: expenseClaims?.filter(c => c.status === 'Approved').length || 0,
    paid: expenseClaims?.filter(c => c.status === 'Paid').length || 0,
    totalAmount: expenseClaims?.reduce((sum, c) => sum + c.total_amount, 0) || 0,
    pendingAmount: expenseClaims?.filter(c => c.status === 'Submitted').reduce((sum, c) => sum + c.total_amount, 0) || 0,
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Claims</h1>
          <p className="text-gray-600 mt-1">Manage expense claims and reimbursements</p>
        </div>
        <Button asChild>
          <Link href="/hr/expenses/new">
            <Plus className="h-4 w-4 mr-2" />
            New Expense Claim
          </Link>
        </Button>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">
              ${stats.totalAmount.toLocaleString()} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-gray-500">
              ${stats.pendingAmount.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-gray-500">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.paid}</div>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>
      </div>
      {/* Expense Claims Table */}
      <ExpenseClaimsTable 
        expenseClaims={expenseClaims || []}
        canApprove={isHROrManager || false}
      />
    </div>
  );
}
