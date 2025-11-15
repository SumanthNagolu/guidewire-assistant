'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building, GraduationCap, Users, Settings, ChevronDown } from 'lucide-react';

interface Portal {
  name: string;
  href: string;
  icon: any;
  description: string;
  color: string;
}

const PORTALS: Portal[] = [
  {
    name: 'HR Portal',
    href: '/hr/dashboard',
    icon: Users,
    description: 'Human Resources Management',
    color: 'text-indigo-600',
  },
  {
    name: 'Learning Portal',
    href: '/academy',
    icon: GraduationCap,
    description: 'Guidewire Training Academy',
    color: 'text-blue-600',
  },
  {
    name: 'Admin Portal',
    href: '/admin/dashboard',
    icon: Settings,
    description: 'System Administration',
    color: 'text-purple-600',
  },
  {
    name: 'Main Website',
    href: '/',
    icon: Building,
    description: 'Public Website',
    color: 'text-green-600',
  },
];

export default function PortalSwitcher() {
  const pathname = usePathname();

  const getCurrentPortal = () => {
    if (pathname.startsWith('/hr')) return PORTALS[0];
    if (pathname.startsWith('/academy')) return PORTALS[1];
    if (pathname.startsWith('/admin')) return PORTALS[2];
    return PORTALS[3];
  };

  const currentPortal = getCurrentPortal();
  const CurrentIcon = currentPortal.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <CurrentIcon className={`h-4 w-4 ${currentPortal.color}`} />
          <span>{currentPortal.name}</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch Portal</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PORTALS.map((portal) => {
          const Icon = portal.icon;
          const isActive = pathname.startsWith(portal.href) || 
            (portal.href === '/' && pathname === '/');
          
          return (
            <DropdownMenuItem key={portal.href} asChild>
              <Link
                href={portal.href}
                className={`flex items-start space-x-3 p-3 cursor-pointer ${
                  isActive ? 'bg-gray-100' : ''
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 ${portal.color}`} />
                <div>
                  <p className="font-medium">{portal.name}</p>
                  <p className="text-xs text-gray-500">{portal.description}</p>
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


