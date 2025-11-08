'use client';

import { signOut } from '@/modules/auth/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

interface DashboardNavProps {
  user: User;
  profile: {
    first_name: string | null;
    last_name: string | null;
    role: string;
  } | null;
}

export default function DashboardNav({ user, profile }: DashboardNavProps) {
  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`
    : user.email?.[0].toUpperCase() || 'U';

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
    : user.email || 'User';

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            Guidewire Training
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </Link>
            <Link
              href="/topics"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Topics
            </Link>
            <Link
              href="/progress"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Progress
            </Link>
            <Link
              href="/ai-mentor"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              AI Mentor
            </Link>
            <Link
              href="/assessments"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Assessments
            </Link>
            {profile?.role === 'admin' && (
              <>
                <Link
                  href="/admin"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Admin
                </Link>
                <Link
                  href="/admin/analytics"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Analytics
                </Link>
                <Link
                  href="/admin/content-upload"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Content Upload
                </Link>
              </>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600"
              onSelect={(e) => {
                e.preventDefault();
                signOut();
              }}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

