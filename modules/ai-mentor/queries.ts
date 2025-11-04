import { createClient } from '@/lib/supabase/server';

export type Conversation = {
  id: string;
  user_id: string;
  conversation_type: 'mentor' | 'interview' | 'general';
  topic_id: string | null;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  topics?: {
    title: string;
  } | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  tokens_used: number;
  model_used: string | null;
  created_at: string;
};

export async function getConversations(
  userId: string
): Promise<Conversation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ai_conversations')
    .select(`
      *,
      topics(title)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data || [];
}

export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .neq('role', 'system') // Don't show system messages to user
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

export async function getConversationTokenUsage(
  userId: string,
  startDate?: Date
): Promise<{ totalTokens: number; totalCost: number; messageCount: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('ai_messages')
    .select('tokens_used, model_used, ai_conversations!inner(user_id)')
    .eq('ai_conversations.user_id', userId);

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  const { data, error } = await query;

  if (error || !data) {
    return { totalTokens: 0, totalCost: 0, messageCount: 0 };
  }

  const totalTokens = data.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0);
  
  // Rough cost calculation (GPT-4o-mini pricing)
  // Input: $0.15/M, Output: $0.60/M - using average of $0.375/M
  const totalCost = (totalTokens / 1000000) * 0.375;

  return {
    totalTokens,
    totalCost,
    messageCount: data.length,
  };
}

