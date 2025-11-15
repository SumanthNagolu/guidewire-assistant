/**
 * HR → PRODUCTIVITY INTEGRATION
 * Attendance Handler - Links HR clock in/out to productivity tracking
 * 
 * When employee clocks in:
 * - Creates attendance record
 * - Starts productivity session
 * - Initializes employee bot for the day
 * - Sends daily targets
 * 
 * When employee clocks out:
 * - Ends productivity session
 * - Calculates productivity score
 * - Updates HR performance record
 * - Sends end-of-day summary
 */

import { createClient } from '@/lib/supabase/server';
import { getAIService } from '@/lib/ai/unified-service';

// ============================================================================
// TYPES
// ============================================================================

interface EmployeeTargets {
  calls: number;
  submissions: number;
  meetings: number;
  emails: number;
}

interface ProductivityScore {
  total: number;
  active_time_score: number;
  output_score: number;
  breakdown: {
    coding?: number;
    meetings?: number;
    email?: number;
    research?: number;
  };
  targetsMet: number;
  summary: string;
  achievements: string[];
}

// ============================================================================
// CLOCK IN HANDLER
// ============================================================================

export async function onClockIn(employeeId: string): Promise<void> {
  const supabase = createClient();

  try {
    // 1. Get employee details
    const { data: employee, error: empError } = await supabase
      .from('employee_records')
      .select('*, user_profiles(*)')
      .eq('id', employeeId)
      .single();

    if (empError || !employee) {
      throw new Error('Employee not found');
    }

    // 2. Create attendance record
    const today = new Date().toISOString().split('T')[0];
    const { error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        employee_id: employeeId,
        date: today,
        status: 'Present',
        clock_in_time: new Date().toISOString()
      });

    if (attendanceError && !attendanceError.message.includes('duplicate')) {
          }

    // 3. Start productivity session
    const { data: session, error: sessionError } = await supabase
      .from('productivity_sessions')
      .insert({
        user_id: employee.user_id,
        start_time: new Date().toISOString(),
        session_type: 'work_day',
        mouse_movements: 0,
        keystrokes: 0,
        active_time: 0,
        idle_time: 0
      })
      .select()
      .single();

    if (sessionError) {
          }

    // 4. Get employee targets for today
    const todayTargets = await getEmployeeTargets(supabase, employeeId);

    // 5. Get yesterday's score
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayScore = await getYesterdayScore(supabase, employee.user_id);

    // 6. Send good morning message via employee bot
    await employeeBotStartDay(supabase, {
      userId: employee.user_id,
      employeeName: employee.user_profiles.full_name,
      todayTargets,
      yesterdayScore,
      sessionId: session?.id
    });

    // 7. Log for learning system
    await supabase
      .from('system_feedback')
      .insert({
        entity_type: 'attendance',
        entity_id: employeeId,
        action_type: 'clock_in',
        outcome: 'success',
        performance_metrics: {
          time: new Date().toISOString(),
          session_id: session?.id
        }
      });

  } catch (error: any) {
        throw error;
  }
}

// ============================================================================
// CLOCK OUT HANDLER
// ============================================================================

