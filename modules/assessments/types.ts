import type { Json } from '@/types/database';

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'drag_drop';

export type Quiz = {
  id: string;
  product_id: string | null;
  topic_id: string | null;
  title: string;
  description: string | null;
  passing_percentage: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string | null;
  topic_id: string;
  question_type: QuestionType;
  question_text: string;
  options: Json | null;
  correct_answer: string;
  explanation: string | null;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  created_at: string;
  updated_at: string;
};

export type QuizAttemptAnswer = {
  questionId: string;
  answer: string | string[] | null;
};

export type QuizAttemptPayload = {
  quizId: string;
  topicId: string;
  answers: QuizAttemptAnswer[];
  timeTakenSeconds?: number;
};

export type QuizAttemptResult = {
  attemptId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  breakdown: {
    questionId: string;
    correct: boolean;
    answer: string | string[] | null;
    correctAnswer: string;
    explanation: string | null;
    pointsAwarded: number;
    pointsPossible: number;
  }[];
};

export type InterviewTemplate = {
  id: string;
  product_id: string | null;
  title: string;
  description: string | null;
  persona: string | null;
  focus_area: string | null;
  rubric: Json;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type InterviewSessionStatus = 'in_progress' | 'completed' | 'cancelled';

export type InterviewSessionRecord = {
  id: string;
  user_id: string;
  template_id: string | null;
  status: InterviewSessionStatus;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  readiness_score: number | null;
  metadata: Json;
};

export type InterviewFeedbackRecord = {
  id: string;
  session_id: string;
  summary: string | null;
  strengths: string | null;
  improvements: string | null;
  recommendations: string | null;
  rubric_scores: Json;
  created_at: string;
};

