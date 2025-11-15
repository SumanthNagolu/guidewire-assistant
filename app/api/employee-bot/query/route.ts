import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// POST /api/employee-bot/query - Query the Employee Bot
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
    const { query, mode, conversation_id } = body;
    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }
    const selectedMode = mode || 'general';
    // Get or create conversation
    let conversationId = conversation_id;
    if (!conversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('bot_conversations')
        .insert({
          user_id: user.id,
          bot_type: 'employee_bot',
          current_mode: selectedMode,
          title: query.substring(0, 50),
        })
        .select()
        .single();
      if (convError) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
      }
      conversationId = newConv.id;
    }
    // Save user message
    await supabase.from('bot_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: query,
      mode: selectedMode,
    });
    // Get conversation history
    const { data: messages } = await supabase
      .from('bot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10); // Last 10 messages
    // Get user context (productivity data, tasks, etc.)
    const context = await getUserContext(supabase, user.id);
    // Generate response based on mode
    const response = await generateResponse(query, selectedMode, context, messages || []);
    // Save assistant message
    await supabase.from('bot_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: response.content,
      mode: selectedMode,
      model_used: response.model,
      tokens_used: response.tokens,
    });
    // Update conversation
    await supabase
      .from('bot_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        current_mode: selectedMode,
      })
      .eq('id', conversationId);
    // Execute actions if any
    if (response.actions && response.actions.length > 0) {
      for (const action of response.actions) {
        await executeAction(supabase, user.id, conversationId, action);
      }
    }
    return NextResponse.json({
      success: true,
      conversation_id: conversationId,
      response: response.content,
      mode: selectedMode,
      actions: response.actions || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process query', details: error.message },
      { status: 500 }
    );
  }
}
async function getUserContext(supabase: any, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  // Get today's productivity score
  const { data: prodScore } = await supabase
    .from('productivity_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
  // Get today's standup
  const { data: standup } = await supabase
    .from('daily_standups')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
  // Get active tasks
  const { data: activeTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', userId)
    .in('status', ['todo', 'in_progress'])
    .order('priority', { ascending: false })
    .limit(10);
  // Get active sprint
  const { data: activeSprint } = await supabase
    .from('sprints')
    .select('*')
    .eq('status', 'active')
    .single();
  // Get recent bottlenecks
  const { data: bottlenecks } = await supabase
    .from('bottlenecks')
    .select('*')
    .eq('affected_user_id', userId)
    .eq('status', 'open')
    .order('detected_at', { ascending: false })
    .limit(5);
  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, role, department')
    .eq('id', userId)
    .single();
  return {
    profile,
    productivity_today: prodScore,
    standup_today: standup,
    active_tasks: activeTasks || [],
    active_sprint: activeSprint,
    bottlenecks: bottlenecks || [],
    today: today,
  };
}
async function generateResponse(query: string, mode: string, context: any, history: any[]) {
  // Build system prompt based on mode
  const systemPrompt = getSystemPrompt(mode, context);
  // Build conversation history
  const conversationHistory = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
  // Call GPT-4o for initial response
  const startTime = Date.now();
  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: query },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });
  const gptContent = gptResponse.choices[0].message.content || '';
  const gptTokens = gptResponse.usage?.total_tokens || 0;
  // Refine with Claude for human-like tone
  const claudeResponse = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a friendly, supportive AI productivity assistant. Refine this response to be more human, empathetic, and encouraging while keeping the same information and structure:\n\n${gptContent}`,
      },
    ],
  });
  const refinedContent =
    claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : gptContent;
  const responseTime = Date.now() - startTime;
  // Extract actions from response (if any)
  const actions = extractActions(refinedContent, mode);
  return {
    content: refinedContent,
    model: 'gpt-4o + claude-3.5-sonnet',
    tokens: gptTokens,
    response_time_ms: responseTime,
    actions,
  };
}
function getSystemPrompt(mode: string, context: any): string {
  const baseContext = `
You are an AI Employee Bot for IntimeSolutions, a friendly and supportive productivity assistant.
User Context:
- Name: ${context.profile?.first_name} ${context.profile?.last_name}
- Role: ${context.profile?.role}
- Today's Date: ${context.today}
- Productivity Score Today: ${context.productivity_today?.overall_score || 'Not yet calculated'}
- Active Tasks: ${context.active_tasks?.length || 0}
- Standup Submitted: ${context.standup_today ? 'Yes' : 'No'}
${context.active_sprint ? `- Active Sprint: ${context.active_sprint.name}` : ''}
${context.bottlenecks?.length > 0 ? `- Active Bottlenecks: ${context.bottlenecks.length}` : ''}
`;
  const modePrompts = {
    standup: `${baseContext}
