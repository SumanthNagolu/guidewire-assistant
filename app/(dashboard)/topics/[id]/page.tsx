import { createClient } from '@/lib/supabase/server';
import { getTopicById } from '@/modules/topics/queries';
import { redirect } from 'next/navigation';
import TopicContent from '@/components/features/topics/TopicContent';
import MentorChat from '@/components/features/ai-mentor/MentorChat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';

export default async function TopicDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const topic = await getTopicById(params.id, user.id);

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

      {/* Two-column layout: Content and AI Mentor */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <TopicContent topic={topic} userId={user.id} />
        </div>

        {/* AI Mentor Sidebar */}
        <div className="lg:col-span-1">
          <MentorChat topicId={topic.id} topicTitle={topic.title} />
        </div>
      </div>
    </div>
  );
}

