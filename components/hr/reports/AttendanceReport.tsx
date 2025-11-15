'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AttendanceReport({ timesheets, employees }: any) {
  const totalHours = timesheets.reduce((sum: number, ts: any) => sum + (ts.total_hours || 0), 0);
  const avgHours = timesheets.length > 0 ? totalHours / timesheets.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Total Hours Logged</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalHours.toLocaleString()}h</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Average Hours/Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{avgHours.toFixed(1)}h</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timesheet Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{timesheets.length}</div>
        </CardContent>
      </Card>
    </div>
  );
}


