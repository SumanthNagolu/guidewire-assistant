'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

interface AttendanceData {
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  total: number;
}

export default function AttendanceOverview() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get total active employees
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('employment_status', 'Active');

      // Get today's attendance
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select('status')
        .eq('date', today);

      // Count by status
      const statusCounts = attendanceRecords?.reduce((acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get employees on leave
      const { count: onLeaveCount } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Approved')
        .lte('from_date', today)
        .gte('to_date', today);

      setAttendanceData({
        present: statusCounts['Present'] || 0,
        absent: statusCounts['Absent'] || 0,
        late: statusCounts['Late'] || 0,
        onLeave: onLeaveCount || 0,
        total: totalEmployees || 0,
      });
    } catch (error) {
          } finally {
      setLoading(false);
    }
  };

  const attendancePercentage = attendanceData.total > 0 
    ? Math.round((attendanceData.present / attendanceData.total) * 100)
    : 0;

  const attendanceStats = [
    {
      label: 'Present',
      value: attendanceData.present,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Absent',
      value: attendanceData.absent,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Late',
      value: attendanceData.late,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'On Leave',
      value: attendanceData.onLeave,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-400">Loading attendance data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Attendance</span>
              <span className="text-2xl font-bold text-green-600">
                {attendancePercentage}%
              </span>
            </div>
            <Progress value={attendancePercentage} className="h-3" />
            <p className="text-xs text-gray-500 mt-1">
              {attendanceData.present} out of {attendanceData.total} employees present
            </p>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {attendanceStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg border"
                >
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Department-wise breakdown could go here */}
        </div>
      </CardContent>
    </Card>
  );
}


