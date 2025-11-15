'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Calendar, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface PendingApprovalsProps {
  employeeId: string;
}

interface PendingItem {
  id: string;
  type: 'leave' | 'expense' | 'timesheet';
  title: string;
  requester: string;
  date: string;
  amount?: number;
  days?: number;
  urgency: 'low' | 'medium' | 'high';
}

export default function PendingApprovals({ employeeId }: PendingApprovalsProps) {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPendingApprovals();
  }, [employeeId]);

  const fetchPendingApprovals = async () => {
    try {
      // Fetch pending leave requests
      const { data: leaveRequests } = await supabase
        .from('leave_requests')
        .select(`
          id,
          from_date,
          to_date,
          total_days,
          employees!leave_requests_employee_id_fkey(first_name, last_name)
        `)
        .eq('status', 'Pending')
        .limit(3);

      // Fetch pending expense claims
      const { data: expenseClaims } = await supabase
        .from('expense_claims')
        .select(`
          id,
          claim_number,
          claim_date,
          total_amount,
          employees!expense_claims_employee_id_fkey(first_name, last_name)
        `)
        .eq('status', 'Submitted')
        .limit(3);

      // Fetch pending timesheets
      const { data: timesheets } = await supabase
        .from('timesheets')
        .select(`
          id,
          date,
          total_hours,
          employees!timesheets_employee_id_fkey(first_name, last_name)
        `)
        .eq('status', 'Submitted')
        .limit(3);

      // Combine and format pending items
      const items: PendingItem[] = [];

      leaveRequests?.forEach((leave) => {
        items.push({
          id: leave.id,
          type: 'leave',
          title: `Leave Request`,
          requester: `${leave.employees?.first_name} ${leave.employees?.last_name}`,
          date: leave.from_date,
          days: leave.total_days,
          urgency: getUrgency(leave.from_date),
        });
      });

      expenseClaims?.forEach((expense) => {
        items.push({
          id: expense.id,
          type: 'expense',
          title: `Expense Claim #${expense.claim_number}`,
          requester: `${expense.employees?.first_name} ${expense.employees?.last_name}`,
          date: expense.claim_date,
          amount: expense.total_amount,
          urgency: 'medium',
        });
      });

      timesheets?.forEach((timesheet) => {
        items.push({
          id: timesheet.id,
          type: 'timesheet',
          title: `Timesheet`,
          requester: `${timesheet.employees?.first_name} ${timesheet.employees?.last_name}`,
          date: timesheet.date,
          urgency: 'low',
        });
      });

      setPendingItems(items.slice(0, 5)); // Show top 5 pending items
    } catch (error) {
          } finally {
      setLoading(false);
    }
  };

  const getUrgency = (date: string): 'low' | 'medium' | 'high' => {
    const daysUntil = Math.floor(
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil <= 2) return 'high';
    if (daysUntil <= 7) return 'medium';
    return 'low';
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'leave':
        return Calendar;
      case 'expense':
        return DollarSign;
      case 'timesheet':
        return Clock;
      default:
        return Calendar;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-400">Loading pending approvals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Pending Approvals</CardTitle>
          <Badge variant="secondary">{pendingItems.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {pendingItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending approvals at the moment
          </div>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        by {item.requester} • {new Date(item.date).toLocaleDateString()}
                      </p>
                      {item.amount && (
                        <p className="text-xs font-semibold text-green-600 mt-1">
                          ${item.amount.toLocaleString()}
                        </p>
                      )}
                      {item.days && (
                        <p className="text-xs font-semibold text-blue-600 mt-1">
                          {item.days} days
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getUrgencyColor(item.urgency) as any}>
                      {item.urgency}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-green-600">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <Link
              href="/hr/approvals"
              className="block text-center text-sm text-indigo-600 hover:text-indigo-700 pt-2"
            >
              View all pending approvals →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