**MODE: Daily Standup Assistant**
Your job is to help the user complete their daily standup. Ask them:
1. What did you accomplish yesterday?
2. What are you working on today?
3. Any blockers or challenges?
Be conversational and encouraging. If they mention blockers, offer to help or suggest solutions.
After collecting all information, confirm and let them know you'll save it.`,
    coach: `${baseContext}
**MODE: Productivity Coach**
You are a productivity coach analyzing the user's work patterns and providing actionable advice.
Current productivity data:
${context.productivity_today ? `
- Active time: ${context.productivity_today.total_active_time_minutes} minutes
- Productive time: ${context.productivity_today.productive_time_minutes} minutes
- Focus score: ${context.productivity_today.focus_score}/100
- Tasks completed: ${context.productivity_today.tasks_completed}
` : 'No data for today yet.'}
${context.bottlenecks?.length > 0 ? `\nCurrent issues:\n${context.bottlenecks.map((b: any) => `- ${b.detection_reason}`).join('\n')}` : ''}
Provide specific, actionable advice. Celebrate wins. Be empathetic about challenges.`,
    project_manager: `${baseContext}
**MODE: Project Manager**
You are a project management assistant helping with tasks, sprints, and team coordination.
${context.active_sprint ? `
Active Sprint: ${context.active_sprint.name}
- Start: ${context.active_sprint.start_date}
- End: ${context.active_sprint.end_date}
- Goal: ${context.active_sprint.goal}
- Progress: ${context.active_sprint.completed_story_points}/${context.active_sprint.planned_story_points} points
` : 'No active sprint.'}
Active Tasks (${context.active_tasks?.length || 0}):
${context.active_tasks?.slice(0, 5).map((t: any) => `- ${t.title} [${t.status}] ${t.priority}`).join('\n') || 'None'}
Help with sprint planning, task assignment, velocity tracking, and deadlines.`,
    workflow: `${baseContext}
**MODE: Workflow Assistant**
You are a workflow automation assistant. You can help with:
- Creating tasks
- Scheduling meetings
- Checking productivity stats
- Finding blockers
- Generating reports
Understand the user's intent and offer to execute actions. Use commands like:
- CREATE_TASK: Create a new task
- UPDATE_TASK: Update task status
- SCHEDULE_MEETING: Schedule a meeting (future feature)
- GET_STATS: Show productivity stats
- IDENTIFY_BLOCKERS: Find and explain bottlenecks`,
    general: `${baseContext}
**MODE: General Assistant**
You are a helpful AI assistant for productivity and project management at IntimeSolutions.
You can help with:
- Daily standups
- Productivity coaching
- Project management
- Task management
- Answering questions about work
Be friendly, professional, and proactive. Suggest modes if the user needs specialized help.`,
  };
  return modePrompts[mode as keyof typeof modePrompts] || modePrompts.general;
}
function extractActions(response: string, mode: string): any[] {
  const actions: any[] = [];
  // Extract action commands from response
  const actionPatterns = [
    /CREATE_TASK:\s*(.+)/gi,
    /UPDATE_TASK:\s*(.+)/gi,
    /SUBMIT_STANDUP/gi,
    /SCHEDULE_MEETING:\s*(.+)/gi,
  ];
  actionPatterns.forEach((pattern) => {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      if (match[0].includes('CREATE_TASK')) {
        actions.push({ type: 'create_task', payload: match[1] });
      } else if (match[0].includes('UPDATE_TASK')) {
        actions.push({ type: 'update_task', payload: match[1] });
      } else if (match[0].includes('SUBMIT_STANDUP')) {
        actions.push({ type: 'submit_standup', payload: null });
      } else if (match[0].includes('SCHEDULE_MEETING')) {
        actions.push({ type: 'schedule_meeting', payload: match[1] });
      }
    }
  });
  return actions;
}
async function executeAction(supabase: any, userId: string, conversationId: string, action: any) {
  try {
    const { type, payload } = action;
    let result: any = null;
    let relatedId: string | null = null;
    switch (type) {
      case 'create_task':
        const { data: task } = await supabase
          .from('tasks')
          .insert({
            title: payload,
            assigned_to: userId,
            reporter_id: userId,
            status: 'todo',
            priority: 'medium',
          })
          .select()
          .single();
        result = task;
        relatedId = task?.id;
        break;
      case 'submit_standup':
        // Standup submission handled separately
        break;
      // Add more action types as needed
    }
    // Log action
    await supabase.from('bot_actions').insert({
      conversation_id: conversationId,
      user_id: userId,
      action_type: type,
      action_payload: payload,
      action_result: result,
      related_task_id: relatedId,
      action_status: 'completed',
      executed_at: new Date().toISOString(),
    });
  } catch (error) {
    // Log failed action
    await supabase.from('bot_actions').insert({
      conversation_id: conversationId,
      user_id: userId,
      action_type: action.type,
      action_payload: action.payload,
      action_status: 'failed',
      error_message: String(error),
    });
  }
}
