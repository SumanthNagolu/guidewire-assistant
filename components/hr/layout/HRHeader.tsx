'use client';

import { useState, useEffect } from 'react';
import { Employee, HRNotification } from '@/types/hr';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PortalSwitcher from '@/components/PortalSwitcher';

interface HRHeaderProps {
  employee?: Employee | null;
}

export default function HRHeader({ employee }: HRHeaderProps) {
  const [notifications, setNotifications] = useState<HRNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (employee) {
      fetchNotifications();
      
      // Subscribe to real-time notifications
      const channel = supabase
        .channel('hr_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'hr_notifications',
            filter: `recipient_id=eq.${employee.id}`,
          },
          (payload) => {
            setNotifications(prev => [payload.new as HRNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [employee]);

  const fetchNotifications = async () => {
    if (!employee) return;
    
    const { data, error } = await supabase
      .from('hr_notifications')
      .select('*')
      .eq('recipient_id', employee.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.length);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('hr_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement global search functionality
      };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        {/* Portal Switcher */}
        <PortalSwitcher />
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl ml-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search employees, documents, or requests..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right side actions */}
        <div className="flex items-center space-x-4 ml-6">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} new</Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No new notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col space-y-1 w-full">
                      <p className="text-sm font-medium">{notification.subject}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.created_at).toRelativeTimeString()}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              {unreadCount > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/hr/notifications"
                      className="text-center text-sm text-indigo-600 hover:text-indigo-700 w-full"
                    >
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                {employee && (
                  <>
                    <span className="text-sm font-medium text-gray-700">
                      {employee.first_name} {employee.last_name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {employee?.first_name} {employee?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{employee?.email}</p>
                  <p className="text-xs text-gray-500">
                    {employee?.employee_id} • {employee?.hr_roles?.name}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/hr/profile">My Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hr/self-service">Self Service</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hr/settings/account">Account Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/hr/help">Help & Support</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hr/logout" className="text-red-600">
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// Extension to Date prototype for relative time
declare global {
  interface Date {
    toRelativeTimeString(): string;
  }
}

Date.prototype.toRelativeTimeString = function(): string {
  const seconds = Math.floor((new Date().getTime() - this.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return this.toLocaleDateString();
};
