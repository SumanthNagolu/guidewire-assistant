'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExpenseReport({ expenseClaims, employees }: any) {
  const totalAmount = expenseClaims.reduce((sum: number, ec: any) => sum + ec.total_amount, 0);
  const approved = expenseClaims.filter((ec: any) => ec.status === 'Approved' || ec.status === 'Paid').length;
  const avgClaim = expenseClaims.length > 0 ? totalAmount / expenseClaims.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Total Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{expenseClaims.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Total Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ${totalAmount.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Average Claim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${avgClaim.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
}


