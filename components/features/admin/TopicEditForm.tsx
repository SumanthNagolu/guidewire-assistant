'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { updateTopicAction } from '@/app/(dashboard)/admin/topics/[id]/actions';
import { cn } from '@/lib/utils';

type TopicEditFormProps = {
  topic: {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    position: number;
    published: boolean;
    prerequisites: string[];
    content: Record<string, unknown> | null;
    products: { code: string; name: string };
  };
  prerequisiteOptions: Array<{
    id: string;
    title: string;
    position: number;
    code: string;
  }>;
};

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
};

const initialState: ActionState = {
  status: 'idle',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export default function TopicEditForm({ topic, prerequisiteOptions }: TopicEditFormProps) {
  const [state, formAction] = useFormState(updateTopicAction, initialState);

  useEffect(() => {
    if (state.status === 'success' && state.message) {
      toast.success(state.message);
    }
    if (state.status === 'error' && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const content = topic.content ?? {};
  const existingNotes = typeof content.notes === 'string' ? (content.notes as string) : '';
  const learningObjectives = Array.isArray(content.learning_objectives)
    ? (content.learning_objectives as string[])
    : [];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="topicId" value={topic.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={topic.title}
            aria-invalid={Boolean(state.fieldErrors?.title)}
          />
          {state.fieldErrors?.title && (
            <p className="text-xs text-red-600">{state.fieldErrors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            type="number"
            min={1}
            defaultValue={topic.position}
            aria-invalid={Boolean(state.fieldErrors?.position)}
          />
          {state.fieldErrors?.position && (
            <p className="text-xs text-red-600">{state.fieldErrors.position}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={1}
            max={720}
            defaultValue={topic.duration_minutes}
            aria-invalid={Boolean(state.fieldErrors?.durationMinutes)}
          />
          {state.fieldErrors?.durationMinutes && (
            <p className="text-xs text-red-600">{state.fieldErrors.durationMinutes}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="published">Published</Label>
          <div className="flex h-10 items-center gap-3 rounded-md border border-input bg-background px-3">
            <input
              type="checkbox"
              id="published"
              name="published"
              value="true"
              defaultChecked={topic.published}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-muted-foreground">
              {topic.published ? 'Visible to learners' : 'Draft (hidden)'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={topic.description ?? ''}
          rows={4}
          aria-invalid={Boolean(state.fieldErrors?.description)}
        />
        {state.fieldErrors?.description && (
          <p className="text-xs text-red-600">{state.fieldErrors.description}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Prerequisites</Label>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground mb-2">
            Select topics learners must complete before unlocking this lesson.
          </p>
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {prerequisiteOptions.length === 0 && (
              <p className="text-sm text-muted-foreground">No prerequisite topics available.</p>
            )}
            {prerequisiteOptions.map((option) => (
              <label
                key={option.id}
                className={cn(
                  'flex items-center justify-between rounded-md border p-2 text-sm',
                  topic.id === option.id && 'opacity-60 pointer-events-none'
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="prerequisites"
                    value={option.id}
                    defaultChecked={topic.prerequisites.includes(option.id)}
                    disabled={topic.id === option.id}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{option.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      #{option.position} • {option.code}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="learningObjectives">Learning Objectives (one per line)</Label>
          <Textarea
            id="learningObjectives"
            name="learningObjectives"
            defaultValue={learningObjectives.join('\n')}
            rows={6}
            aria-invalid={Boolean(state.fieldErrors?.learningObjectives)}
          />
          {state.fieldErrors?.learningObjectives && (
            <p className="text-xs text-red-600">{state.fieldErrors.learningObjectives}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Instructor Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={existingNotes}
            rows={6}
            aria-invalid={Boolean(state.fieldErrors?.notes)}
          />
          {state.fieldErrors?.notes && (
            <p className="text-xs text-red-600">{state.fieldErrors.notes}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-900">Current Content Assets</p>
        <div className="flex flex-wrap gap-2">
          {content.slides ? (
            <Badge variant="secondary">Slides: {String(content.slides)}</Badge>
          ) : null}
          {Array.isArray(content.demos) && content.demos.length > 0 ? (
            <Badge variant="secondary">Demos: {content.demos.length}</Badge>
          ) : null}
          {content.assignment ? (
            <Badge variant="secondary">Assignment: {String(content.assignment)}</Badge>
          ) : null}
          {!content.slides && !content.assignment &&
            (!Array.isArray(content.demos) || content.demos.length === 0) && (
              <span className="text-sm text-muted-foreground">
                No files attached yet. Upload lessons via the Content Upload page.
              </span>
            )}
        </div>
        <p className="text-xs text-muted-foreground">
          Need to add or replace files? Use the <a href="/admin/content-upload" className="text-blue-600 underline">Content Upload</a>{' '}
          tool and they will appear here automatically.
        </p>
      </div>

      <SubmitButton />
    </form>
  );
}
