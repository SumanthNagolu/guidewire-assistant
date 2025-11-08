'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
};

const TopicUpdateSchema = z.object({
  topicId: z.string().uuid({ message: 'Invalid topic identifier' }),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  durationMinutes: z.coerce
    .number({ message: 'Duration must be a number' })
    .int('Duration must be an integer')
    .min(1, 'Duration must be at least 1 minute')
    .max(720, 'Duration cannot exceed 720 minutes'),
  position: z.coerce
    .number({ message: 'Position must be a number' })
    .int('Position must be an integer')
    .min(1, 'Position must be at least 1'),
  published: z.enum(['true', 'false']).transform((value) => value === 'true'),
  prerequisites: z.array(z.string().uuid({ message: 'Invalid prerequisite topic' })).optional(),
  notes: z.string().max(5000, 'Notes are too long').optional().nullable(),
  learningObjectives: z.string().max(5000, 'Learning objectives are too long').optional().nullable(),
});

export async function updateTopicAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawPrerequisites = formData.getAll('prerequisites').filter(Boolean) as string[];

  const payload = {
    topicId: formData.get('topicId'),
    title: formData.get('title'),
    description: formData.get('description'),
    durationMinutes: formData.get('durationMinutes'),
    position: formData.get('position'),
    published: formData.get('published') ?? 'false',
    prerequisites: rawPrerequisites,
    notes: formData.get('notes'),
    learningObjectives: formData.get('learningObjectives'),
  } as Record<string, unknown>;

  const parsed = TopicUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === 'string' && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      status: 'error',
      message: 'Please fix the highlighted errors',
      fieldErrors,
    };
  }

  const {
    topicId,
    title,
    description,
    durationMinutes,
    position,
    published,
    prerequisites = [],
    notes,
    learningObjectives,
  } = parsed.data;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: 'error',
      message: 'You must be signed in',
    };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (profile?.role !== 'admin') {
    return {
      status: 'error',
      message: 'You do not have permission to update topics',
    };
  }

  const { data: existingTopic, error: fetchError } = await supabase
    .from('topics')
    .select('content, products!inner(code)')
    .eq('id', topicId)
    .single<{ content: Record<string, unknown> | null; products: { code: string } }>();

  if (fetchError || !existingTopic) {
    console.error('[Admin Topic] Fetch error:', fetchError);
    return {
      status: 'error',
      message: 'Unable to load topic details. Please try again.',
    };
  }

  const existingContent = existingTopic.content ?? {};

  const cleanedNotes = notes?.trim() ? notes.trim() : null;
  const learningObjectivesList = learningObjectives
    ? learningObjectives
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const updatedContent = {
    ...existingContent,
    notes: cleanedNotes,
    learning_objectives: learningObjectivesList,
  };

  const { error: updateError } = await supabase
    .from('topics')
    .update({
      title,
      description: description?.trim() || null,
      duration_minutes: durationMinutes,
      position,
      published,
      prerequisites,
      content: updatedContent,
    })
    .eq('id', topicId);

  if (updateError) {
    console.error('[Admin Topic] Update error:', updateError);
    return {
      status: 'error',
      message: 'Failed to update topic. Please try again.',
    };
  }

  revalidatePath('/admin/topics');
  revalidatePath(`/admin/topics/${topicId}`);
  revalidatePath(`/topics/${existingTopic.products.code}`);

  return {
    status: 'success',
    message: 'Topic updated successfully',
  };
}
