'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Employee } from '@/types/hr';
import { 
  Home, 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Building,
  ClipboardList,
  Receipt,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HRSidebarProps {
  employee?: Employee | null;
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/hr/dashboard',
  },
  {
    title: 'Employees',
    icon: Users,
    href: '/hr/employees',
    submenu: [
      { title: 'All Employees', href: '/hr/employees' },
      { title: 'Add Employee', href: '/hr/employees/new' },
      { title: 'Departments', href: '/hr/departments' },
      { title: 'Designations', href: '/hr/designations' },
    ],
  },
  {
    title: 'Attendance',
    icon: Clock,
    href: '/hr/attendance',
    submenu: [
      { title: 'Timesheets', href: '/hr/timesheets' },
      { title: 'Attendance Report', href: '/hr/attendance/report' },
      { title: 'Shifts', href: '/hr/shifts' },
    ],
  },
  {
    title: 'Leave',
    icon: Calendar,
    href: '/hr/leave',
    submenu: [
      { title: 'Leave Requests', href: '/hr/leave/requests' },
      { title: 'Leave Balance', href: '/hr/leave/balance' },
      { title: 'Leave Types', href: '/hr/leave/types' },
      { title: 'Holiday Calendar', href: '/hr/holidays' },
    ],
  },
  {
    title: 'Expenses',
    icon: Receipt,
    href: '/hr/expenses',
    submenu: [
      { title: 'Expense Claims', href: '/hr/expenses/claims' },
      { title: 'My Claims', href: '/hr/expenses/my-claims' },
      { title: 'Categories', href: '/hr/expenses/categories' },
    ],
  },
  {
    title: 'Documents',
    icon: FileText,
    href: '/hr/documents',
    submenu: [
      { title: 'Generate Document', href: '/hr/documents/generate' },
      { title: 'Templates', href: '/hr/documents/templates' },
      { title: 'Document History', href: '/hr/documents/history' },
    ],
  },
  {
    title: 'Reports',
    icon: BarChart3,
    href: '/hr/reports',
    submenu: [
      { title: 'HR Analytics', href: '/hr/reports/analytics' },
      { title: 'Attendance Report', href: '/hr/reports/attendance' },
      { title: 'Leave Report', href: '/hr/reports/leave' },
      { title: 'Expense Report', href: '/hr/reports/expense' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/hr/settings',
    submenu: [
      { title: 'Company Info', href: '/hr/settings/company' },
      { title: 'Workflows', href: '/hr/settings/workflows' },
      { title: 'Notifications', href: '/hr/settings/notifications' },
      { title: 'Roles & Permissions', href: '/hr/settings/roles' },
    ],
  },
];

export default function HRSidebar({ employee }: HRSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const hasPermission = (item: typeof menuItems[0]) => {
    // Check permissions based on employee role
    if (!employee || !employee.hr_roles) return false;
    
    const permissions = employee.hr_roles.permissions;
    if (permissions.all) return true;
    
    // Map menu items to permission keys
    const permissionMap: Record<string, boolean> = {
      'Dashboard': true,
      'Employees': permissions.hr || permissions.employees?.view,
      'Attendance': permissions.hr || permissions.timesheets?.view,
      'Leave': permissions.hr || permissions.leaves?.view || permissions.self,
      'Expenses': permissions.hr || permissions.expenses?.view || permissions.self,
      'Documents': permissions.hr || permissions.self,
      'Reports': permissions.hr || permissions.reports?.view,
      'Settings': permissions.hr || permissions.settings?.view,
    };
    
    return permissionMap[item.title] || false;
  };

  return (
    <div
      className={cn(
        'bg-gray-900 text-white transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!collapsed && (
          <Link href="/hr/dashboard" className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-indigo-400" />
            <span className="font-bold text-lg">HR Portal</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* User Info Section */}
      {employee && (
        <div className={cn(
          'border-b border-gray-800 p-4',
          collapsed && 'px-2 py-3'
        )}>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="font-medium truncate">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {employee.hr_roles?.name || 'Employee'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          if (!hasPermission(item)) return null;
          
          const Icon = item.icon;
          const isExpanded = expandedItems.includes(item.title);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isItemActive = isActive(item.href);

          return (
            <div key={item.title}>
              <div
                className={cn(
                  'flex items-center justify-between px-4 py-2 hover:bg-gray-800 transition-colors cursor-pointer',
                  collapsed && 'px-2',
                  isItemActive && 'bg-gray-800 border-l-4 border-indigo-500'
                )}
                onClick={() => {
                  if (hasSubmenu && !collapsed) {
                    toggleExpand(item.title);
                  }
                }}
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-3 flex-1"
                  onClick={(e) => {
                    if (hasSubmenu && !collapsed) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Icon className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isItemActive ? 'text-indigo-400' : 'text-gray-400'
                  )} />
                  {!collapsed && (
                    <span className={cn(
                      'text-sm',
                      isItemActive ? 'text-white font-medium' : 'text-gray-300'
                    )}>
                      {item.title}
                    </span>
                  )}
                </Link>
                {hasSubmenu && !collapsed && (
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 text-gray-400 transition-transform',
                      isExpanded && 'transform rotate-90'
                    )}
                  />
                )}
              </div>

              {/* Submenu */}
              {hasSubmenu && isExpanded && !collapsed && (
                <div className="bg-gray-950">
                  {item.submenu!.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        'block pl-12 pr-4 py-2 text-sm hover:bg-gray-800 transition-colors',
                        isActive(subItem.href)
                          ? 'text-indigo-400 bg-gray-800'
                          : 'text-gray-400 hover:text-gray-300'
                      )}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="border-t border-gray-800 p-4">
        <Link
          href="/hr/logout"
          className={cn(
            'flex items-center space-x-3 text-gray-400 hover:text-white transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </Link>
      </div>
    </div>
  );
}


