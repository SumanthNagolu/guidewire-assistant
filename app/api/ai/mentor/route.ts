import { createClient } from '@/lib/supabase/server';
import {
  DAILY_MENTOR_MESSAGE_LIMIT,
  getMentorUsageWindow,
} from '@/modules/ai-mentor/queries';
import type { Database, Json } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { z } from 'zod';

const mentorRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  topicId: z.string().uuid().optional().nullable(),
  conversationId: z.string().uuid().optional().nullable(),
});

const jsonError = (error: string, status = 400, data?: Record<string, unknown>) =>
  Response.json(
    {
      success: false,
      error,
      ...(data ? { data } : {}),
    },
    { status }
  );

type ProfileSelection = Pick<
  Database['public']['Tables']['user_profiles']['Row'],
  'first_name' | 'assumed_persona'
>;

type TopicSelection = Pick<
  Database['public']['Tables']['topics']['Row'],
  'id' | 'title' | 'description'
> & {
  products?: { name: string } | null;
};

type ConversationInsert = Database['public']['Tables']['ai_conversations']['Insert'];
type MessageInsert = Database['public']['Tables']['ai_messages']['Insert'];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate OpenAI API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error('[AI Mentor] OPENAI_API_KEY environment variable is not set!');
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const extractUsage = (value: unknown) => {
  if (!isRecord(value) || !isRecord(value.usage)) {
    return null;
  }

  const rawUsage = value.usage as Record<string, unknown>;

  const promptTokens =
    typeof rawUsage.prompt_tokens === 'number' ? rawUsage.prompt_tokens : undefined;
  const completionTokens =
    typeof rawUsage.completion_tokens === 'number'
      ? rawUsage.completion_tokens
      : undefined;
  const totalTokens =
    typeof rawUsage.total_tokens === 'number' ? rawUsage.total_tokens : undefined;

  if (
    promptTokens === undefined &&
    completionTokens === undefined &&
    totalTokens === undefined
  ) {
    return null;
  }

  return {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
  };
};

// Note: Using Node.js runtime (not Edge) because we need cookies() API for Supabase auth
// Edge runtime would be faster but doesn't support cookies() from next/headers

