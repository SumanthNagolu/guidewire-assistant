import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// GET /api/cron/end-of-day-summary - Generate end-of-day summaries (runs at 6 PM daily)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
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
    if (!employees) {
      return NextResponse.json({ message: 'No employees found' });
    }
    const summaries = [];
    for (const employee of employees) {
      // Get today's productivity score
      const { data: score } = await supabase
        .from('productivity_scores')
        .select('*')
        .eq('user_id', employee.id)
        .eq('date', today)
        .single();
      // Get today's tasks
      const startOfDay = `${today}T00:00:00Z`;
      const endOfDay = `${today}T23:59:59Z`;
      const { data: completedTasks } = await supabase
        .from('tasks')
        .select('title')
        .eq('assigned_to', employee.id)
        .eq('status', 'done')
        .gte('completed_at', startOfDay)
        .lte('completed_at', endOfDay);
      // Get today's standup
      const { data: standup } = await supabase
        .from('daily_standups')
        .select('*')
        .eq('user_id', employee.id)
        .eq('date', today)
        .single();
      const summary = {
        user_id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        email: employee.email,
        date: today,
        productivity_score: score?.overall_score || 0,
        active_time_minutes: score?.total_active_time_minutes || 0,
        tasks_completed: completedTasks?.length || 0,
        standup_submitted: !!standup,
        highlights: {
          productive_time: score?.productive_time_minutes || 0,
          focus_score: score?.focus_score || 0,
          emails_sent: score?.emails_sent || 0,
          calls_made: score?.calls_made || 0,
        },
      };
      summaries.push(summary);
            }
    // Calculate team average
    const teamAvgScore =
      summaries.length > 0
        ? Math.round(summaries.reduce((sum, s) => sum + s.productivity_score, 0) / summaries.length)
        : 0;
    return NextResponse.json({
      success: true,
      date: today,
      team_summary: {
        employees_count: employees.length,
        avg_productivity_score: teamAvgScore,
        total_tasks_completed: summaries.reduce((sum, s) => sum + s.tasks_completed, 0),
        standups_submitted: summaries.filter((s) => s.standup_submitted).length,
      },
      individual_summaries: summaries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate summaries', details: error.message },
      { status: 500 }
    );
  }
}
