'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { markTopicStarted, updateTopicProgress } from '@/modules/topics/mutations';
import type { TopicWithProgress } from '@/modules/topics/queries';
import { CheckCircle, CheckCircle2, Circle, FileText, Video, ClipboardCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  personaPlaybooks,
  type PersonaKey,
} from '@/modules/onboarding/persona-guidance';
import ContentViewer from '@/components/features/content/ContentViewer';

interface TopicContentProps {
  topic: TopicWithProgress;
  userId: string;
  persona?: PersonaKey;
  firstName?: string;
  totalCompleted: number;
}

export default function TopicContent({
  topic,
  userId,
  persona,
  firstName,
  totalCompleted,
}: TopicContentProps) {
  const router = useRouter();
  const [completionPercentage, setCompletionPercentage] = useState(
    topic.completion?.completion_percentage || 0
  );
  const [loading, setLoading] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  
  // Use ref to persist startTime across re-renders
  const startTimeRef = useRef<number>(Date.now());

  const isCompleted = Boolean(topic.completion?.completed_at);
  const hasVideo = Boolean(topic.content.video_url);
  const hasSlides = Boolean(topic.content.slides_url);
  const hasNotes = Boolean(topic.content.notes);
  const productName = topic.products?.name ?? 'ClaimCenter';
  const personaCard = persona ? personaPlaybooks[persona] : undefined;
  const isFirstTopic = totalCompleted === 0 && !isCompleted;

  const checklist = useMemo(
    () => [
      {
        label: 'Watch the lesson with intent',
        description: 'Pause after each section and jot down how it applies to your projects.',
        disabled: false,
      },
      {
        label: 'Review slides & supporting docs',
        description: hasSlides
          ? 'Capture two insights from the slides that you can explain to a peer.'
          : 'Skim the transcript or rewatch key moments to reinforce your understanding.',
        disabled: false,
      },
      {
        label: 'Ask the mentor one “why” question',
        description: 'Use the AI mentor to test your understanding or clarify workflow nuance.',
        disabled: false,
      },
    ],
    [hasSlides]
  );

  const [checklistState, setChecklistState] = useState<boolean[]>(() =>
    checklist.map(() => false)
  );

  useEffect(() => {
    setChecklistState(checklist.map(() => false));
  }, [checklist]);

  const toggleChecklist = (index: number) => {
    setChecklistState((prev) => prev.map((value, idx) => (idx === index ? !value : value)));
  };

  // Mark topic as started (runs once per topic)
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id, userId]); // Intentionally not including topic.completion to avoid re-running on completion

  // Track time spent (separate effect with persistent ref)
  useEffect(() => {
    // Reset start time only when topic changes (not on completion state change)
    startTimeRef.current = Date.now();
    
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [topic.id]); // Only reset timer when topic changes, not on completion

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
      {isFirstTopic ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900">
          <p className="font-semibold">
            {firstName ? `Let’s lock in your first win, ${firstName}!` : 'Let’s lock in your first win!'}
          </p>
          <p className="mt-1">
            Work through every step below and you&apos;ll unlock the next topic before the end of today.
            Capture one quote, one workflow, and one “why” question as you go.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-4 text-sm text-sky-900">
          <p className="font-medium">
            Master this {productName} topic and you&apos;ll be one step closer to unlocking the next
            prerequisite.
          </p>
          <p className="mt-1">
            Keep stacking interview stories—write down action items after each lesson so you can
            teach it back tomorrow.
          </p>
        </div>
      )}

      {personaCard && (
        <Card className="border border-amber-200 bg-amber-50/60">
          <CardHeader>
            <CardTitle className="text-amber-900">Persona Focus: {persona}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-amber-900">{personaCard.headline}</p>
            <ul className="mt-3 space-y-2 text-xs text-amber-900">
              {personaCard.steps.map((step) => (
                <li key={step} className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Content Viewer - Automatically handles slides, demos, and assignments */}
      <ContentViewer
        productCode={topic.products.code}
        topicCode={topic.code}
        content={{
          slides: topic.content.slides || null,
          demos: topic.content.demos || null,
          assignment: topic.content.assignment || null,
        }}
      />

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

      {/* Learning Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            Track micro-wins during this lesson. Ticking each step primes you to apply the
            concept on real projects.
          </div>
          <ul className="space-y-3">
            {checklist.map((item, index) => {
              const completed = checklistState[index];
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => toggleChecklist(index)}
                    className="flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-indigo-200 hover:shadow-sm"
                  >
                    {completed ? (
                      <CheckCircle2 className="mt-1 h-5 w-5 text-indigo-600" />
                    ) : (
                      <Circle className="mt-1 h-5 w-5 text-gray-300" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

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
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                Lock in what you learned: mark complete once you can articulate the core
                workflow and next steps without notes.
              </div>
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

