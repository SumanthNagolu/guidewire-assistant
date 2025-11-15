import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// POST /api/employee-bot/actions - Execute a bot action
export async function POST(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;
    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { action_type, payload, conversation_id } = body;
    if (!action_type) {
      return NextResponse.json({ error: 'Action type required' }, { status: 400 });
    }
    let result: any = null;
    let relatedTaskId: string | null = null;
    let relatedStandupId: string | null = null;
    let status = 'completed';
    let errorMessage: string | null = null;
    try {
      switch (action_type) {
        case 'create_task':
          const { title, description, priority, sprint_id } = payload;
          const { data: task, error: taskError } = await supabase
            .from('tasks')
            .insert({
              title: title || payload,
              description: description || '',
              assigned_to: user.id,
              reporter_id: user.id,
              status: 'todo',
              priority: priority || 'medium',
              sprint_id: sprint_id || null,
            })
            .select()
            .single();
          if (taskError) throw taskError;
          result = task;
          relatedTaskId = task.id;
          break;
        case 'update_task':
          const { task_id, new_status, new_priority } = payload;
          const { data: updatedTask, error: updateError } = await supabase
            .from('tasks')
            .update({
              status: new_status || payload.status,
              priority: new_priority || payload.priority,
              updated_at: new Date().toISOString(),
            })
            .eq('id', task_id)
            .eq('assigned_to', user.id)
            .select()
            .single();
          if (updateError) throw updateError;
          result = updatedTask;
          relatedTaskId = task_id;
          break;
        case 'submit_standup':
          const { what_did, what_will, blockers, mood } = payload;
          const today = new Date().toISOString().split('T')[0];
          const { data: standup, error: standupError } = await supabase
            .from('daily_standups')
            .upsert(
              {
                user_id: user.id,
                date: today,
                what_did_yesterday: what_did,
                what_will_do_today: what_will,
                blockers: blockers || null,
                mood: mood || 'good',
                collected_by_bot: true,
                conversation_id: conversation_id || null,
              },
              { onConflict: 'user_id,date' }
            )
            .select()
            .single();
          if (standupError) throw standupError;
          result = standup;
          relatedStandupId = standup.id;
          break;
        case 'schedule_meeting':
          // Future implementation
          throw new Error('Meeting scheduling not yet implemented');
        case 'create_sprint':
          const { name, start_date, end_date, goal, planned_points } = payload;
          const { data: sprint, error: sprintError } = await supabase
            .from('sprints')
            .insert({
              name,
              start_date,
              end_date,
              goal,
              planned_story_points: planned_points || 0,
              status: 'planning',
              created_by: user.id,
            })
            .select()
            .single();
          if (sprintError) throw sprintError;
          result = sprint;
          break;
        default:
          throw new Error(`Unknown action type: ${action_type}`);
      }
    } catch (actionError: any) {
      status = 'failed';
      errorMessage = actionError.message;
    }
    // Log action
    const { data: actionLog } = await supabase
      .from('bot_actions')
      .insert({
        conversation_id: conversation_id || null,
        user_id: user.id,
        action_type,
        action_payload: payload,
        action_result: result,
        related_task_id: relatedTaskId,
        related_standup_id: relatedStandupId,
        action_status: status,
        error_message: errorMessage,
        executed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .select()
      .single();
    return NextResponse.json({
      success: status === 'completed',
      action_id: actionLog?.id,
      result,
      status,
      error: errorMessage,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to execute action', details: error.message },
      { status: 500 }
    );
  }
}
// GET /api/employee-bot/actions - Get user's bot actions
export async function GET(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;
    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const conversationId = searchParams.get('conversation_id');
    let query = supabase
      .from('bot_actions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    }
    const { data: actions, error } = await query;
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      actions: actions || [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
