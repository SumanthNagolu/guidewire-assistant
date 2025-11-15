'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { 
  UserPlus, 
  Calendar, 
  DollarSign, 
  Clock, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  action: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      // Fetch recent audit log entries
      const { data: auditLogs } = await supabase
        .from('hr_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const formattedActivities: Activity[] = [];

      // Sample activities (in production, these would be parsed from audit logs)
      const sampleActivities = [
        {
          id: '1',
          type: 'employee',
          action: 'New Employee Added',
          description: 'John Smith joined as Software Engineer',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          icon: UserPlus,
          color: 'text-green-600',
        },
        {
          id: '2',
          type: 'leave',
          action: 'Leave Request Approved',
          description: 'Sarah Johnson - 3 days annual leave approved',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          icon: CheckCircle,
          color: 'text-blue-600',
        },
        {
          id: '3',
          type: 'expense',
          action: 'Expense Claim Submitted',
          description: 'Travel expenses - $1,234.50 pending approval',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          icon: DollarSign,
          color: 'text-orange-600',
        },
        {
          id: '4',
          type: 'timesheet',
          action: 'Timesheet Rejected',
          description: 'Michael Brown - Week 45 timesheet needs revision',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          icon: XCircle,
          color: 'text-red-600',
        },
        {
          id: '5',
          type: 'document',
          action: 'Document Generated',
          description: 'Employment verification letter for Emily Davis',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          icon: FileText,
          color: 'text-purple-600',
        },
        {
          id: '6',
          type: 'attendance',
          action: 'Late Check-in',
          description: 'Multiple late check-ins detected this week',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          icon: AlertCircle,
          color: 'text-yellow-600',
        },
      ];

      setActivities(sampleActivities);
    } catch (error) {
          } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-400">Loading recent activities...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent activities to display
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`mt-0.5 ${activity.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-400">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


