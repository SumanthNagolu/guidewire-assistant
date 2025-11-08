import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ActivationMetricsCards } from '@/components/features/analytics/ActivationMetricsCards';
import {
  getActivationMetrics,
  getAssessmentAnalytics,
  getTimeToFirstCompletionData,
  getTopicsPerUserData,
} from '@/modules/analytics/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch metrics
  const metricsResult = await getActivationMetrics();
  const timeToFirstResult = await getTimeToFirstCompletionData();
  const topicsPerUserResult = await getTopicsPerUserData();
  const assessmentResult = await getAssessmentAnalytics();

  if (!metricsResult.success) {
    return (
      <div className="flex-1 w-full flex flex-col gap-8 p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-red-500">
            Error loading metrics: {metricsResult.error}
          </p>
        </div>
      </div>
    );
  }

  const metrics = metricsResult.data!;
  const timeToFirstData = timeToFirstResult.data ?? [];
  const topicsPerUserData = topicsPerUserResult.data ?? [];
  const assessmentMetrics = assessmentResult.data ?? {
    publishedQuizzes: 0,
    quizAttempts: 0,
    quizPassRate: 0,
    quizAverageScore: 0,
    interviewSessionsCompleted: 0,
    interviewAverageReadiness: 0,
    interviewAtRiskCount: 0,
  };

  // Calculate stats for time-to-first
  const activatedUsers = timeToFirstData.filter(
    (item) => item.hoursToFirstCompletion !== null
  );
  const within24h = activatedUsers.filter((item) => item.hoursToFirstCompletion! <= 24);
  const within48h = activatedUsers.filter((item) => item.hoursToFirstCompletion! <= 48);

  // Calculate stats for topics-per-user
  const activeUsers = topicsPerUserData.filter((item) => item.topicsCompleted > 0);
  const users10Plus = activeUsers.filter((item) => item.topicsCompleted >= 10);

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Track learner activation, engagement, and reminder effectiveness
        </p>
      </div>

      {/* Key Metrics Cards */}
      <ActivationMetricsCards metrics={metrics} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span>Published Quizzes</span>
              <span className="font-semibold">{assessmentMetrics.publishedQuizzes}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span>Total Attempts</span>
              <span className="font-semibold">{assessmentMetrics.quizAttempts}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span>Pass Rate</span>
              <span className="font-semibold">{assessmentMetrics.quizPassRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Average Score</span>
              <span className="font-semibold">{assessmentMetrics.quizAverageScore}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span>Completed Sessions</span>
              <span className="font-semibold">{assessmentMetrics.interviewSessionsCompleted}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span>Average Readiness</span>
              <span className="font-semibold">{assessmentMetrics.interviewAverageReadiness}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span>At-Risk Learners (&lt;60 readiness)</span>
              <span className="font-semibold text-amber-600">
                {assessmentMetrics.interviewAtRiskCount}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Time to First Completion Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Time to First Completion Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Total Users</span>
                <span className="text-lg font-bold">{timeToFirstData.length}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Activated (completed Topic 1)</span>
                <span className="text-lg font-bold">
                  {activatedUsers.length}{' '}
                  <span className="text-sm text-muted-foreground">
                    ({timeToFirstData.length > 0 ? Math.round((activatedUsers.length / timeToFirstData.length) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">
                  Within 24 hours
                </span>
                <span className="text-lg font-bold">
                  {within24h.length}{' '}
                  <span className="text-sm text-muted-foreground">
                    ({activatedUsers.length > 0 ? Math.round((within24h.length / activatedUsers.length) * 100) : 0}% of
                    activated)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">
                  Within 48 hours
                </span>
                <span className="text-lg font-bold">
                  {within48h.length}{' '}
                  <span className="text-sm text-muted-foreground">
                    ({activatedUsers.length > 0 ? Math.round((within48h.length / activatedUsers.length) * 100) : 0}% of
                    activated)
                  </span>
                </span>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Sprint 3 Goal:</strong> ≥70% complete Topic 1 within 24h
                </p>
                <div className="mt-2">
                  {timeToFirstData.length > 0 && (
                    <div
                      className={`text-sm font-semibold ${
                        (within24h.length / timeToFirstData.length) * 100 >= 70
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {((within24h.length / timeToFirstData.length) * 100).toFixed(1)}%{' '}
                      current rate
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topics per User Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Topics per Learner Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Total Users</span>
                <span className="text-lg font-bold">{topicsPerUserData.length}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Active (1+ topics)</span>
                <span className="text-lg font-bold">
                  {activeUsers.length}{' '}
                  <span className="text-sm text-muted-foreground">
                    ({topicsPerUserData.length > 0 ? Math.round((activeUsers.length / topicsPerUserData.length) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">
                  10+ topics completed
                </span>
                <span className="text-lg font-bold">
                  {users10Plus.length}{' '}
                  <span className="text-sm text-muted-foreground">
                    ({activeUsers.length > 0 ? Math.round((users10Plus.length / activeUsers.length) * 100) : 0}% of
                    active)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">
                  Avg topics per active user
                </span>
                <span className="text-lg font-bold">
                  {metrics.avgTopicsPerActiveUser.toFixed(1)}
                </span>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Sprint 3 Goal:</strong> ≥10 topics per active learner
                </p>
                <div className="mt-2">
                  <div
                    className={`text-sm font-semibold ${
                      metrics.avgTopicsPerActiveUser >= 10
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {metrics.avgTopicsPerActiveUser >= 10
                      ? '✓ Goal achieved!'
                      : `${(10 - metrics.avgTopicsPerActiveUser).toFixed(1)} topics to goal`}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminder System Status */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Reminder System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Opt-in Rate
                </p>
                <p className="text-2xl font-bold">
                  {metrics.totalUsers > 0
                    ? `${Math.round((metrics.usersOptedInReminders / metrics.totalUsers) * 100)}%`
                    : '0%'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.usersOptedInReminders} of {metrics.totalUsers} users
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Reminders Sent (Last 7 Days)
                </p>
                <p className="text-2xl font-bold">
                  {metrics.remindersDeliveredLast7Days}
                </p>
                <p className="text-xs text-muted-foreground">
                  Stalled learner nudges delivered
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Policy Compliance
                </p>
                <p className="text-2xl font-bold text-green-600">✓</p>
                <p className="text-xs text-muted-foreground">
                  &lt;3 emails per learner/week enforced
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity (Last 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">User</th>
                  <th className="text-left py-2 px-4">Signup Date</th>
                  <th className="text-left py-2 px-4">Topics Completed</th>
                  <th className="text-left py-2 px-4">Last Activity</th>
                  <th className="text-left py-2 px-4">Time to First</th>
                </tr>
              </thead>
              <tbody>
                {timeToFirstData.slice(0, 10).map((user) => {
                  const userTopics = topicsPerUserData.find(
                    (item) => item.userId === user.userId
                  );

                  return (
                    <tr key={user.userId} className="border-b">
                      <td className="py-2 px-4">
                        {user.firstName ?? user.email.split('@')[0]}
                      </td>
                      <td className="py-2 px-4">
                        {new Date(user.signupDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4">
                        {userTopics?.topicsCompleted ?? 0}
                      </td>
                      <td className="py-2 px-4">
                        {userTopics?.lastCompletionDate
                          ? new Date(
                              userTopics.lastCompletionDate
                            ).toLocaleDateString()
                          : 'No activity'}
                      </td>
                      <td className="py-2 px-4">
                        {user.hoursToFirstCompletion !== null
                          ? `${user.hoursToFirstCompletion}h`
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

