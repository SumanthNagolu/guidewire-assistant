import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '@/types/database';
type AiConversationRow = Database['public']['Tables']['ai_conversations']['Row'];
type AiMessageRow = Database['public']['Tables']['ai_messages']['Row'];


export const DAILY_MENTOR_MESSAGE_LIMIT = 50;

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

export type MentorUsageSummary = {
  messageCount: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

type UsageMetadata = {
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

const createUsageSummary = (): MentorUsageSummary => ({
  messageCount: 0,
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object';

const extractUsage = (metadata: Json | null) => {
  if (!isRecord(metadata) || !isRecord((metadata as UsageMetadata).usage)) {
    return null;
  }

  const usage = (metadata as UsageMetadata).usage;

  return {
    promptTokens:
      typeof usage?.prompt_tokens === 'number' ? usage.prompt_tokens : 0,
    completionTokens:
      typeof usage?.completion_tokens === 'number' ? usage.completion_tokens : 0,
    totalTokens:
      typeof usage?.total_tokens === 'number' ? usage.total_tokens : 0,
  };
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
        return [];
  }

  return (data || []) as Conversation[];
}

export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .neq('role', 'system')
    .order('created_at', { ascending: true });

  if (error) {
        return [];
  }

  return (data || []) as Message[];
}

export async function getMentorUsageWindow(
  userId: string,
  windowStart: Date,
  supabaseClient?: SupabaseClient<Database>
): Promise<MentorUsageSummary> {
  const supabase = supabaseClient ?? (await createClient());

  const { data: conversations, error: conversationError } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('user_id', userId)
    .eq('conversation_type', 'mentor');

  if (conversationError) {
        return createUsageSummary();
  }

  const conversationIds = ((conversations ?? []) as Pick<
    AiConversationRow,
    'id'
  >[]).map((row) => row.id);

  if (!conversationIds.length) {
    return createUsageSummary();
  }

  const { data: messages, error: messagesError } = await supabase
    .from('ai_messages')
    .select('role, tokens_used, metadata, created_at')
    .in('conversation_id', conversationIds)
    .gte('created_at', windowStart.toISOString());

  if (messagesError || !messages) {
    if (messagesError) {
          }
    return createUsageSummary();
  }

  const typedMessages = (messages ?? []) as Array<Pick<
    AiMessageRow,
    'role' | 'tokens_used' | 'metadata' | 'created_at'
  >>;

  return typedMessages.reduce((acc, message) => {
    if (message.role === 'user') {
      acc.messageCount += 1;
    }

    const usage = extractUsage(message.metadata);

    if (usage) {
      acc.promptTokens += usage.promptTokens;
      acc.completionTokens += usage.completionTokens;
      acc.totalTokens += usage.totalTokens;
      return acc;
    }

    if (typeof message.tokens_used === 'number') {
      acc.totalTokens += message.tokens_used;
    }

    return acc;
  }, createUsageSummary());
}

export async function getConversationTokenUsage(
  userId: string,
  startDate?: Date
): Promise<{ totalTokens: number; totalCost: number; messageCount: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('ai_messages')
    .select('tokens_used, model_used, metadata, ai_conversations!inner(user_id)')
    .eq('ai_conversations.user_id', userId);

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  const { data, error } = await query;

  if (error || !data) {
    return { totalTokens: 0, totalCost: 0, messageCount: 0 };
  }

  const typedMessages = (data ?? []) as Array<
    Pick<AiMessageRow, 'tokens_used' | 'metadata'>
  >;

  const totalTokens = typedMessages.reduce((sum, msg) => {
    const usage = extractUsage(msg.metadata);

    if (usage) {
      return sum + usage.totalTokens;
    }

    return sum + (msg.tokens_used || 0);
  }, 0);

  const totalCost = (totalTokens / 1_000_000) * 0.375;

  return {
    totalTokens,
    totalCost,
    messageCount: data.length,
  };
}

