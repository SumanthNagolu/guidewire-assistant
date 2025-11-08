import { createClient } from '@/lib/supabase/server';
import { getTopicById } from '@/modules/topics/queries';
import { getActiveQuizzes } from '@/modules/assessments/quizzes';
import { redirect } from 'next/navigation';
import TopicContent from '@/components/features/topics/TopicContent';
import MentorChat from '@/components/features/ai-mentor/MentorChat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Clock, ClipboardCheck } from 'lucide-react';
import { type PersonaKey } from '@/modules/onboarding/persona-guidance';

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  const [topic, quizzes] = await Promise.all([
    getTopicById(id, user.id),
    getActiveQuizzes({ topicId: id }),
  ]);

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Topic Not Found</h1>
        <Link href="/topics">
          <Button>Back to Topics</Button>
        </Link>
      </div>
    );
  }

  // If topic is locked, show locked message
  if (topic.is_locked) {
    return (
      <div className="space-y-6">
        <Link href="/topics">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
          </Button>
        </Link>

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="mb-6 h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            This Topic is Locked
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            You need to complete the prerequisite topics before accessing this content.
          </p>
          <Link href="/topics">
            <Button>View All Topics</Button>
          </Link>
        </div>
      </div>
    );
  }

  type UserProfile = {
    assumed_persona: string | null;
    first_name: string | null;
  };

  const [{ data: profile }, { count: totalCompleted }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('assumed_persona, first_name')
      .eq('id', user.id)
      .maybeSingle<UserProfile>(),
    supabase
      .from('topic_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('completed_at', 'is', null),
  ]);

  const persona = (profile?.assumed_persona as PersonaKey | null) ?? null;
  const firstName = profile?.first_name ?? null;

  const isCompleted = Boolean(topic.completion?.completed_at);
  const completionPercentage = topic.completion?.completion_percentage || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Navigation */}
      <Link href="/topics">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Topics
        </Button>
      </Link>

      {/* Topic Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary">
                {topic.products.name} ({topic.products.code})
              </Badge>
              <Badge variant="outline">Topic #{topic.position}</Badge>
              {isCompleted && (
                <Badge className="bg-green-600">✓ Completed</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {topic.title}
            </h1>
            {topic.description && (
              <p className="text-gray-600 mt-2">{topic.description}</p>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{topic.duration_minutes} minutes</span>
          </div>
          {topic.completion && (
            <div>
              Progress: {completionPercentage}%
            </div>
          )}
          {topic.completion?.time_spent_seconds && (
            <div>
              Time spent: {Math.round(topic.completion.time_spent_seconds / 60)} min
            </div>
          )}
        </div>
      </div>

      {/* Learning Objectives */}
      {topic.content.learning_objectives && topic.content.learning_objectives.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Learning Objectives
          </h2>
          <ul className="space-y-2">
            {topic.content.learning_objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Available Quizzes */}
      {quizzes && quizzes.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-green-600" />
                Knowledge Check Available
              </h2>
              <p className="text-sm text-gray-700 mb-3">
                Test your understanding of this topic with {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}.
                Passing score: {quizzes[0].passing_percentage}%
              </p>
              <div className="space-y-2">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between bg-white rounded-md p-3 border border-green-100">
                    <div>
                      <p className="font-medium text-gray-900">{quiz.title}</p>
                      {quiz.description && (
                        <p className="text-xs text-gray-600 mt-1">{quiz.description}</p>
                      )}
                    </div>
                    <Link href={`/assessments/quizzes/${quiz.id}`}>
                      <Button size="sm">
                        Take Quiz
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout: Content and AI Mentor */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <TopicContent
            topic={topic}
            userId={user.id}
            persona={persona ?? undefined}
            firstName={firstName ?? undefined}
            totalCompleted={totalCompleted || 0}
          />
        </div>

        {/* AI Mentor Sidebar */}
        <div className="lg:col-span-1">
          <MentorChat topicId={topic.id} topicTitle={topic.title} />
        </div>
      </div>
    </div>
  );
}

