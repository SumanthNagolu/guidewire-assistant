import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { Database, Json } from '@/types/database';
import type {
  Quiz,
  QuizAttemptPayload,
  QuizAttemptResult,
  QuizQuestion,
  QuizAttemptAnswer,
} from './types';

const quizAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.union([z.string(), z.array(z.string()), z.null()]),
});

const quizAttemptSchema = z.object({
  quizId: z.string().uuid(),
  topicId: z.string().uuid(),
  answers: z.array(quizAnswerSchema).min(1),
  timeTakenSeconds: z.number().int().min(0).optional(),
});

type QuizQuestionRow = Database['public']['Tables']['quiz_questions']['Row'];

function shuffleArray<T>(arr: T[]): T[] {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function calculateScore(
  questions: QuizQuestion[],
  answers: QuizAttemptAnswer[],
  passingPercentage: number
): QuizAttemptResult {
  const questionMap = new Map<string, QuizQuestion>(
    questions.map((q) => [q.id, q])
  );

  let score = 0;
  let maxScore = 0;
  const breakdown: QuizAttemptResult['breakdown'] = [];

  answers.forEach((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      return;
    }

    const pointsPossible = question.points ?? 1;
    maxScore += pointsPossible;

    const correctAnswer = question.correct_answer;
    let isCorrect = false;

    if (question.question_type === 'multiple_choice') {
      isCorrect = String(answer.answer).trim() === correctAnswer.trim();
    } else if (question.question_type === 'true_false') {
      isCorrect = String(answer.answer).toLowerCase() === correctAnswer.toLowerCase();
    } else if (question.question_type === 'fill_blank') {
      isCorrect = String(answer.answer).trim().toLowerCase() ===
        correctAnswer.trim().toLowerCase();
    } else {
      // drag_drop or others – compare serialized values
      if (Array.isArray(answer.answer)) {
        isCorrect = JSON.stringify(answer.answer) === correctAnswer;
      } else {
        isCorrect = String(answer.answer) === correctAnswer;
      }
    }

    const pointsAwarded = isCorrect ? pointsPossible : 0;
    score += pointsAwarded;

    breakdown.push({
      questionId: question.id,
      correct: isCorrect,
      answer: answer.answer,
      correctAnswer,
      explanation: question.explanation ?? null,
      pointsAwarded,
      pointsPossible,
    });
  });

  const percentage = maxScore === 0 ? 0 : Number(((score / maxScore) * 100).toFixed(2));
  const passed = percentage >= passingPercentage;

  return {
    attemptId: '',
    score,
    maxScore,
    percentage,
    passed,
    breakdown,
  };
}

export async function getActiveQuizzes(params: {
  productId?: string;
  topicId?: string;
}): Promise<Quiz[]> {
  const supabase = await createClient();

  let query = supabase
    .from('quizzes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (params.productId) {
    query = query.eq('product_id', params.productId);
  }

  if (params.topicId) {
    query = query.eq('topic_id', params.topicId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load quizzes: ${error.message}`);
  }

  return (data ?? []) as Quiz[];
}

export async function getQuizWithQuestions(quizId: string): Promise<{
  quiz: Quiz;
  questions: QuizQuestion[];
}> {
  const supabase = await createClient();

  const [{ data: quiz, error: quizError }, { data: questions, error: questionsError }] =
    await Promise.all([
      supabase.from('quizzes').select('*').eq('id', quizId).single<Quiz>(),
      supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: true })
        .returns<QuizQuestionRow[]>(),
    ]);

  if (quizError || !quiz) {
    throw new Error(quizError?.message ?? 'Quiz not found');
  }

  if (questionsError) {
    throw new Error(questionsError.message);
  }

  const formattedQuestions: QuizQuestion[] = (questions ?? []).map((question) => ({
    ...question,
    options: question.options as Json | null,
  })) as QuizQuestion[];

  return {
    quiz,
    questions: shuffleArray(formattedQuestions),
  };
}

export async function submitQuizAttempt(
  payload: QuizAttemptPayload
): Promise<QuizAttemptResult> {
  const validation = quizAttemptSchema.safeParse(payload);
  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message ?? 'Invalid quiz submission');
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('You must be signed in to submit a quiz');
  }

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', payload.quizId)
    .single<Quiz>();

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const { data: questionRows, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', payload.quizId)
    .returns<QuizQuestionRow[]>();

  if (questionsError) {
    throw new Error(questionsError.message);
  }

  const questions: QuizQuestion[] = (questionRows ?? []).map((row) => ({
    ...row,
    options: row.options as Json | null,
  })) as QuizQuestion[];

  const scored = calculateScore(questions, payload.answers, quiz.passing_percentage);

  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: user.id,
      quiz_id: payload.quizId,
      topic_id: payload.topicId,
      answers: payload.answers as unknown as Json,
      score: scored.score,
      max_score: scored.maxScore,
      percentage: scored.percentage,
      passed: scored.passed,
      time_taken_seconds: payload.timeTakenSeconds ?? null,
    })
    .select('id')
    .single();

  if (attemptError || !attempt) {
    throw new Error(attemptError?.message ?? 'Failed to save quiz attempt');
  }

  return {
    ...scored,
    attemptId: attempt.id,
  };
}

export async function getRecentQuizAttempts(limit = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id, created_at, percentage, passed, quiz_id, topic_id')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((attempt) => ({
    ...attempt,
    percentage: typeof attempt.percentage === 'number'
      ? attempt.percentage
      : Number(attempt.percentage ?? 0),
  }));
}

