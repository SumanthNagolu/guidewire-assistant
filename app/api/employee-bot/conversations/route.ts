import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// GET /api/employee-bot/conversations - Get user's conversations
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
    const limit = parseInt(searchParams.get('limit') || '20');
    // Fetch conversations
    const { data: conversations, error } = await supabase
      .from('bot_conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('bot_type', 'employee_bot')
      .order('last_message_at', { ascending: false })
      .limit(limit);
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      conversations: conversations || [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// POST /api/employee-bot/conversations - Create a new conversation
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
    const { title, mode } = body;
    const { data: conversation, error } = await supabase
      .from('bot_conversations')
      .insert({
        user_id: user.id,
        bot_type: 'employee_bot',
        title: title || 'New conversation',
        current_mode: mode || 'general',
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// DELETE /api/employee-bot/conversations - Delete a conversation
export async function DELETE(request: NextRequest) {
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
    const conversationId = searchParams.get('id');
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }
    // Verify ownership
    const { data: conversation } = await supabase
      .from('bot_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();
    if (!conversation || conversation.user_id !== user.id) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    // Delete conversation (messages will cascade delete)
    const { error } = await supabase
      .from('bot_conversations')
      .delete()
      .eq('id', conversationId);
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete conversation' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
