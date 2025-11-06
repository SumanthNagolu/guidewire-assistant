import { createClient } from '@/lib/supabase/server';

export type ActivationMetrics = {
  totalUsers: number;
  usersWithFirstCompletion: number;
  activationRate: number;
  avgTimeToFirstCompletion: number | null; // in hours
  avgTopicsPerActiveUser: number;
  usersOptedInReminders: number;
  remindersDeliveredLast7Days: number;
};

export type TimeToFirstCompletionData = {
  userId: string;
  email: string;
  firstName: string | null;
  signupDate: string;
  firstCompletionDate: string | null;
  hoursToFirstCompletion: number | null;
};

export type TopicsPerUserData = {
  userId: string;
  email: string;
  firstName: string | null;
  topicsCompleted: number;
  lastCompletionDate: string | null;
};

export type AssessmentAnalytics = {
  publishedQuizzes: number;
  quizAttempts: number;
  quizPassRate: number;
  quizAverageScore: number;
  interviewSessionsCompleted: number;
  interviewAverageReadiness: number;
  interviewAtRiskCount: number;
};

/**
 * Get overall activation metrics for dashboard
 */
export async function getActivationMetrics(): Promise<{
  success: boolean;
  data?: ActivationMetrics;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      return { success: false, error: usersError.message };
    }

    // Get users with at least one completion
    type CompletedUser = { user_id: string; completed_at: string };

    const { data: completedUsers, error: completionsError } = await supabase
      .from('topic_completions')
      .select('user_id, completed_at')
      .not('completed_at', 'is', null)
      .returns<CompletedUser[]>();

    if (completionsError) {
      return { success: false, error: completionsError.message };
    }

    const uniqueCompletedUsers = new Set(
      completedUsers?.map((c) => c.user_id) ?? []
    );
    const usersWithFirstCompletion = uniqueCompletedUsers.size;

    // Get users opted in to reminders
    const { count: optedInCount, error: optInError } = await supabase
      .from('learner_reminder_settings')
      .select('*', { count: 'exact', head: true })
      .eq('opted_in', true);

    if (optInError) {
      return { success: false, error: optInError.message };
    }

    // Get reminders delivered in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: remindersCount, error: remindersError } = await supabase
      .from('learner_reminder_logs')
      .select('*', { count: 'exact', head: true })
      .gte('delivered_at', sevenDaysAgo.toISOString());

    if (remindersError) {
      return { success: false, error: remindersError.message };
    }

    // Calculate activation rate
    const activationRate =
      totalUsers && totalUsers > 0
        ? (usersWithFirstCompletion / totalUsers) * 100
        : 0;

    // Get time-to-first-completion data for avg calculation
    const { data: timeToFirstData, error: timeToFirstError } =
      await getTimeToFirstCompletionData();

    if (timeToFirstError) {
      return { success: false, error: timeToFirstError };
    }

    const validTimes = timeToFirstData?.filter(
      (item) => item.hoursToFirstCompletion !== null
    );

    const avgTimeToFirstCompletion =
      validTimes && validTimes.length > 0
        ? validTimes.reduce((sum, item) => sum + (item.hoursToFirstCompletion ?? 0), 0) /
          validTimes.length
        : null;

    // Get topics per user data for avg calculation
    const { data: topicsPerUserData, error: topicsPerUserError } =
      await getTopicsPerUserData();

    if (topicsPerUserError) {
      return { success: false, error: topicsPerUserError };
    }

    const activeUsers = topicsPerUserData?.filter((item) => item.topicsCompleted > 0) ?? [];
    const avgTopicsPerActiveUser =
      activeUsers.length > 0
        ? activeUsers.reduce((sum, item) => sum + item.topicsCompleted, 0) /
          activeUsers.length
        : 0;

    return {
      success: true,
      data: {
        totalUsers: totalUsers ?? 0,
        usersWithFirstCompletion,
        activationRate: Math.round(activationRate * 10) / 10,
        avgTimeToFirstCompletion: avgTimeToFirstCompletion
          ? Math.round(avgTimeToFirstCompletion * 10) / 10
          : null,
        avgTopicsPerActiveUser: Math.round(avgTopicsPerActiveUser * 10) / 10,
        usersOptedInReminders: optedInCount ?? 0,
        remindersDeliveredLast7Days: remindersCount ?? 0,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Get time-to-first-completion data for each user
 */
export async function getTimeToFirstCompletionData(): Promise<{
  success: boolean;
  data?: TimeToFirstCompletionData[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get all user profiles with signup dates
    type UserProfile = {
      id: string;
      email: string;
      first_name: string | null;
      created_at: string;
    };

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, created_at')
      .order('created_at', { ascending: true })
      .returns<UserProfile[]>();

    if (profilesError) {
      return { success: false, error: profilesError.message };
    }

    if (!profiles || profiles.length === 0) {
      return { success: true, data: [] };
    }

    // Get first completion for each user
    type UserCompletion = { user_id: string; completed_at: string };

    const { data: completions, error: completionsError } = await supabase
      .from('topic_completions')
      .select('user_id, completed_at')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: true })
      .returns<UserCompletion[]>();

    if (completionsError) {
      return { success: false, error: completionsError.message };
    }

    // Map first completion per user
    const firstCompletionMap = new Map<string, string>();
    completions?.forEach((completion) => {
      if (
        completion.completed_at &&
        !firstCompletionMap.has(completion.user_id)
      ) {
        firstCompletionMap.set(completion.user_id, completion.completed_at);
      }
    });

    // Build result data
    const data: TimeToFirstCompletionData[] = profiles.map((profile) => {
      const firstCompletionDate = firstCompletionMap.get(profile.id) ?? null;
      const hoursToFirstCompletion =
        firstCompletionDate && profile.created_at
          ? (new Date(firstCompletionDate).getTime() -
              new Date(profile.created_at).getTime()) /
            (1000 * 60 * 60)
          : null;

      return {
        userId: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        signupDate: profile.created_at,
        firstCompletionDate,
        hoursToFirstCompletion: hoursToFirstCompletion
          ? Math.round(hoursToFirstCompletion * 10) / 10
          : null,
      };
    });

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Get topics completed per user
 */
export async function getTopicsPerUserData(): Promise<{
  success: boolean;
  data?: TopicsPerUserData[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get all user profiles
    type Profile = { id: string; email: string; first_name: string | null };

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name')
      .order('email', { ascending: true })
      .returns<Profile[]>();

    if (profilesError) {
      return { success: false, error: profilesError.message };
    }

    if (!profiles || profiles.length === 0) {
      return { success: true, data: [] };
    }

    // Get all completions
    type TopicCompletion = { user_id: string; completed_at: string };

    const { data: completions, error: completionsError } = await supabase
      .from('topic_completions')
      .select('user_id, completed_at')
      .not('completed_at', 'is', null)
      .returns<TopicCompletion[]>();

    if (completionsError) {
      return { success: false, error: completionsError.message };
    }

    // Group by user
    const userCompletionMap = new Map<
      string,
      { count: number; lastDate: string | null }
    >();

    completions?.forEach((completion) => {
      const current = userCompletionMap.get(completion.user_id) ?? {
        count: 0,
        lastDate: null,
      };

      current.count += 1;

      if (
        completion.completed_at &&
        (!current.lastDate ||
          new Date(completion.completed_at) > new Date(current.lastDate))
      ) {
        current.lastDate = completion.completed_at;
      }

      userCompletionMap.set(completion.user_id, current);
    });

    // Build result data
    const data: TopicsPerUserData[] = profiles.map((profile) => {
      const userData = userCompletionMap.get(profile.id);

      return {
        userId: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        topicsCompleted: userData?.count ?? 0,
        lastCompletionDate: userData?.lastDate ?? null,
      };
    });

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function getAssessmentAnalytics(): Promise<{
  success: boolean;
  data?: AssessmentAnalytics;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { count: quizCount, error: quizCountError } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (quizCountError) {
      return { success: false, error: quizCountError.message };
    }

    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('score, max_score, percentage, passed')
      .returns<Array<{ score: number; max_score: number; percentage: number | null; passed: boolean }>>();

    if (attemptsError) {
      return { success: false, error: attemptsError.message };
    }

    const totalAttempts = attempts?.length ?? 0;
    const passedAttempts = attempts?.filter((attempt) => attempt.passed).length ?? 0;
    const averageScore =
      attempts && attempts.length > 0
        ?
            attempts.reduce((sum, attempt) => {
              const normalized =
                typeof attempt.percentage === 'number'
                  ? attempt.percentage
                  : Number(attempt.percentage ?? (attempt.score / Math.max(attempt.max_score, 1)) * 100);
              return sum + normalized;
            }, 0) / attempts.length
        : 0;

    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

    const { data: sessions, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('readiness_score, status')
      .eq('status', 'completed')
      .returns<Array<{ readiness_score: number | null; status: string }>>();

    if (sessionError) {
      return { success: false, error: sessionError.message };
    }

    const completedSessions = sessions?.length ?? 0;
    const readinessScores = sessions
      ?.map((session) => session.readiness_score)
      .filter((score): score is number => typeof score === 'number') ?? [];

    const averageReadiness =
      readinessScores.length > 0
        ? readinessScores.reduce((sum, score) => sum + score, 0) / readinessScores.length
        : 0;

    const atRiskCount = readinessScores.filter((score) => score < 60).length;

    return {
      success: true,
      data: {
        publishedQuizzes: quizCount ?? 0,
        quizAttempts: totalAttempts,
        quizPassRate: Math.round(passRate * 10) / 10,
        quizAverageScore: Math.round(averageScore * 10) / 10,
        interviewSessionsCompleted: completedSessions,
        interviewAverageReadiness: Math.round(averageReadiness * 10) / 10,
        interviewAtRiskCount: atRiskCount,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

