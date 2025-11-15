import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
// ================================================================
// GET - List all conversations for current user
// ================================================================
export async function GET(request: Request) {
  try {
    const supabase = (await createClient()) as any;
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get conversations with message count
    const { data: conversations, error } = await supabase
      .from('companion_conversations')
      .select(`
        id,
        agent_name,
        capability,
        title,
        created_at,
        updated_at,
        companion_messages (
          id
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }
    // Format response
    const formattedConversations = conversations?.map((conv: any) => ({
      id: conv.id,
      agentName: conv.agent_name,
      capability: conv.capability,
      title: conv.title,
      messageCount: Array.isArray(conv.companion_messages) ? conv.companion_messages.length : 0,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at
    })) || [];
    return NextResponse.json({ conversations: formattedConversations });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
// ================================================================
// POST - Create a new conversation
// ================================================================
export async function POST(request: Request) {
  try {
    const supabase = (await createClient()) as any;
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Parse request
    const { agentName = 'guidewire-guru', capability = 'qa', title } = await request.json();
    // Create conversation
    const { data, error } = await supabase
      .from('companion_conversations')
      .insert({
        user_id: user.id,
        agent_name: agentName,
        capability,
        title: title || 'New Conversation'
      })
      .select()
      .single();
    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
    return NextResponse.json({ conversation: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
// ================================================================
// DELETE - Delete a conversation
// ================================================================
export async function DELETE(request: Request) {
  try {
    const supabase = (await createClient()) as any;
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Parse request
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }
    // Delete conversation (messages will cascade delete)
    const { error } = await supabase
      .from('companion_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id); // Ensure user owns this conversation
    if (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
