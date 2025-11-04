import { createClient } from '@/lib/supabase/server';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Note: Using Node.js runtime (not Edge) because we need cookies() API for Supabase auth
// Edge runtime would be faster but doesn't support cookies() from next/headers

export async function POST(req: Request) {
  try {
    const { message, topicId, conversationId } = await req.json();

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get user profile and topic info
    const [{ data: profile }, { data: topic }] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('first_name, assumed_persona')
        .eq('id', user.id)
        .single(),
      topicId
        ? supabase
            .from('topics')
            .select('title, description, content, products(name)')
            .eq('id', topicId)
            .single()
        : Promise.resolve({ data: null }),
    ]);

    // Get or create conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const { data: newConversation, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          conversation_type: 'mentor',
          topic_id: topicId || null,
          status: 'active',
        })
        .select()
        .single();

      if (error || !newConversation) {
        return new Response('Failed to create conversation', { status: 500 });
      }

      currentConversationId = newConversation.id;
    }

    // Get recent messages (last 6 pairs = 12 messages)
    const { data: previousMessages } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: false })
      .limit(12);

    // Build context-aware system prompt
    const systemPrompt = `You are an expert Guidewire training mentor helping ${profile?.first_name || 'a student'}.

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
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...(previousMessages?.reverse() || []),
      { role: 'user', content: message },
    ];

    // Save user message
    await supabase.from('ai_messages').insert({
      conversation_id: currentConversationId,
      role: 'user',
      content: message,
      tokens_used: Math.ceil(message.length / 4), // Rough estimate
      model_used: 'gpt-4o-mini',
    });

    // Call OpenAI with streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    });

    // Track tokens and response
    let fullResponse = '';
    let tokensUsed = 0;

    const stream = OpenAIStream(response, {
      onCompletion: async (completion) => {
        fullResponse = completion;
        tokensUsed = Math.ceil(completion.length / 4); // Rough estimate

        // Save assistant message
        await supabase.from('ai_messages').insert({
          conversation_id: currentConversationId,
          role: 'assistant',
          content: fullResponse,
          tokens_used: tokensUsed,
          model_used: 'gpt-4o-mini',
        });
      },
    });

    // Return streaming response with conversation ID in headers
    return new StreamingTextResponse(stream, {
      headers: {
        'X-Conversation-Id': currentConversationId,
      },
    });
  } catch (error) {
    console.error('AI Mentor Error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

