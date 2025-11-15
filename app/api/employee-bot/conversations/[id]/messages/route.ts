import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
// GET /api/employee-bot/conversations/[id]/messages - Get conversation messages
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = (await createClient()) as any;
    const { id: conversationId } = await params;
    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Verify conversation ownership
    const { data: conversation } = await supabase
      .from('bot_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();
    if (!conversation || conversation.user_id !== user.id) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    // Fetch messages
    const { data: messages, error } = await supabase
      .from('bot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      conversation_id: conversationId,
      messages: messages || [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
