'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock, Lock, CheckCircle, PlayCircle } from 'lucide-react';
import type { TopicWithProgress } from '@/modules/topics/queries';

interface TopicsListProps {
  topics: TopicWithProgress[];
}

export default function TopicsList({ topics }: TopicsListProps) {
  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No topics available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => {
        const isCompleted = Boolean(topic.completion?.completed_at);
        const isInProgress = topic.completion && !isCompleted;
        const isLocked = topic.is_locked && !isCompleted;
        const completionPercentage = topic.completion?.completion_percentage || 0;

        return (
          <Card
            key={topic.id}
            className={`
              transition-all hover:shadow-lg
              ${isLocked ? 'opacity-60' : ''}
              ${isCompleted ? 'border-green-500 border-2' : ''}
            `}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-sm text-gray-500">#{topic.position}</span>
                    <span>{topic.title}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {topic.description || 'No description available'}
                  </CardDescription>
                </div>
                <div className="ml-2">
                  {isCompleted && (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                  {isInProgress && (
                    <PlayCircle className="h-6 w-6 text-blue-600" />
                  )}
                  {isLocked && (
                    <Lock className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Duration and Product */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{topic.duration_minutes} min</span>
                </div>
                <Badge variant="secondary">{topic.products.code}</Badge>
              </div>

              {/* Progress Bar */}
              {isInProgress && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} />
                </div>
              )}

              {/* Prerequisites Warning */}
              {isLocked && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  🔒 Complete prerequisites to unlock
                </div>
              )}

              {/* Action Button */}
              {isLocked ? (
                <Button variant="outline" disabled className="w-full">
                  Locked
                </Button>
              ) : (
                <Link href={`/topics/${topic.id}`} className="block">
                  <Button className="w-full">
                    {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

