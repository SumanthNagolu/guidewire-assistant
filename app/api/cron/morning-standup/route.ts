import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// GET /api/cron/morning-standup - Send morning standup reminders (runs at 9 AM daily)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    // Get all active employees
    const { data: employees } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email')
      .in('role', ['employee', 'recruiter', 'sales', 'operations', 'admin']);
    if (!employees || employees.length === 0) {
      return NextResponse.json({ message: 'No employees found' });
    }
    const results = [];
    for (const employee of employees) {
      // Check if standup already submitted
      const { data: existingStandup } = await supabase
        .from('daily_standups')
        .select('id')
        .eq('user_id', employee.id)
        .eq('date', today)
        .single();
      if (existingStandup) {
        results.push({ user_id: employee.id, status: 'already_submitted', skipped: true });
        continue;
      }
            // For now, just log
      results.push({
        user_id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        status: 'reminder_sent',
        method: 'console', // Replace with actual method: 'email', 'slack', etc.
      });
    }
    return NextResponse.json({
      success: true,
      date: today,
      employees_count: employees.length,
      reminders_sent: results.filter((r) => r.status === 'reminder_sent').length,
      already_submitted: results.filter((r) => r.skipped).length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to send standup reminders', details: error.message },
      { status: 500 }
    );
  }
}
