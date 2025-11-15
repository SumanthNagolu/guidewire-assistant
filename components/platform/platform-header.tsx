"use client";

import { useState, useEffect } from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useSupabase } from '@/providers/supabase-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export function PlatformHeader() {
  const [notifications, setNotifications] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const { supabase, user } = useSupabase();
  const router = useRouter();

  useEffect(() => {
        fetchNotificationCount();
  }, []);

  const fetchNotificationCount = async () => {
    if (!user) return;
    
    const { count } = await supabase
      .from('bottleneck_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .eq('status', 'open');

    setNotifications(count || 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800 md:pl-64">
      <div className="flex justify-between items-center px-4 sm:px-6 py-4">
        <div className="flex items-center flex-1">
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-4 flex-1 max-w-lg">
            {searchOpen ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search jobs, candidates, workflows..."
                  className="pl-10"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <Search className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Search...</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                    {notifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No new notifications
                </div>
              ) : (
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{notifications} bottlenecks detected</p>
                    <p className="text-xs text-gray-500">Review and resolve issues</p>
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/platform/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/platform/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

