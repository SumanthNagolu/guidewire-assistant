import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, MessageSquare, Settings, Upload } from 'lucide-react';
import { getActivationMetrics, getCompletionTrend } from '@/modules/analytics/activation';
import { getRecentFeedbackEntries } from '@/modules/feedback/actions';

export default async function AdminPage() {
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

  // Get stats
  const [
    { count: totalUsers },
    { count: totalTopics },
    { count: totalConversations },
    activationMetrics,
    completionTrend,
    recentFeedback,
  ] = await Promise.all([
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('topics').select('*', { count: 'exact', head: true }),
    supabase.from('ai_conversations').select('*', { count: 'exact', head: true }),
    getActivationMetrics(),
    getCompletionTrend(7),
    getRecentFeedbackEntries(5),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your Guidewire training platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activation Snapshot</CardTitle>
          <CardDescription>Momentum signals across the cohort</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Active Learners</p>
            <p className="text-2xl font-semibold">
              {activationMetrics.activeLearners} / {activationMetrics.totalLearners}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Median Time to First Completion</p>
            <p className="text-2xl font-semibold">
              {activationMetrics.medianTimeToFirstCompletionHours !== null
                ? `${activationMetrics.medianTimeToFirstCompletionHours}h`
                : 'Pending'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Avg Topics / Active Learner</p>
            <p className="text-2xl font-semibold">
              {activationMetrics.averageTopicsPerActiveLearner}
            </p>
          </div>
        </CardContent>
        <CardContent className="grid gap-4 md:grid-cols-3 pt-0">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Reminder Opt-In Rate</p>
            <p className="text-2xl font-semibold">
              {Math.round(activationMetrics.reminderOptInRate * 100)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Stalled (Opted-In)</p>
            <p className="text-2xl font-semibold">{activationMetrics.stalledLearners}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Topics this week</p>
            <p className="text-2xl font-semibold">
              {completionTrend.reduce((total, point) => total + point.completions, 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Trend (Last 7 Days)</CardTitle>
          <CardDescription>Completed topics per day</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {completionTrend.map((point) => (
            <div key={point.date} className="rounded-md border px-3 py-2">
              <p className="text-xs text-muted-foreground">{point.date}</p>
              <p className="text-lg font-semibold">{point.completions}</p>
            </div>
          ))}
          {!completionTrend.length && (
            <p className="text-sm text-muted-foreground">
              No completions recorded in the selected window.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Beta Feedback</CardTitle>
          <CardDescription>Top-line learner signals to copy into the weekly changelog.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentFeedback.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No feedback submissions yet. Encourage learners to share wins and blockers from the
              dashboard.
            </p>
          )}
          {recentFeedback.map((entry) => (
            <div key={entry.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium text-gray-900">
                  {entry.user?.first_name || 'Learner'}
                </span>
                <span>{new Date(entry.submitted_at).toLocaleString()}</span>
                {entry.sentiment && <span className="uppercase">{entry.sentiment}</span>}
                {entry.confidence_level && (
                  <span className="uppercase">Confidence: {entry.confidence_level}</span>
                )}
              </div>
              {entry.biggest_win && (
                <p className="text-sm text-gray-800">
                  <strong>Win:</strong> {entry.biggest_win}
                </p>
              )}
              {entry.biggest_blocker && (
                <p className="text-sm text-gray-700">
                  <strong>Blocker:</strong> {entry.biggest_blocker}
                </p>
              )}
              {entry.help_requested && (
                <p className="text-sm text-gray-700">
                  <strong>Help:</strong> {entry.help_requested}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTopics || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Management</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Topic Management
              </CardTitle>
              <CardDescription>
                Add, edit, or remove topics. Upload topics via CSV.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/topics">
                <Button>Manage Topics</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Content Uploads
              </CardTitle>
              <CardDescription>
                Upload slides, demo videos, and assignments for each topic.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/content-upload">
                <Button variant="secondary">Upload Content</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                View users, manage roles, and monitor progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Analytics
              </CardTitle>
              <CardDescription>
                Monitor AI usage, costs, and conversation quality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>
                Configure platform settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

