'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, LogIn, LogOut, Coffee, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function ClockInOutPage() {
  const [employee, setEmployee] = useState<any>(null);
  const [todayTimesheet, setTodayTimesheet] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  useEffect(() => {
    fetchEmployeeAndTimesheet();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const fetchEmployeeAndTimesheet = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: emp } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setEmployee(emp);
    // Get today's timesheet
    const today = new Date().toISOString().split('T')[0];
    const { data: timesheet } = await supabase
      .from('timesheets')
      .select('*')
      .eq('employee_id', emp?.id)
      .eq('date', today)
      .single();
    setTodayTimesheet(timesheet);
    if (timesheet?.notes) {
      setNotes(timesheet.notes);
    }
  };
  const handleClockIn = async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const { error } = await supabase
        .from('timesheets')
        .insert({
          employee_id: employee.id,
          date: today,
          clock_in: now.toISOString(),
          status: 'Draft',
          notes: notes || null,
        });
      if (error) throw error;
      // Also create attendance record
      await supabase
        .from('attendance')
        .insert({
          employee_id: employee.id,
          date: today,
          status: 'Present',
        });
      await fetchEmployeeAndTimesheet();
      router.refresh();
    } catch (error) {
      alert('Failed to clock in. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleClockOut = async () => {
    if (!todayTimesheet) return;
    setLoading(true);
    try {
      const now = new Date();
      const clockIn = new Date(todayTimesheet.clock_in);
      const diffMs = now.getTime() - clockIn.getTime();
      const totalMinutes = Math.floor(diffMs / 60000);
      const breakMinutes = todayTimesheet.break_duration || 0;
      const workMinutes = totalMinutes - breakMinutes;
      const totalHours = workMinutes / 60;
      // Calculate overtime (assuming 8 hours is standard)
      const standardHours = 8;
      const overtimeHours = Math.max(0, totalHours - standardHours);
      const { error } = await supabase
        .from('timesheets')
        .update({
          clock_out: now.toISOString(),
          total_hours: totalHours,
          overtime_hours: overtimeHours,
          status: 'Submitted',
          notes: notes || null,
        })
        .eq('id', todayTimesheet.id);
      if (error) throw error;
      await fetchEmployeeAndTimesheet();
      router.refresh();
    } catch (error) {
      alert('Failed to clock out. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleStartBreak = async () => {
    // In a real app, this would track break times separately
    alert('Break tracking feature coming soon!');
  };
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const getWorkDuration = () => {
    if (!todayTimesheet?.clock_in) return '00:00:00';
    const clockIn = new Date(todayTimesheet.clock_in);
    const now = new Date();
    const diffMs = now.getTime() - clockIn.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  const isClockedIn = todayTimesheet && todayTimesheet.clock_in && !todayTimesheet.clock_out;
  const isCompleted = todayTimesheet && todayTimesheet.clock_out;
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Current Time Display */}
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <Clock className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-5xl font-bold mb-2">{formatTime(currentTime)}</h2>
            <p className="text-indigo-100">{formatDate(currentTime)}</p>
          </div>
        </CardContent>
      </Card>
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Status</CardTitle>
              <CardDescription>
                {employee?.first_name} {employee?.last_name} • {employee?.employee_id}
              </CardDescription>
            </div>
            {isClockedIn && (
              <Badge variant="default" className="bg-green-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  Clocked In
                </div>
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="secondary">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isClockedIn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Clock In Time</p>
                  <p className="text-lg font-semibold">
                    {new Date(todayTimesheet.clock_in).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Work Duration</p>
                  <p className="text-lg font-semibold text-indigo-600">
                    {getWorkDuration()}
                  </p>
                </div>
              </div>
            </div>
          )}
          {isCompleted && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Clock In</p>
                <p className="font-semibold">
                  {new Date(todayTimesheet.clock_in).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Clock Out</p>
                <p className="font-semibold">
                  {new Date(todayTimesheet.clock_out).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="font-semibold text-indigo-600">
                  {todayTimesheet.total_hours?.toFixed(2)}h
                </p>
              </div>
            </div>
          )}
          {!isClockedIn && !isCompleted && (
            <p className="text-gray-500 text-center py-4">
              You haven't clocked in yet today
            </p>
          )}
        </CardContent>
      </Card>
      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Add any notes about your work today (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Worked on project X, attended meeting Y..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            disabled={isCompleted}
          />
        </CardContent>
      </Card>
      {/* Action Buttons */}
      <div className="flex gap-4">
        {!isClockedIn && !isCompleted && (
          <Button
            onClick={handleClockIn}
            disabled={loading}
            className="flex-1 h-16 text-lg"
          >
            <LogIn className="h-5 w-5 mr-2" />
            {loading ? 'Clocking In...' : 'Clock In'}
          </Button>
        )}
        {isClockedIn && (
          <>
            <Button
              variant="outline"
              onClick={handleStartBreak}
              className="flex-1 h-16 text-lg"
            >
              <Coffee className="h-5 w-5 mr-2" />
              Start Break
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={loading}
              className="flex-1 h-16 text-lg bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-5 w-5 mr-2" />
              {loading ? 'Clocking Out...' : 'Clock Out'}
            </Button>
          </>
        )}
        {isCompleted && (
          <Button
            variant="outline"
            className="flex-1 h-16 text-lg"
            disabled
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Timesheet Submitted
          </Button>
        )}
      </div>
    </div>
  );
}
