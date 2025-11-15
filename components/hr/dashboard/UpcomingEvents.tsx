'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Gift, Users, Briefcase, PartyPopper } from 'lucide-react';

interface Event {
  id: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'meeting' | 'training';
  title: string;
  date: string;
  description?: string;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get upcoming birthdays
      const { data: employees } = await supabase
        .from('employees')
        .select('id, first_name, last_name, date_of_birth')
        .eq('employment_status', 'Active')
        .not('date_of_birth', 'is', null);

      // Get upcoming work anniversaries
      const { data: anniversaries } = await supabase
        .from('employees')
        .select('id, first_name, last_name, hire_date')
        .eq('employment_status', 'Active');

      const upcomingEvents: Event[] = [];

      // Process birthdays
      employees?.forEach((emp) => {
        if (emp.date_of_birth) {
          const birthday = new Date(emp.date_of_birth);
          const thisYearBirthday = new Date(
            today.getFullYear(),
            birthday.getMonth(),
            birthday.getDate()
          );
          
          if (thisYearBirthday >= today && thisYearBirthday <= nextWeek) {
            upcomingEvents.push({
              id: `bday-${emp.id}`,
              type: 'birthday',
              title: `${emp.first_name} ${emp.last_name}'s Birthday`,
              date: thisYearBirthday.toISOString(),
              description: 'Wish them a happy birthday!',
            });
          }
        }
      });

      // Process work anniversaries
      anniversaries?.forEach((emp) => {
        const hireDate = new Date(emp.hire_date);
        const yearsOfService = today.getFullYear() - hireDate.getFullYear();
        const thisYearAnniversary = new Date(
          today.getFullYear(),
          hireDate.getMonth(),
          hireDate.getDate()
        );

        if (thisYearAnniversary >= today && thisYearAnniversary <= nextWeek && yearsOfService > 0) {
          upcomingEvents.push({
            id: `anniv-${emp.id}`,
            type: 'anniversary',
            title: `${emp.first_name} ${emp.last_name}'s Work Anniversary`,
            date: thisYearAnniversary.toISOString(),
            description: `${yearsOfService} year${yearsOfService > 1 ? 's' : ''} with the company`,
          });
        }
      });

      // Add some sample events (in production, these would come from a calendar/events table)
      upcomingEvents.push(
        {
          id: 'holiday-1',
          type: 'holiday',
          title: 'Thanksgiving Holiday',
          date: new Date(2025, 10, 28).toISOString(),
          description: 'Office closed',
        },
        {
          id: 'meeting-1',
          type: 'meeting',
          title: 'All Hands Meeting',
          date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Q4 Review & Updates',
        },
        {
          id: 'training-1',
          type: 'training',
          title: 'Security Awareness Training',
          date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Mandatory for all employees',
        }
      );

      // Sort by date
      upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setEvents(upcomingEvents.slice(0, 5));
    } catch (error) {
          } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return Gift;
      case 'anniversary':
        return PartyPopper;
      case 'holiday':
        return Calendar;
      case 'meeting':
        return Users;
      case 'training':
        return Briefcase;
      default:
        return Calendar;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'birthday':
        return 'bg-pink-100 text-pink-700';
      case 'anniversary':
        return 'bg-purple-100 text-purple-700';
      case 'holiday':
        return 'bg-green-100 text-green-700';
      case 'meeting':
        return 'bg-blue-100 text-blue-700';
      case 'training':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatEventDate = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (eventDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      const daysUntil = Math.floor(
        (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil <= 7) {
        return `In ${daysUntil} days`;
      }
      return eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-400">Loading events...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No upcoming events this week
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const Icon = getEventIcon(event.type);
              return (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatEventDate(event.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


