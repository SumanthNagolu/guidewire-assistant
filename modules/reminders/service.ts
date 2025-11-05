import { createAdminClient } from '@/lib/supabase/server';
import { sendReminderEmail } from './email';

const REMINDER_THRESHOLD_HOURS = Number.parseInt(
  process.env.REMINDER_THRESHOLD_HOURS ?? '48',
  10
);
const REMINDER_MIN_HOURS_BETWEEN = Number.parseInt(
  process.env.REMINDER_MIN_HOURS ?? '24',
  10
);

type ReminderCandidate = {
  user_id: string;
  email: string | null;
  first_name: string | null;
  created_at: string;
  last_opt_in_at: string | null;
};

export type ReminderSummary = {
  candidates: number;
  attempts: number;
  triggered: number;
  skipped: number;
  errors: string[];
};

export async function sendStalledLearnerReminders(): Promise<ReminderSummary> {
  const admin = createAdminClient();
  const errors: string[] = [];
  const now = new Date();
  const thresholdDate = new Date(now.getTime() - REMINDER_THRESHOLD_HOURS * 60 * 60 * 1000);
  const cooldownDate = new Date(
    now.getTime() - REMINDER_MIN_HOURS_BETWEEN * 60 * 60 * 1000
  );

  const providerConfigured = Boolean(
    process.env.RESEND_API_KEY && process.env.REMINDER_EMAIL_FROM
  );

  if (!providerConfigured) {
    errors.push('Reminder email provider is not configured. Set RESEND_API_KEY and REMINDER_EMAIL_FROM.');
    return { candidates: 0, attempts: 0, triggered: 0, skipped: 0, errors };
  }

  type ReminderSetting = {
    user_id: string;
    last_opt_in_at: string | null;
    opted_in: boolean;
  };

  const { data: settings, error: settingsError } = await admin
    .from('learner_reminder_settings')
    .select('user_id, last_opt_in_at, opted_in')
    .eq('opted_in', true)
    .returns<ReminderSetting[]>();

  if (settingsError) {
    errors.push(settingsError.message);
    return { candidates: 0, attempts: 0, triggered: 0, skipped: 0, errors };
  }

  if (!settings?.length) {
    return { candidates: 0, attempts: 0, triggered: 0, skipped: 0, errors };
  }

  const userIds = settings.map((row) => row.user_id);

  const { data: profiles, error: profilesError } = await admin
    .from('user_profiles')
    .select('id, email, first_name, created_at')
    .in('id', userIds);

  if (profilesError) {
    errors.push(profilesError.message);
    return { candidates: userIds.length, attempts: 0, triggered: 0, skipped: 0, errors };
  }

  const candidates: ReminderCandidate[] = settings
    .map((row) => {
      const profile = profiles?.find((item) => item.id === row.user_id);
      if (!profile) {
        return null;
      }

      return {
        user_id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        created_at: profile.created_at,
        last_opt_in_at: row.last_opt_in_at,
      } satisfies ReminderCandidate;
    })
    .filter(Boolean) as ReminderCandidate[];

  if (!candidates.length) {
    return { candidates: 0, attempts: 0, triggered: 0, skipped: 0, errors };
  }

  const { data: completions } = await admin
    .from('topic_completions')
    .select('user_id, completed_at')
    .in('user_id', userIds)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false });

  const latestCompletionMap = new Map<string, Date>();
  completions?.forEach((entry) => {
    if (!entry.completed_at) return;
    if (!latestCompletionMap.has(entry.user_id)) {
      latestCompletionMap.set(entry.user_id, new Date(entry.completed_at));
    }
  });

  const { data: recentLogs } = await admin
    .from('learner_reminder_logs')
    .select('user_id, delivered_at')
    .gte('delivered_at', cooldownDate.toISOString());

  const recentLogMap = new Map<string, Date>();
  recentLogs?.forEach((row) => {
    if (!row.delivered_at) return;
    const delivered = new Date(row.delivered_at);
    const current = recentLogMap.get(row.user_id);
    if (!current || delivered > current) {
      recentLogMap.set(row.user_id, delivered);
    }
  });

  let attempts = 0;
  let triggered = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    const lastProgress =
      latestCompletionMap.get(candidate.user_id) ?? new Date(candidate.created_at);
    const hoursSinceProgress = Math.floor(
      (now.getTime() - lastProgress.getTime()) / (1000 * 60 * 60)
    );

    if (!candidate.email) {
      skipped += 1;
      continue;
    }

    if (lastProgress > thresholdDate) {
      skipped += 1;
      continue;
    }

    const lastReminder = recentLogMap.get(candidate.user_id);
    if (lastReminder && lastReminder > cooldownDate) {
      skipped += 1;
      continue;
    }

    attempts += 1;

    const logBase = {
      user_id: candidate.user_id,
      reminder_type: 'stalled_learner' as const,
    };

    try {
      const result = await sendReminderEmail({
        to: candidate.email,
        firstName: candidate.first_name,
        hoursStalled: hoursSinceProgress,
        thresholdHours: REMINDER_THRESHOLD_HOURS,
      });

      const { error: logError } = await admin.from('learner_reminder_logs').insert({
        ...logBase,
        delivered_at: new Date().toISOString(),
        notes: JSON.stringify({
          status: 'sent',
          email: candidate.email,
          provider_id: result.id ?? null,
          last_progress_at: lastProgress.toISOString(),
          threshold_hours: REMINDER_THRESHOLD_HOURS,
          attempted_at: now.toISOString(),
        }),
      });

      if (logError) {
        errors.push(
          `Reminder sent but logging failed for ${candidate.user_id}: ${logError.message}`
        );
      }

      triggered += 1;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected error sending reminder email.';

      errors.push(`Failed to send reminder to ${candidate.user_id}: ${message}`);

      const { error: logError } = await admin.from('learner_reminder_logs').insert({
        ...logBase,
        delivered_at: null,
        notes: JSON.stringify({
          status: 'error',
          email: candidate.email,
          error: message,
          last_progress_at: lastProgress.toISOString(),
          threshold_hours: REMINDER_THRESHOLD_HOURS,
          attempted_at: now.toISOString(),
        }),
      });

      if (logError) {
        errors.push(
          `Failed to record reminder error for ${candidate.user_id}: ${logError.message}`
        );
      }
    }
  }

  return {
    candidates: candidates.length,
    attempts,
    triggered,
    skipped,
    errors,
  };
}

