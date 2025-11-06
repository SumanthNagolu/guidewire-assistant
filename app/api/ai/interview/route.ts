import { createClient } from '@/lib/supabase/server';
import {
  appendInterviewMessage,
  createInterviewSession,
} from '@/modules/assessments/interviews';
import type { Database, Json } from '@/types/database';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const requestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  candidateMessage: z.string().optional(),
});

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

const jsonError = (error: string, status = 400) =>
  Response.json({ success: false, error }, { status });

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(raw);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message ?? 'Invalid payload';
      return jsonError(issue, 400);
    }

    const { sessionId: maybeSessionId, templateId, candidateMessage } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError('Unauthorized', 401);
    }

    const db = supabase as unknown as {
      from: (...args: any[]) => any;
    };

    let sessionId = maybeSessionId ?? null;

    if (!sessionId) {
      const session = await createInterviewSession({
        templateId: templateId ?? null,
        metadata: {},
      });
      sessionId = session.id;
    }

    const sessionQuery = await db
      .from('interview_sessions')
      .select(
        '*, interview_templates(id, title, description, persona, focus_area, rubric, product_id)'
      )
      .eq('id', sessionId)
      .single();

    if (sessionQuery.error || !sessionQuery.data) {
      return jsonError('Interview session not found', 404);
    }

    const session = sessionQuery.data as Database['public']['Tables']['interview_sessions']['Row'] & {
      interview_templates: {
        title: string;
        description: string | null;
        persona: string | null;
        focus_area: string | null;
        rubric: Json;
      } | null;
    };

    if (candidateMessage) {
      await appendInterviewMessage({
        sessionId,
        role: 'candidate',
        content: candidateMessage,
      });
    }

    const { data: history } = await db
      .from('interview_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    const historyMessages = (history ?? []) as Array<{
      role: 'system' | 'interviewer' | 'candidate';
      content: string;
    }>;

    const systemPrompt = `You are acting as a Guidewire interview coach running a mock interview.

Instructions:
- Ask one question at a time.
- After each candidate response, provide concise structured feedback using this exact format:
QUESTION: <next interview question>
FEEDBACK:
- Clarity: <0-10 score> - <comment>
- Completeness: <0-10 score> - <comment>
- Guidewire Alignment: <0-10 score> - <comment>
NEXT_STEP: <encouraging suggestion or follow-up direction>

Session context:
- Template Title: ${session.interview_templates?.title ?? 'Guidewire Interview'}
${session.interview_templates?.description ? `- Description: ${session.interview_templates.description}` : ''}
${session.interview_templates?.focus_area ? `- Focus Area: ${session.interview_templates.focus_area}` : ''}
${session.interview_templates?.persona ? `- Candidate Persona: ${session.interview_templates.persona}` : ''}

Keep responses under 180 words. Encourage the learner and remain professional.`;

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...historyMessages.map((message) => ({
        role: (message.role === 'candidate' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: message.content,
      })),
    ];

    if (!candidateMessage) {
      messages.push({
        role: 'user',
        content:
          'Please begin the interview by asking the first question aligned with the template focus area. Do not provide feedback yet.',
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      stream_options: { include_usage: true },
      max_tokens: 600,
      temperature: 0.8,
    });

    const encoder = new TextEncoder();
    let fullResponse = '';
    let lastChunk: unknown = null;

    const persistAssistantMessage = async () => {
      try {
        await appendInterviewMessage({
          sessionId,
          role: 'interviewer',
          content: fullResponse,
        });
      } catch (error) {
        console.error('Failed to save interviewer message:', error);
      }

      const usage = extractUsage(lastChunk);
      if (usage) {
        await db
          .from('interview_sessions')
          .update({
            metadata: {
              ...(session.metadata as Record<string, unknown>),
              usage,
            } as Json,
          })
          .eq('id', sessionId);
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
          controller.enqueue(
            encoder.encode(
              `event: close\ndata: ${JSON.stringify({ sessionId })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Interview streaming error:', error);
    return jsonError('Internal server error', 500);
  }
}

