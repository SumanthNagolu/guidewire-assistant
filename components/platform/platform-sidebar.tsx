"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Workflow,
  Target,
  MessageSquare,
  Briefcase,
  Trophy,
  BarChart3,
  Settings,
  Search,
  Brain,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/platform', icon: Home },
  { name: 'Pods', href: '/platform/pods', icon: Users },
  { name: 'Workflows', href: '/platform/workflows', icon: Workflow },
  { name: 'Objects', href: '/platform/objects', icon: Target },
  { name: 'Sourcing Hub', href: '/platform/sourcing', icon: Search },
  { name: 'Communications', href: '/platform/communications', icon: MessageSquare },
  { name: 'Jobs', href: '/platform/jobs', icon: Briefcase },
  { name: 'Gamification', href: '/platform/gamification', icon: Trophy },
  { name: 'Analytics', href: '/platform/analytics', icon: BarChart3 },
  { name: 'AI Assistant', href: '/platform/ai', icon: Brain },
  { name: 'Vendor Network', href: '/platform/vendors', icon: Building },
  { name: 'Settings', href: '/platform/settings', icon: Settings },
];

export function PlatformSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-1 bg-gray-900">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-800">
          <h1 className="text-xl font-semibold text-white">Trikala Platform</h1>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex bg-gray-800 p-4">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-300">Production Mode</p>
              <p className="text-xs font-medium text-green-400">All Systems Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

