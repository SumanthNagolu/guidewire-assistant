'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  getActiveQuizzes,
  getQuizWithQuestions,
  submitQuizAttempt,
} from '@/modules/assessments/quizzes';
const submissionSchema = z.object({
  quizId: z.string().uuid(),
  topicId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.union([z.string(), z.array(z.string()), z.null()]),
    })
  ),
  timeTakenSeconds: z.number().int().min(0).optional(),
});
export async function loadLearnerQuizzes(params: {
  productId?: string;
  topicId?: string;
}) {
  const quizzes = await getActiveQuizzes(params);
  return quizzes;
}
export async function loadQuiz(quizId: string) {
  return getQuizWithQuestions(quizId);
}
export async function submitQuiz(payload: unknown) {
  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid submission payload',
    };
  }
  try {
    const result = await submitQuizAttempt(parsed.data);
    revalidatePath('/academy/assessments');
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unable to submit quiz at this time.' };
  }
}