export async function POST(req: Request) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('[AI Mentor] OPENAI_API_KEY is not configured');
      return jsonError('AI service is not configured. Please contact support.', 503);
    }

    const body = await req.json().catch(() => null);
    console.log('[AI Mentor] Request body:', JSON.stringify(body));
    
    const parsed = mentorRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message ?? 'Invalid request payload';
      console.error('[AI Mentor] Validation error:', parsed.error.issues);
      return jsonError(firstIssue, 400);
    }

    const { message, topicId, conversationId } = parsed.data;

    const supabase = await createClient();
    // TODO: Replace this escape hatch with generated Supabase types once `supabase gen types` is integrated.
    const db = supabase as unknown as {
      from: (...args: any[]) => any;
    };

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError('Unauthorized', 401);
    }

    // Check daily usage window for rate limiting
    const windowStart = new Date();
    windowStart.setUTCHours(0, 0, 0, 0);

    const usageWindow = await getMentorUsageWindow(user.id, windowStart, supabase as SupabaseClient<Database>);

    if (usageWindow.messageCount >= DAILY_MENTOR_MESSAGE_LIMIT) {
      return jsonError('Daily mentor limit reached. Try again tomorrow or contact support.', 429, {
        limit: DAILY_MENTOR_MESSAGE_LIMIT,
      });
    }

    // Get user profile and topic info
    const profileResult = await db
      .from('user_profiles')
      .select('first_name, assumed_persona')
      .eq('id', user.id)
      .single();

    if (profileResult.error) {
      console.error('Failed to load user profile:', profileResult.error);
    }

    const profile = (profileResult.data as ProfileSelection | null) ?? null;

    let topic: TopicSelection | null = null;

    if (topicId) {
      const topicQuery = await db
        .from('topics')
        .select('id, title, description, products(name)')
        .eq('id', topicId)
        .single();

      if (topicQuery.error) {
        console.error('Failed to load topic for mentor prompt:', topicQuery.error);
      } else if (topicQuery.data) {
        topic = topicQuery.data as TopicSelection;
      }
    }

    // Get or create conversation
    let currentConversationId = conversationId ?? null;
    if (!currentConversationId) {
      const conversationInsert: ConversationInsert = {
        user_id: user.id,
        conversation_type: 'mentor',
        topic_id: topicId || null,
        status: 'active',
      };

      const { data: newConversation, error } = await db
        .from('ai_conversations')
        .insert(conversationInsert)
        .select()
        .single();

      if (error || !newConversation) {
        return jsonError('Failed to create conversation', 500);
      }

      currentConversationId = newConversation.id;
    }

    if (!currentConversationId) {
      return jsonError('Conversation unavailable', 500);
    }

    // Get recent messages (last 6 pairs = 12 messages)
    const { data: previousMessages } = await db
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: false })
      .limit(12);

    // Build context-aware system prompt
    const systemPrompt = `You are an expert Guidewire training mentor helping ${
      profile?.first_name || 'a student'
    }.

CRITICAL TEACHING RULES:
1. NEVER give direct answers to questions
2. Use the Socratic method - guide with questions
3. Help students discover solutions themselves
4. Provide hints when stuck, but not complete solutions
5. Keep responses under 150 words
6. Connect concepts to real insurance industry scenarios
7. Celebrate progress and encourage persistence

Student Context:
- Experience Level: ${profile?.assumed_persona || 'Not specified'}
${topic ? `- Current Topic: ${topic.title}` : ''}
${topic?.description ? `- Topic Description: ${topic.description}` : ''}

Teaching Principles:
- Break complex concepts into smaller steps
- Ask clarifying questions to check understanding
- Use analogies relevant to insurance workflows
- Encourage hands-on practice over memorization
- Build confidence through guided discovery

Respond in a supportive, encouraging tone that promotes active learning.`;

    // Build messages array (reverse to chronological order)
    const historyMessages = ((previousMessages ?? []) as Array<
      Pick<Database['public']['Tables']['ai_messages']['Row'], 'role' | 'content'>
    >)
      .reverse()
      .map((msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: message },
    ];

    // Save user message
    const userMetadata: Record<string, unknown> = {
      payloadType: 'user',
      topicId: topicId ?? null,
    };

    const userMessageInsert: MessageInsert = {
      conversation_id: currentConversationId,
      role: 'user',
      content: message,
      tokens_used: 0,
      model_used: 'gpt-4o-mini',
      metadata: userMetadata as Json,
    };

    const { data: userMessageRow, error: userMessageError } = await db
      .from('ai_messages')
      .insert(userMessageInsert)
      .select('id, metadata')
      .single();

    if (userMessageError || !userMessageRow) {
      console.error('Failed to record user mentor message:', userMessageError);
      return jsonError('Unable to record mentor question', 500);
    }

    const model = 'gpt-4o-mini';

    // Call OpenAI with streaming
    const response = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
      stream_options: { include_usage: true },
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const encoder = new TextEncoder();
    let fullResponse = '';
    let lastChunk: unknown = null;

    const persistAssistantMessage = async () => {
      const usage = extractUsage(lastChunk);
      const tokensUsed = usage?.total_tokens ?? Math.ceil(fullResponse.length / 4);

      const assistantMetadata = usage ? ({ usage } as Json) : undefined;
      const finalRecord = isRecord(lastChunk) ? lastChunk : null;
      const resolvedModel =
        finalRecord && typeof finalRecord.model === 'string'
          ? finalRecord.model
          : model;

      const assistantInsert: MessageInsert = {
        conversation_id: currentConversationId,
        role: 'assistant',
        content: fullResponse,
        tokens_used: tokensUsed,
        model_used: resolvedModel,
        metadata: assistantMetadata,
      };

      const { error: assistantError } = await db
        .from('ai_messages')
        .insert(assistantInsert)
        .select('id')
        .single();

      if (assistantError) {
        console.error('Failed to record mentor assistant message:', assistantError);
      }

      if (usage?.prompt_tokens && userMessageRow?.id) {
        const mergedMetadata: Record<string, unknown> = {
          ...(userMessageRow.metadata ?? {}),
          usage: {
            prompt_tokens: usage.prompt_tokens,
          },
        };

        const { error: updateError } = await db
          .from('ai_messages')
          .update({
            metadata: mergedMetadata as Json,
          })
          .eq('id', userMessageRow.id);

        if (updateError) {
          console.error('Failed to update mentor user message metadata:', updateError);
        }
      }
    };

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode('event: start\ndata: {}\n\n'));

          for await (const chunk of response) {
            lastChunk = chunk;
            const content = chunk?.choices?.[0]?.delta?.content ?? '';
            
            if (content) {
              fullResponse += content;
              controller.enqueue(
                encoder.encode(
                  `event: token\ndata: ${JSON.stringify({ value: content })}\n\n`
                )
              );
            }
          }

          await persistAssistantMessage();
          controller.enqueue(encoder.encode('event: close\ndata: {}\n\n'));
          controller.close();
        } catch (streamError) {
          controller.error(streamError);
        }
      },
    });

    const responseHeaders: Record<string, string> = {
      'X-Conversation-Id': currentConversationId,
      'X-RateLimit-Limit': String(DAILY_MENTOR_MESSAGE_LIMIT),
      'X-RateLimit-Remaining': String(
        Math.max(DAILY_MENTOR_MESSAGE_LIMIT - (usageWindow.messageCount + 1), 0)
      ),
      'X-Response-Meta': JSON.stringify({
        success: true,
        data: {
          conversationId: currentConversationId,
        },
      }),
    };

    // Return SSE response with conversation ID in headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        ...responseHeaders,
      },
    });
  } catch (error) {
    console.error('AI Mentor Error:', error);
    return jsonError('Internal server error', 500);
  }
}

