import { createClient } from '@/lib/supabase/server';

type ProfileSnapshot = {
  id: string;
  created_at: string;
};

type CompletionSnapshot = {
  user_id: string;
  completed_at: string | null;
};

type ReminderSnapshot = {
  user_id: string;
};

export type ActivationMetrics = {
  totalLearners: number;
  activeLearners: number;
  averageTopicsPerActiveLearner: number;
  medianTimeToFirstCompletionHours: number | null;
  reminderOptInRate: number;
  stalledLearners: number;
};

export type CompletionTrendPoint = {
  date: string;
  completions: number;
};

const DEFAULT_METRICS: ActivationMetrics = {
  totalLearners: 0,
  activeLearners: 0,
  averageTopicsPerActiveLearner: 0,
  medianTimeToFirstCompletionHours: null,
  reminderOptInRate: 0,
  stalledLearners: 0,
};

const hoursBetween = (start: Date, end: Date) =>
  Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)));

const median = (values: number[]): number | null => {
  if (!values.length) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(1));
  }

  return sorted[middle];
};

const toFixedNumber = (value: number, digits: number) =>
  Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

const buildCompletionMap = (rows: CompletionSnapshot[]) => {
  const map = new Map<string, Date[]>();

  rows.forEach((row) => {
    if (!row.completed_at) {
      return;
    }

    const list = map.get(row.user_id) ?? [];
    list.push(new Date(row.completed_at));
    map.set(row.user_id, list);
  });

  map.forEach((list, key) => {
    list.sort((a, b) => a.getTime() - b.getTime());
    map.set(key, list);
  });

  return map;
};

const computeStalledLearners = (
  profiles: ProfileSnapshot[],
  completions: Map<string, Date[]>,
  optedInUserIds: Set<string>,
  thresholdHours: number
) => {
  const now = Date.now();

  return profiles.reduce((count, profile) => {
    if (!optedInUserIds.has(profile.id)) {
      return count;
    }

    const progress = completions.get(profile.id);
    const lastProgress = progress?.[progress.length - 1]
      ?? new Date(profile.created_at);

    const hoursSinceLast = Math.floor((now - lastProgress.getTime()) / (1000 * 60 * 60));

    return hoursSinceLast >= thresholdHours ? count + 1 : count;
  }, 0);
};

export async function getActivationMetrics(): Promise<ActivationMetrics> {
  const supabase = await createClient();

  type UserProfile = { id: string; created_at: string };
  type Completion = { user_id: string; completed_at: string };
  type ReminderSetting = { user_id: string };

  const [{ data: profiles, error: profilesError }, { data: completionRows, error: completionsError }, { data: reminders, error: remindersError }] =
    await Promise.all([
      supabase
        .from('user_profiles')
        .select('id, created_at')
        .eq('role', 'user')
        .returns<UserProfile[]>(),
      supabase
        .from('topic_completions')
        .select('user_id, completed_at')
        .not('completed_at', 'is', null)
        .returns<Completion[]>(),
      supabase
        .from('learner_reminder_settings')
        .select('user_id')
        .eq('opted_in', true)
        .returns<ReminderSetting[]>(),
    ]);

  if (profilesError || completionsError || remindersError || !profiles) {
        return DEFAULT_METRICS;
  }

  const completionMap = buildCompletionMap(completionRows ?? []);
  const totalLearners = profiles.length;
  const activeLearners = completionMap.size;

  let totalTopicsCompleted = 0;
  const firstCompletionDurations: number[] = [];

  profiles.forEach((profile) => {
    const completions = completionMap.get(profile.id);
    if (!completions?.length) {
      return;
    }

    totalTopicsCompleted += completions.length;

    const firstCompletion = completions[0];
    const createdAt = new Date(profile.created_at);
    firstCompletionDurations.push(hoursBetween(createdAt, firstCompletion));
  });

  const averageTopicsPerActiveLearner = activeLearners
    ? toFixedNumber(totalTopicsCompleted / activeLearners, 2)
    : 0;

  const medianTimeToFirstCompletionHours = median(firstCompletionDurations);

  const reminderCount = reminders?.length ?? 0;
  const reminderOptInRate = totalLearners
    ? toFixedNumber(reminderCount / totalLearners, 2)
    : 0;

  const optedInUserIds = new Set(reminders?.map((row) => row.user_id) ?? []);
  const reminderThresholdHours = Number.parseInt(
    process.env.REMINDER_THRESHOLD_HOURS ?? '48',
    10
  );

  const stalledLearners = computeStalledLearners(
    profiles,
    completionMap,
    optedInUserIds,
    reminderThresholdHours
  );

  return {
    totalLearners,
    activeLearners,
    averageTopicsPerActiveLearner,
    medianTimeToFirstCompletionHours,
    reminderOptInRate,
    stalledLearners,
  };
}

export async function getCompletionTrend(
  days: number = 7
): Promise<CompletionTrendPoint[]> {
  const supabase = await createClient();
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  type CompletionData = { completed_at: string };

  const { data, error } = await supabase
    .from('topic_completions')
    .select('completed_at')
    .not('completed_at', 'is', null)
    .gte('completed_at', startDate.toISOString())
    .order('completed_at', { ascending: true })
    .returns<CompletionData[]>();

  if (error || !data) {
        return [];
  }

  const bucket = new Map<string, number>();
  for (let i = 0; i <= days; i += 1) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    bucket.set(date, 0);
  }

  data.forEach((row) => {
    if (!row.completed_at) {
      return;
    }

    const date = row.completed_at.slice(0, 10);
    bucket.set(date, (bucket.get(date) ?? 0) + 1);
  });

  return Array.from(bucket.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([date, completions]) => ({ date, completions }));
}



