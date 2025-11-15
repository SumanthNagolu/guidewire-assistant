import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
// GET /api/cron/weekly-review - Generate weekly review (runs Friday at 5 PM)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    const db = supabase;
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    // Get all active employees
    const { data: employees } = await db
      .from('user_profiles')
      .select('id, first_name, last_name, email, role')
      .in('role', ['employee', 'recruiter', 'sales', 'operations', 'admin']);
    if (!employees) {
      return NextResponse.json({ message: 'No employees found' });
    }
    const weeklyReviews = [];
    for (const employee of employees) {
      // Get week's productivity scores
      const { data: weekScores } = await db
        .from('productivity_scores')
        .select('*')
        .eq('user_id', employee.id)
        .gte('date', weekAgoStr)
        .lte('date', todayStr);
      if (!weekScores || weekScores.length === 0) {
        continue;
      }
      // Calculate weekly metrics
      const avgScore = Math.round(
        weekScores.reduce((sum: number, s: any) => sum + s.overall_score, 0) / weekScores.length
      );
      const totalActiveTime = weekScores.reduce(
        (sum: number, s: any) => sum + s.total_active_time_minutes,
        0
      );
      const totalTasks = weekScores.reduce((sum: number, s: any) => sum + s.tasks_completed, 0);
      const avgFocusScore = Math.round(
        weekScores.reduce((sum: number, s: any) => sum + s.focus_score, 0) / weekScores.length
      );
      // Get week's standups
      const { data: standups } = await db
        .from('daily_standups')
        .select('*')
        .eq('user_id', employee.id)
        .gte('date', weekAgoStr)
        .lte('date', todayStr);
      // Get bottlenecks
      const { data: bottlenecks } = await db
        .from('bottlenecks')
        .select('*')
        .eq('affected_user_id', employee.id)
        .eq('status', 'open')
        .gte('detected_at', weekAgo.toISOString());
      const review = {
        user_id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        email: employee.email,
        week_ending: todayStr,
        metrics: {
          avg_productivity_score: avgScore,
          total_active_time_minutes: totalActiveTime,
          avg_active_time_per_day: Math.round(totalActiveTime / weekScores.length),
          total_tasks_completed: totalTasks,
          avg_focus_score: avgFocusScore,
          standups_completed: standups?.length || 0,
          standups_expected: 5, // Mon-Fri
        },
        performance: {
          trend: calculateTrend(weekScores),
          best_day: getBestDay(weekScores),
          areas_of_concern: bottlenecks?.map((b: any) => b.type) || [],
        },
        bottlenecks: bottlenecks?.length || 0,
      };
      weeklyReviews.push(review);
            logger.info(`Weekly review for ${employee.first_name}: ${avgScore} avg score`);
    }
    // Team-level analysis
    const teamAvgScore =
      weeklyReviews.length > 0
        ? Math.round(
            weeklyReviews.reduce(
              (sum: number, r: any) => sum + r.metrics.avg_productivity_score,
              0
            ) / weeklyReviews.length
          )
        : 0;
    const totalTeamTasks = weeklyReviews.reduce(
      (sum: number, r: any) => sum + r.metrics.total_tasks_completed,
      0
    );
    // Check sprint completion (if active sprint)
      const { data: activeSprint } = await db
      .from('sprints')
      .select('*')
      .eq('status', 'active')
      .single();
    const sprintInfo = activeSprint
      ? {
          name: activeSprint.name,
          progress: Math.round(
            (activeSprint.completed_story_points / activeSprint.planned_story_points) * 100
          ),
          on_track: activeSprint.completed_story_points >= activeSprint.planned_story_points * 0.5,
        }
      : null;
    return NextResponse.json({
      success: true,
      week_ending: todayStr,
      team_summary: {
        employees_count: employees.length,
        avg_productivity_score: teamAvgScore,
        total_tasks_completed: totalTeamTasks,
        avg_standup_completion:
          weeklyReviews.length > 0
            ? Math.round(
                (weeklyReviews.reduce(
                  (sum: number, r: any) => sum + r.metrics.standups_completed,
                  0
                ) /
                  weeklyReviews.length /
                  5) *
                  100
              )
            : 0,
      },
      sprint_info: sprintInfo,
      individual_reviews: weeklyReviews,
      top_performers: weeklyReviews
        .sort((a, b) => b.metrics.avg_productivity_score - a.metrics.avg_productivity_score)
        .slice(0, 3),
      needs_attention: weeklyReviews.filter((r) => r.metrics.avg_productivity_score < 50 || r.bottlenecks > 0),
    });
  } catch (error: any) {
    logger.error('Weekly review cron error:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly review', details: error.message },
      { status: 500 }
    );
  }
}
function calculateTrend(scores: any[]): string {
  if (scores.length < 2) return 'stable';
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  const firstAvg =
    firstHalf.reduce((sum: number, s: any) => sum + s.overall_score, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum: number, s: any) => sum + s.overall_score, 0) / secondHalf.length;
  const diff = secondAvg - firstAvg;
  if (diff > 10) return 'improving';
  if (diff < -10) return 'declining';
  return 'stable';
}
function getBestDay(scores: any[]): { date: string; score: number } {
  if (scores.length === 0) return { date: '', score: 0 };
  const best = scores.reduce((max: any, s: any) =>
    s.overall_score > max.overall_score ? s : max
  );
  return { date: best.date, score: best.overall_score };
}
