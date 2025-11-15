'use client';

import { useState } from 'react';
import { Timesheet } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TimesheetCalendarProps {
  timesheets: Timesheet[];
  employeeId: string;
  month: number;
  year: number;
}

export default function TimesheetCalendar({ 
  timesheets, 
  employeeId,
  month,
  year 
}: TimesheetCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getTimesheetForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return timesheets.find(t => t.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Submitted':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() + 1 &&
      currentYear === today.getFullYear()
    );
  };

  const isWeekend = (day: number) => {
    const date = new Date(currentYear, currentMonth - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {monthNames[currentMonth - 1]} {currentYear}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setCurrentMonth(today.getMonth() + 1);
                setCurrentYear(today.getFullYear());
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="h-24" />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const timesheet = getTimesheetForDate(day);
            const weekend = isWeekend(day);
            const today = isToday(day);

            return (
              <div
                key={day}
                className={cn(
                  'h-24 border rounded-lg p-2 relative transition-colors',
                  weekend && 'bg-gray-50',
                  today && 'ring-2 ring-indigo-500',
                  timesheet ? getStatusColor(timesheet.status) : 'hover:bg-gray-50'
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    'text-sm font-medium',
                    today && 'text-indigo-600 font-bold'
                  )}>
                    {day}
                  </span>
                  {!timesheet && !weekend && (
                    <Link
                      href={`/hr/timesheets/new?date=${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
                    >
                      <Plus className="h-3 w-3 text-gray-400 hover:text-indigo-600" />
                    </Link>
                  )}
                </div>

                {timesheet && (
                  <div className="mt-1 space-y-1">
                    <Link href={`/hr/timesheets/${timesheet.id}`}>
                      <div className="text-xs">
                        <p className="font-semibold">
                          {timesheet.total_hours?.toFixed(1)}h
                        </p>
                        {timesheet.overtime_hours && timesheet.overtime_hours > 0 && (
                          <p className="text-purple-600">
                            +{timesheet.overtime_hours.toFixed(1)}h OT
                          </p>
                        )}
                        <Badge variant="outline" className="text-xs mt-1">
                          {timesheet.status}
                        </Badge>
                      </div>
                    </Link>
                  </div>
                )}

                {weekend && !timesheet && (
                  <div className="mt-2 text-xs text-gray-400 text-center">
                    Weekend
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
            <span>Draft</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded" />
            <span>Submitted</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
            <span>Approved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
            <span>Rejected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


