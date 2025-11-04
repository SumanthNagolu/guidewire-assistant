'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { markTopicStarted, updateTopicProgress } from '@/modules/topics/queries';
import type { TopicWithProgress } from '@/modules/topics/queries';
import { CheckCircle, FileText, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopicContentProps {
  topic: TopicWithProgress;
  userId: string;
}

export default function TopicContent({ topic, userId }: TopicContentProps) {
  const router = useRouter();
  const [completionPercentage, setCompletionPercentage] = useState(
    topic.completion?.completion_percentage || 0
  );
  const [loading, setLoading] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const isCompleted = Boolean(topic.completion?.completed_at);
  const hasVideo = Boolean(topic.content.video_url);
  const hasSlides = Boolean(topic.content.slides_url);
  const hasNotes = Boolean(topic.content.notes);

  // Track time spent
  useEffect(() => {
    // Mark topic as started when user views it
    if (!topic.completion) {
      // Async IIFE pattern to properly handle async operation in useEffect
      (async () => {
        try {
          await markTopicStarted(userId, topic.id);
        } catch (error) {
          // Silently handle - non-critical if this fails
          console.error('Failed to mark topic as started:', error);
        }
      })();
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [topic.id, topic.completion, userId]);

  const handleMarkComplete = async () => {
    setLoading(true);
    try {
      const result = await updateTopicProgress(userId, topic.id, 100, timeSpent);
      
      if (result.success) {
        toast.success('Topic marked as complete! 🎉');
        setCompletionPercentage(100);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to mark topic as complete');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    // Convert various YouTube URL formats to embed format
    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <div className="space-y-6">
      {/* Video Section */}
      {hasVideo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Lesson
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
              {topic.content.video_url?.includes('youtube.com') ||
              topic.content.video_url?.includes('youtu.be') ? (
                <iframe
                  src={getYouTubeEmbedUrl(topic.content.video_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : topic.content.video_url?.includes('loom.com') ? (
                <iframe
                  src={topic.content.video_url}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Video player not available</p>
                    <a
                      href={topic.content.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                    >
                      Open video in new tab
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Slides/Resources Section */}
      {hasSlides && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Slides & Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={topic.content.slides_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View Slides
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      {hasNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Lesson Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{topic.content.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} />
          </div>

          {!isCompleted && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Once you&apos;ve watched the video and reviewed the materials, mark this topic
                as complete to unlock the next topics.
              </p>
              <Button
                onClick={handleMarkComplete}
                disabled={loading || isCompleted}
                className="w-full"
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </div>
          )}

          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">
                Topic Completed! Great job! 🎉
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

