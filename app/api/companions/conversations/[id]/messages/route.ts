import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
// ================================================================
// GET - Fetch all messages for a conversation
// ================================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = (await createClient()) as any;
    const { id: conversationId } = await params;
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from('companion_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();
    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    // Fetch messages
    const { data: messages, error } = await supabase
      .from('companion_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
    return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
