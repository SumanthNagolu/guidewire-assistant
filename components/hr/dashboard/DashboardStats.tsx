'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  stats: {
    totalEmployees: number;
    activeLeaveRequests: number;
    pendingExpenses: number;
    todayAttendance: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      change: '+2',
      changeType: 'positive',
      description: 'Active employees',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Leave Requests',
      value: stats.activeLeaveRequests,
      icon: Calendar,
      change: stats.activeLeaveRequests > 0 ? `${stats.activeLeaveRequests} pending` : 'All processed',
      changeType: stats.activeLeaveRequests > 0 ? 'warning' : 'neutral',
      description: 'Awaiting approval',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Pending Expenses',
      value: stats.pendingExpenses,
      icon: DollarSign,
      change: stats.pendingExpenses > 0 ? 'Action needed' : 'All clear',
      changeType: stats.pendingExpenses > 0 ? 'warning' : 'positive',
      description: 'Awaiting review',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: "Today's Attendance",
      value: `${stats.todayAttendance}/${stats.totalEmployees}`,
      icon: Clock,
      change: `${Math.round((stats.todayAttendance / stats.totalEmployees) * 100)}% present`,
      changeType: 'neutral',
      description: 'Checked in today',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    'text-xs',
                    stat.changeType === 'positive' && 'text-green-600',
                    stat.changeType === 'negative' && 'text-red-600',
                    stat.changeType === 'warning' && 'text-orange-600',
                    stat.changeType === 'neutral' && 'text-gray-600'
                  )}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


