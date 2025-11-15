'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LeaveReport({ leaveRequests, employees }: any) {
  const totalDays = leaveRequests.reduce((sum: number, lr: any) => sum + lr.total_days, 0);
  const approved = leaveRequests.filter((lr: any) => lr.status === 'Approved').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Total Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{leaveRequests.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approved Leaves</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{approved}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Total Days Taken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalDays} days</div>
        </CardContent>
      </Card>
    </div>
  );
}


