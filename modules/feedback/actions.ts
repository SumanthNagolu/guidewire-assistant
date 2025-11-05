'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const feedbackSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  confidence_level: z.enum(['low', 'medium', 'high']),
  biggest_win: z.string().min(3, 'Share at least one highlight from the week.'),
  biggest_blocker: z.string().optional(),
  help_requested: z.string().optional(),
});

export type SubmitFeedbackResponse = {
  success: boolean;
  message?: string;
};

export async function submitWeeklyFeedbackAction(formData: FormData): Promise<SubmitFeedbackResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized. Please sign in again.' };
  }

  const candidate = {
    sentiment: String(formData.get('sentiment') ?? '').toLowerCase(),
    confidence_level: String(formData.get('confidence_level') ?? '').toLowerCase(),
    biggest_win: String(formData.get('biggest_win') ?? '').trim(),
    biggest_blocker: String(formData.get('biggest_blocker') ?? '').trim() || null,
    help_requested: String(formData.get('help_requested') ?? '').trim() || null,
  };

  const parsed = feedbackSchema.safeParse(candidate);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues.map((issue) => issue.message).join(' '),
    };
  }

  const payload = {
    user_id: user.id,
    ...parsed.data,
  };

  const { error } = await (supabase.from('beta_feedback_entries') as any).insert(payload);

  if (error) {
    return {
      success: false,
      message: error.message || 'Unable to submit feedback right now.',
    };
  }

  return {
    success: true,
    message: 'Thanks for the check-in! We review every update during sprint planning.',
  };
}

export type FeedbackEntry = {
  id: string;
  sentiment: string | null;
  confidence_level: string | null;
  biggest_win: string | null;
  biggest_blocker: string | null;
  help_requested: string | null;
  submitted_at: string;
  user?: {
    first_name: string | null;
    email: string | null;
  } | null;
};

export async function getLatestFeedbackForUser(userId: string): Promise<FeedbackEntry | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('beta_feedback_entries')
    .select('id, sentiment, confidence_level, biggest_win, biggest_blocker, help_requested, submitted_at')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to load latest feedback entry', error);
    return null;
  }

  return data ?? null;
}

export async function getRecentFeedbackEntries(limit = 5): Promise<FeedbackEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('beta_feedback_entries')
    .select(
      'id, sentiment, confidence_level, biggest_win, biggest_blocker, help_requested, submitted_at, user_profiles!inner(first_name, email)'
    )
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error('Failed to load recent feedback entries', error);
    return [];
  }

  type RawFeedbackRow = {
    id: string;
    sentiment: string | null;
    confidence_level: string | null;
    biggest_win: string | null;
    biggest_blocker: string | null;
    help_requested: string | null;
    submitted_at: string;
    user_profiles: {
      first_name: string | null;
      email: string | null;
    } | null;
  };

  return (data as RawFeedbackRow[]).map((entry) => ({
    id: entry.id,
    sentiment: entry.sentiment,
    confidence_level: entry.confidence_level,
    biggest_win: entry.biggest_win,
    biggest_blocker: entry.biggest_blocker,
    help_requested: entry.help_requested,
    submitted_at: entry.submitted_at,
    user: entry.user_profiles
      ? {
          first_name: entry.user_profiles.first_name,
          email: entry.user_profiles.email,
        }
      : null,
  }));
}