export async function onClockOut(employeeId: string): Promise<void> {
  const supabase = createClient();

  try {
    // 1. Get employee details
    const { data: employee, error: empError } = await supabase
      .from('employee_records')
      .select('*, user_profiles(*)')
      .eq('id', employeeId)
      .single();

    if (empError || !employee) {
      throw new Error('Employee not found');
    }

    // 2. Update attendance record
    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from('attendance')
      .update({
        clock_out_time: new Date().toISOString()
      })
      .eq('employee_id', employeeId)
      .eq('date', today);

    // 3. End productivity session
    const { data: session } = await supabase
      .from('productivity_sessions')
      .update({
        end_time: new Date().toISOString()
      })
      .eq('user_id', employee.user_id)
      .is('end_time', null)
      .select()
      .single();

    // 4. Calculate productivity score
    const score = await calculateProductivityScore(supabase, employee.user_id, today);

    // 5. Save productivity score
    await supabase
      .from('productivity_scores')
      .insert({
        user_id: employee.user_id,
        date: today,
        score: score.total,
        active_time_score: score.active_time_score,
        output_score: score.output_score,
        category_scores: score.breakdown,
        ai_summary: score.summary
      });

    // 6. Update HR performance record
    await supabase
      .from('performance_history')
      .insert({
        employee_id: employeeId,
        date: today,
        productivity_score: score.total,
        targets_met: score.targetsMet,
        notes: score.summary
      });

    // 7. Send end-of-day summary via employee bot
    await employeeBotEndDay(supabase, {
      userId: employee.user_id,
      employeeName: employee.user_profiles.full_name,
      score: score.total,
      summary: score.summary,
      targetsMet: score.targetsMet,
      achievements: score.achievements,
      tomorrow: await getTomorrowTargets(supabase, employeeId)
    });

    // 8. Log for learning system
    await supabase
      .from('system_feedback')
      .insert({
        entity_type: 'attendance',
        entity_id: employeeId,
        action_type: 'clock_out',
        outcome: 'success',
        performance_metrics: {
          time: new Date().toISOString(),
          session_id: session?.id,
          productivity_score: score.total
        }
      });

  } catch (error: any) {
        throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get employee targets for today
 */
async function getEmployeeTargets(supabase: any, employeeId: string): Promise<EmployeeTargets> {
    // For now, return default targets based on role
  
  const { data: employee } = await supabase
    .from('employee_records')
    .select('designation')
    .eq('id', employeeId)
    .single();

  // Default targets based on role
  const defaultTargets: Record<string, EmployeeTargets> = {
    'Recruiter': { calls: 20, submissions: 5, meetings: 3, emails: 30 },
    'Sales Executive': { calls: 15, submissions: 0, meetings: 5, emails: 25 },
    'Sourcer': { calls: 10, submissions: 10, meetings: 2, emails: 20 },
    'Senior Consultant': { calls: 5, submissions: 0, meetings: 4, emails: 15 }
  };

  return defaultTargets[employee?.designation || 'Senior Consultant'] || {
    calls: 5,
    submissions: 0,
    meetings: 2,
    emails: 15
  };
}

/**
 * Get yesterday's productivity score
 */
async function getYesterdayScore(supabase: any, userId: string): Promise<number> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split('T')[0];

  const { data: score } = await supabase
    .from('productivity_scores')
    .select('score')
    .eq('user_id', userId)
    .eq('date', yesterdayDate)
    .single();

  return score?.score || 0;
}

/**
 * Get tomorrow's targets
 */
async function getTomorrowTargets(supabase: any, employeeId: string): Promise<EmployeeTargets> {
  // For now, same as today's targets
  // In future, this could be AI-adjusted based on today's performance
  return getEmployeeTargets(supabase, employeeId);
}

/**
 * Calculate productivity score based on session data
 */
async function calculateProductivityScore(
  supabase: any,
  userId: string,
  date: string
): Promise<ProductivityScore> {
  // Get all screenshots for the day
  const { data: screenshots } = await supabase
    .from('productivity_screenshots')
    .select('productivity_score, focus_score, work_category')
    .eq('user_id', userId)
    .gte('captured_at', `${date}T00:00:00`)
    .lt('captured_at', `${date}T23:59:59`);

  if (!screenshots || screenshots.length === 0) {
    return {
      total: 0,
      active_time_score: 0,
      output_score: 0,
      breakdown: {},
      targetsMet: 0,
      summary: 'No productivity data available for this day',
      achievements: []
    };
  }

  // Calculate average scores
  const avgProductivityScore = screenshots.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / screenshots.length;
  const avgFocusScore = screenshots.reduce((sum, s) => sum + (s.focus_score || 0), 0) / screenshots.length;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  screenshots.forEach((s: any) => {
    if (s.work_category) {
      categoryBreakdown[s.work_category] = (categoryBreakdown[s.work_category] || 0) + 1;
    }
  });

  // Convert counts to percentages
  const breakdown: any = {};
  Object.entries(categoryBreakdown).forEach(([category, count]) => {
    breakdown[category] = Math.round((count / screenshots.length) * 100);
  });

  // Overall score (weighted average)
  const totalScore = Math.round((avgProductivityScore * 0.7) + (avgFocusScore * 0.3));

  // Generate summary
  const summary = `Productivity: ${totalScore}/100. Active ${screenshots.length * 5} minutes. Most time on ${Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'work'}.`;

  // Achievements
  const achievements: string[] = [];
  if (totalScore >= 90) achievements.push('🌟 Exceptional performance!');
  if (totalScore >= 80) achievements.push('⭐ High productivity achieved');
  if (avgFocusScore >= 85) achievements.push('🎯 Excellent focus maintained');

  return {
    total: totalScore,
    active_time_score: Math.round(avgFocusScore),
    output_score: Math.round(avgProductivityScore),
    breakdown,
    targetsMet: 0,     summary,
    achievements
  };
}

/**
 * Employee bot - start of day message
 */
async function employeeBotStartDay(supabase: any, params: {
  userId: string;
  employeeName: string;
  todayTargets: EmployeeTargets;
  yesterdayScore: number;
  sessionId?: string;
}): Promise<void> {
  const aiService = getAIService();

  const prompt = `Generate a friendly, motivating good morning message for ${params.employeeName}.

Yesterday's productivity: ${params.yesterdayScore}/100
Today's targets: ${params.todayTargets.calls} calls, ${params.todayTargets.submissions} submissions, ${params.todayTargets.meetings} meetings

Be brief (2-3 sentences), encouraging, and specific.`;

  try {
    const message = await aiService.chat(
      params.userId,
      'employee_bot',
      [{ role: 'user', content: prompt }],
      {
        model: 'gpt-4o-mini',
        systemPrompt: 'You are a helpful employee productivity assistant. Be encouraging and specific.',
        stream: false
      }
    ) as string;

    // Save as notification
    await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: 'info',
        category: 'productivity',
        title: 'Good Morning!',
        message: message
      });
  } catch (error) {
      }
}

/**
 * Employee bot - end of day summary
 */
async function employeeBotEndDay(supabase: any, params: {
  userId: string;
  employeeName: string;
  score: number;
  summary: string;
  targetsMet: number;
  achievements: string[];
  tomorrow: EmployeeTargets;
}): Promise<void> {
  const aiService = getAIService();

  const prompt = `Generate an encouraging end-of-day summary for ${params.employeeName}.

Today's Performance:
- Score: ${params.score}/100
- Summary: ${params.summary}
- Achievements: ${params.achievements.join(', ') || 'None'}

Tomorrow's Plan: ${params.tomorrow.calls} calls, ${params.tomorrow.submissions} submissions

Be motivating and forward-looking. Include 1 specific tip for tomorrow.`;

  try {
    const message = await aiService.chat(
      params.userId,
      'employee_bot',
      [{ role: 'user', content: prompt }],
      {
        model: 'gpt-4o-mini',
        systemPrompt: 'You are a supportive employee productivity coach. Celebrate wins and provide constructive guidance.',
        stream: false
      }
    ) as string;

    // Save as notification
    await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: 'success',
        category: 'productivity',
        title: 'Day Complete!',
        message: message
      });
  } catch (error) {
      }
}

