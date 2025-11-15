'use client';

import { Employee } from '@/types/hr';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Calendar, 
  Receipt, 
  FileText,
  ClipboardList,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
  employee: Employee;
}

export default function QuickActions({ employee }: QuickActionsProps) {
  const isHR = employee.hr_roles?.permissions?.hr;
  const isManager = employee.hr_roles?.permissions?.team;

  const employeeActions = [
    {
      title: 'Clock In/Out',
      description: 'Mark your attendance',
      icon: Clock,
      href: '/hr/timesheets/clock',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Apply Leave',
      description: 'Submit leave request',
      icon: Calendar,
      href: '/hr/leave/apply',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Submit Expense',
      description: 'Claim reimbursement',
      icon: Receipt,
      href: '/hr/expenses/new',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'My Documents',
      description: 'View payslips & letters',
      icon: FileText,
      href: '/hr/self-service/documents',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  const managerActions = [
    {
      title: 'Team Timesheets',
      description: 'Review & approve',
      icon: ClipboardList,
      href: '/hr/timesheets/team',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      title: 'Add Employee',
      description: 'Onboard new member',
      icon: UserPlus,
      href: '/hr/employees/new',
      color: 'bg-pink-500 hover:bg-pink-600',
    },
  ];

  const actions = isHR || isManager 
    ? [...employeeActions, ...managerActions]
    : employeeActions;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              href={action.href}
              className="group flex flex-col items-center text-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`p-3 rounded-full text-white ${action.color} transition-colors`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


