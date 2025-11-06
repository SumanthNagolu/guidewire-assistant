import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { Database, Json } from '@/types/database';
import type {
  InterviewFeedbackRecord,
  InterviewSessionRecord,
  InterviewSessionStatus,
  InterviewTemplate,
} from './types';

const createSessionSchema = z.object({
  templateId: z.string().uuid().nullable(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const appendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  role: z.enum(['system', 'interviewer', 'candidate']),
  content: z.string().min(1),
  metadata: z.record(z.string(), z.any()).optional(),
});

const completeSessionSchema = z.object({
  sessionId: z.string().uuid(),
  status: z.enum(['completed', 'cancelled']),
  readinessScore: z.number().min(0).max(100).optional(),
  durationSeconds: z.number().int().min(0).optional(),
  summary: z.string().optional(),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  recommendations: z.string().optional(),
  rubricScores: z.record(z.string(), z.any()).optional(),
});

export async function getActiveInterviewTemplates(productId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('interview_templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load interview templates: ${error.message}`);
  }

  return (data ?? []) as InterviewTemplate[];
}

export async function createInterviewSession(params: {
  templateId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<InterviewSessionRecord> {
  const validation = createSessionSchema.safeParse({
    templateId: params.templateId ?? null,
    metadata: params.metadata,
  });

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message ?? 'Invalid session payload');
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('You must be signed in to start an interview');
  }

  const insertData: Database['public']['Tables']['interview_sessions']['Insert'] = {
    user_id: user.id,
    template_id: params.templateId ?? null,
    metadata: (params.metadata ?? {}) as Json,
  };

  const { data, error } = await supabase
    .from('interview_sessions')
    .insert(insertData)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create interview session');
  }

  return data as InterviewSessionRecord;
}

export async function appendInterviewMessage(params: {
  sessionId: string;
  role: 'system' | 'interviewer' | 'candidate';
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const validation = appendMessageSchema.safeParse(params);
  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message ?? 'Invalid message payload');
  }

  const supabase = await createClient();

  const { error } = await supabase.from('interview_messages').insert({
    session_id: params.sessionId,
    role: params.role,
    content: params.content,
    metadata: (params.metadata ?? {}) as Json,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function completeInterviewSession(params: {
  sessionId: string;
  status: InterviewSessionStatus;
  readinessScore?: number;
  durationSeconds?: number;
  summary?: string;
  strengths?: string;
  improvements?: string;
  recommendations?: string;
  rubricScores?: Record<string, unknown>;
}): Promise<{
  session: InterviewSessionRecord;
  feedback: InterviewFeedbackRecord | null;
}> {
  const validation = completeSessionSchema.safeParse({
    sessionId: params.sessionId,
    status: params.status,
    readinessScore: params.readinessScore,
    durationSeconds: params.durationSeconds,
    summary: params.summary,
    strengths: params.strengths,
    improvements: params.improvements,
    recommendations: params.recommendations,
    rubricScores: params.rubricScores,
  });

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message ?? 'Invalid completion payload');
  }

  const supabase = await createClient();

  const updates: Partial<Database['public']['Tables']['interview_sessions']['Update']> = {
    status: params.status,
    readiness_score: params.readinessScore ?? null,
    duration_seconds: params.durationSeconds ?? null,
  };

  if (params.status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { data: session, error: sessionError } = await supabase
    .from('interview_sessions')
    .update(updates)
    .eq('id', params.sessionId)
    .select('*')
    .single();

  if (sessionError || !session) {
    throw new Error(sessionError?.message ?? 'Failed to complete session');
  }

  let feedback: InterviewFeedbackRecord | null = null;

  if (params.status === 'completed') {
    const { data: feedbackRow, error: feedbackError } = await supabase
      .from('interview_feedback')
      .upsert(
        {
          session_id: params.sessionId,
          summary: params.summary ?? null,
          strengths: params.strengths ?? null,
          improvements: params.improvements ?? null,
          recommendations: params.recommendations ?? null,
          rubric_scores: (params.rubricScores ?? {}) as Json,
        },
        {
          onConflict: 'session_id',
        }
      )
      .select('*')
      .single();

    if (feedbackError) {
      throw new Error(feedbackError.message);
    }

    feedback = feedbackRow as unknown as InterviewFeedbackRecord;
  }

  return {
    session: session as InterviewSessionRecord,
    feedback,
  };
}

