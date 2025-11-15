'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, Check, CheckCheck, X, Calendar, DollarSign, Clock, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  subject: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export default function NotificationCenter({ employeeId }: { employeeId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hr_notifications',
          filter: `recipient_id=eq.${employeeId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [employeeId]);

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('hr_notifications')
      .select('*')
      .eq('recipient_id', employeeId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('hr_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('hr_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', employeeId)
      .eq('is_read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'leave':
      case 'Leave':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'expense':
      case 'Expense':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'timesheet':
      case 'Timesheet':
        return <Clock className="h-4 w-4 text-purple-500" />;
      case 'document':
      case 'Document':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'employee':
      case 'Employee':
        return <User className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    const data = notification.data || {};
    
    switch (notification.type.toLowerCase()) {
      case 'leave':
        return data.leave_id ? `/hr/leave/requests?id=${data.leave_id}` : '/hr/leave/requests';
      case 'expense':
        return data.expense_id ? `/hr/expenses/claims?id=${data.expense_id}` : '/hr/expenses/claims';
      case 'timesheet':
        return data.timesheet_id ? `/hr/timesheets?id=${data.timesheet_id}` : '/hr/timesheets';
      case 'employee':
        return data.employee_id ? `/hr/employees?id=${data.employee_id}` : '/hr/employees';
      default:
        return '/hr/dashboard';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-[600px] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="p-0">
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
            <p className="text-xs mt-1">You'll see updates here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={getNotificationLink(notification)}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.id);
                  }
                  setIsOpen(false);
                }}
              >
                <DropdownMenuItem
                  className={`px-4 py-3 cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.subject}
                        </p>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 h-2 w-2 bg-blue-600 rounded-full ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </Link>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/hr/notifications"
                className="text-center text-sm text-blue-600 hover:text-blue-700 w-full py-2"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 1) {
    return 'Just now';
  } else if (diffInMins < 60) {
    return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

