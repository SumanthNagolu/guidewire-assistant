import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/database';
import { ArrowRight } from 'lucide-react';
import ReminderOptInToggle from '@/components/features/dashboard/ReminderOptInToggle';
import FeedbackForm from '@/components/features/dashboard/FeedbackForm';
import { personaPlaybooks, type PersonaKey } from '@/modules/onboarding/persona-guidance';
import { getLatestFeedbackForUser } from '@/modules/feedback/actions';
import { getActiveQuizzes, getRecentQuizAttempts } from '@/modules/assessments/quizzes';
import { getActiveInterviewTemplates } from '@/modules/assessments/interviews';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user profile
  type ProfileWithProduct = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    assumed_persona: string | null;
    preferred_product_id: string | null;
    created_at: string;
    products: { name: string; code: string } | null;
  };

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, products(name, code)')
    .eq('id', user.id)
    .single<ProfileWithProduct>();

  // Get products
  type Product = {
    id: string;
    name: string;
    code: string;
    description: string | null;
  };

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('code')
    .returns<Product[]>();

  // Get user's completions count
  const { count: completedCount } = await supabase
    .from('topic_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('completed_at', 'is', null);

  // Get total published topics
  const { count: totalTopics } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);

  const overallProgress = totalTopics
    ? Math.round((completedCount || 0) / totalTopics * 100)
    : 0;

  const preferredProductId = profile?.preferred_product_id ?? products?.[0]?.id ?? null;

  type RecommendedTopic = Database['public']['Tables']['topics']['Row'] & {
    products: { name: string; code: string } | null;
  };

  let recommendedTopic: RecommendedTopic | null = null;

  if (preferredProductId) {
    const { data: nextTopicId } = await (supabase.rpc as any)('get_next_topic', {
      p_user_id: user.id,
      p_product_id: preferredProductId,
    });

    const targetTopicId = nextTopicId ?? null;

    if (targetTopicId) {
      const { data } = await supabase
        .from('topics')
        .select('id, title, position, duration_minutes, content, products(name, code)')
        .eq('id', targetTopicId)
        .single();
      recommendedTopic = data as RecommendedTopic | null;
    } else {
      const { data } = await supabase
        .from('topics')
        .select('id, title, position, duration_minutes, content, products(name, code)')
        .eq('product_id', preferredProductId)
        .eq('published', true)
        .order('position', { ascending: true })
        .limit(1)
        .maybeSingle();
      recommendedTopic = data as RecommendedTopic | null;
    }
  }

  type FirstCompletion = {
    completed_at: string;
  };

  const { data: firstCompletion } = await supabase
    .from('topic_completions')
    .select('completed_at')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: true })
    .limit(1)
    .maybeSingle<FirstCompletion>();

  type ReminderSettings = {
    opted_in: boolean;
    updated_at: string | null;
    last_opt_in_at: string | null;
  };

  const { data: reminderSettings } = await supabase
    .from('learner_reminder_settings')
    .select('opted_in, updated_at, last_opt_in_at')
    .eq('user_id', user.id)
    .maybeSingle<ReminderSettings>();

  const [latestFeedback, availableQuizzes, recentQuizAttempts, interviewTemplates] =
    await Promise.all([
      getLatestFeedbackForUser(user.id),
      getActiveQuizzes({ productId: preferredProductId ?? undefined }),
      getRecentQuizAttempts(3),
      getActiveInterviewTemplates(preferredProductId ?? undefined),
    ]);

  const personaHighlight = profile?.assumed_persona
    ? personaPlaybooks[profile.assumed_persona as PersonaKey]
    : undefined;

  const showOnboardingCard = (completedCount || 0) === 0 && recommendedTopic;
  const reminderOptedIn = Boolean(reminderSettings?.opted_in);

  const profileCreatedAt = profile?.created_at ? new Date(profile.created_at) : null;
  const now = new Date();
  const daysSinceSignup = profileCreatedAt
    ? Math.max(1, Math.ceil((now.getTime() - profileCreatedAt.getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const topicsPerDay = ((completedCount || 0) / daysSinceSignup).toFixed(2);

  const timeToFirstCompletionHours =
    profileCreatedAt && firstCompletion?.completed_at
      ? Math.max(
          0,
          Math.round(
            (new Date(firstCompletion.completed_at).getTime() - profileCreatedAt.getTime()) /
              (1000 * 60 * 60)
          )
        )
      : null;

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours}h`;
    }
    const days = Math.round(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {firstCompletion?.completed_at
            ? 'Keep building momentum—your next milestone is just one topic away.'
            : 'You are one focused session away from your first ClaimCenter win.'}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {showOnboardingCard && recommendedTopic && (
          <Card className="border border-indigo-100 bg-indigo-50/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-indigo-900">
                Start with Topic #{recommendedTopic.position}: {recommendedTopic.title}
              </CardTitle>
              <CardDescription>
                {recommendedTopic.products?.name} • {recommendedTopic.duration_minutes} min
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 text-sm text-indigo-900">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <span>Watch the lesson and jot down three questions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <span>
                    Review slides/resources, then summarise the workflow in your own words.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <span>
                    Mark the topic as complete and ask the mentor one “why does this matter?”
                    question.
                  </span>
                </li>
              </ol>
              <Link href={`/topics/${recommendedTopic.id}`} className="inline-flex">
                <Button className="gap-2">
                  Jump into Topic {recommendedTopic.position}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {personaHighlight && (
          <Card className="border border-amber-100 bg-amber-50/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-amber-900">
                Persona Playbook: {profile?.assumed_persona}
              </CardTitle>
              <CardDescription>{personaHighlight.headline}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-amber-900">
                {personaHighlight.steps.map((step) => (
                  <li key={step} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="border border-emerald-100 bg-emerald-50/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-emerald-900">
              Next Assessments
            </CardTitle>
            <CardDescription>
              Validate mastery and prep for interviews to unlock the next learning tier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-emerald-900">
            {availableQuizzes.length > 0 ? (
              <div className="space-y-2">
                <p className="font-medium">Upcoming Quiz</p>
                <p>{availableQuizzes[0].title}</p>
                <p className="text-xs text-emerald-700">
                  Passing score: {availableQuizzes[0].passing_percentage}%
                </p>
                <Link href={`/assessments/quizzes/${availableQuizzes[0].id}`} className="inline-flex">
                  <Button size="sm" variant="outline" className="gap-2">
                    Start Quiz
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-emerald-700">
                We&apos;re prepping new quizzes for your track. Keep progressing through topics for now.
              </p>
            )}

            {recentQuizAttempts.length > 0 && (
              <div className="rounded-lg bg-white/60 p-3">
                <p className="text-xs uppercase tracking-wide text-emerald-600 mb-1">
                  Latest Result
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span>Score</span>
                  <span className="font-semibold">
                    {Number(recentQuizAttempts[0].percentage ?? 0).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Status</span>
                  <Badge variant={recentQuizAttempts[0].passed ? 'default' : 'destructive'}>
                    {recentQuizAttempts[0].passed ? 'Passed' : 'Review'}
                  </Badge>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="font-medium">Mock Interview</p>
              <p className="text-xs text-emerald-700">
                {interviewTemplates.length > 0
                  ? `Practice the ${interviewTemplates[0].title} scenario to strengthen communication.`
                  : 'Interview templates will unlock after your first quiz.'}
              </p>
              <Link href="/assessments/interview" className="inline-flex">
                <Button size="sm" variant="outline" className="gap-2">
                  Run Interview
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              out of {totalTopics || 0} total topics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="secondary">{profile?.assumed_persona || 'Not set'}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Your target level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activation Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Topics per day</span>
              <span className="font-semibold text-gray-900">{topicsPerDay}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>First completion</span>
              <span className="font-semibold text-gray-900">
                {timeToFirstCompletionHours !== null
                  ? formatDuration(timeToFirstCompletionHours)
                  : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {timeToFirstCompletionHours !== null
                ? 'Great work! Keep your streak going with the next guided checklist.'
                : 'Aim to complete Topic #1 within the next 24 hours to lock in momentum.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Learning Path</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {products?.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {product.name}
                  {profile?.preferred_product_id === product.id && (
                    <Badge>Primary</Badge>
                  )}
                </CardTitle>
                <CardDescription>{product.code}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{product.description}</p>
                <Link href={`/topics?product=${product.code}`}>
                  <Button className="w-full">
                    View Topics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to continue your learning</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Link href="/topics">
            <Button variant="outline" className="w-full justify-start">
              📚 Browse All Topics
            </Button>
          </Link>
          <Link href="/progress">
            <Button variant="outline" className="w-full justify-start">
              📊 View Detailed Progress
            </Button>
          </Link>
          <Link href="/ai-mentor">
            <Button variant="outline" className="w-full justify-start">
              🤖 Ask the Mentor a Question
            </Button>
          </Link>
          {recommendedTopic && (
            <Link href={`/topics/${recommendedTopic.id}`}>
              <Button variant="outline" className="w-full justify-start">
                ▶️ Resume Topic #{recommendedTopic.position}
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reminder Emails</CardTitle>
          <CardDescription>
            Stay accountable—receive a gentle nudge when you haven&apos;t completed a topic in 48
            hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ReminderOptInToggle initialOptedIn={reminderOptedIn} />
          <p className="text-xs text-muted-foreground">
            Reminders arrive at most once every 24 hours. Turn them off anytime. Last update:{' '}
            {reminderSettings?.updated_at
              ? new Date(reminderSettings.updated_at).toLocaleString()
              : 'not set'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Beta Check-In</CardTitle>
          <CardDescription>
            Share wins and blockers—your notes flow into the sprint changelog every Friday.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackForm lastSubmittedAt={latestFeedback?.submitted_at ?? null} />
        </CardContent>
      </Card>
    </div>
  );
}

