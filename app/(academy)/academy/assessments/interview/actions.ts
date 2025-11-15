'use server';
import OpenAI from 'openai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import {
  completeInterviewSession,
  createInterviewSession,
} from '@/modules/assessments/interviews';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export async function startInterview(templateId?: string) {
  const session = await createInterviewSession({
    templateId: templateId ?? null,
  });
  return {
    success: true,
    data: session,
  } as const;
}
const completeSchema = z.object({
  sessionId: z.string().uuid(),
});
export async function finalizeInterview(payload: unknown) {
  const parsed = completeSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid session payload',
    } as const;
  }
  const supabase = await createClient();
  const { data: messages, error } = await supabase
    .from('interview_messages')
    .select('role, content')
    .eq('session_id', parsed.data.sessionId)
    .order('created_at', { ascending: true })
    .returns<Array<Pick<Database['public']['Tables']['interview_messages']['Row'], 'role' | 'content'>>>();
  if (error) {
    return { success: false, error: error.message } as const;
  }
  const transcript = (messages ?? [])
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n');
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content:
          'You are an interview evaluator. Return JSON with keys readiness_score (0-100), summary, strengths, improvements, recommendations.',
      },
      {
        role: 'user',
        content: `Transcript of the mock interview:\n${transcript}\n\nEvaluate the candidate and respond in JSON format only.`,
      },
    ],
  });
  const rawContent = completion.choices[0]?.message?.content ?? '';
  let parsedFeedback: {
    readiness_score?: number;
    summary?: string;
    strengths?: string;
    improvements?: string;
    recommendations?: string;
  } = {};
  try {
    parsedFeedback = JSON.parse(rawContent);
  } catch (parseError) {
    }
  const readinessScore = parsedFeedback.readiness_score ?? 0;
  const { session, feedback } = await completeInterviewSession({
    sessionId: parsed.data.sessionId,
    status: 'completed',
    readinessScore,
    summary: parsedFeedback.summary,
    strengths: parsedFeedback.strengths,
    improvements: parsedFeedback.improvements,
    recommendations: parsedFeedback.recommendations,
    rubricScores: parsedFeedback,
  });
  return {
    success: true,
    data: {
      session,
      feedback,
    },
  } as const;
}
