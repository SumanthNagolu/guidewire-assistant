'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Quiz, QuizQuestion } from '@/modules/assessments/types';
import { submitQuiz } from '@/app/(dashboard)/assessments/quizzes/actions';

type Props = {
  quiz: Quiz;
  questions: QuizQuestion[];
};

type AnswerValue = string | string[] | null;

function getOptions(question: QuizQuestion): string[] {
  if (!question.options) return [];
  if (Array.isArray(question.options)) return question.options as string[];
  if (typeof question.options === 'object' && question.options !== null) {
    return Object.values(question.options).map((value) => String(value));
  }
  try {
    const parsed = JSON.parse(String(question.options));
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return [];
  }
}

export default function QuizRunner({ quiz, questions }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isPending, startTransition] = useTransition();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitQuiz>>['data']>();

  const currentQuestion = questions[currentIndex];
  const topicId = quiz.topic_id ?? questions[0]?.topic_id ?? ''; // fallback to first question

  useEffect(() => {
    if (result) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [result]);

  const formattedOptions = useMemo(() => {
    if (!currentQuestion) return [];
    const opts = getOptions(currentQuestion);
    // Return array of {key, value} pairs like [{key: "A", value: "Payment Processing"}, ...]
    return opts;
  }, [currentQuestion]);

  // Get options as {key: value} object for multiple choice
  const optionsObject = useMemo(() => {
    if (!currentQuestion || !currentQuestion.options) return {};
    try {
      if (typeof currentQuestion.options === 'string') {
        return JSON.parse(currentQuestion.options) as Record<string, string>;
      }
      return currentQuestion.options as Record<string, string>;
    } catch {
      return {};
    }
  }, [currentQuestion]);

  if (!currentQuestion) {
    return <p className="text-sm text-muted-foreground">No questions available just yet.</p>;
  }

  const totalQuestions = questions.length;

  const handleAnswerChange = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!topicId) {
      toast.error('Cannot submit quiz without an associated topic.');
      return;
    }

    startTransition(async () => {
      const payload = {
        quizId: quiz.id,
        topicId,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
        timeTakenSeconds: elapsedSeconds,
      };

      const response = await submitQuiz(payload);

      if (!response.success || !response.data) {
        toast.error(response.error ?? 'Unable to submit quiz right now.');
        return;
      }

      setResult(response.data);
      toast.success(response.data.passed ? 'Great work! Quiz passed.' : 'Review your answers.');
    });
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setResult(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
          <h2 className="text-xl font-semibold">{currentQuestion.question_text}</h2>
        </div>
        <Badge variant="outline">Time: {elapsedSeconds}s</Badge>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-4">
        {currentQuestion.question_type === 'multiple_choice' && (
          <div className="space-y-2">
            {Object.entries(optionsObject).map(([key, value]) => {
              const optionId = `${currentQuestion.id}-${key}`;
              const selected = answers[currentQuestion.id] === key;
              return (
                <label
                  key={optionId}
                  htmlFor={optionId}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                    selected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20' : 'hover:bg-muted'
                  }`}
                >
                  <input
                    id={optionId}
                    type="radio"
                    name={currentQuestion.id}
                    value={key}
                    checked={selected}
                    onChange={() => handleAnswerChange(currentQuestion.id, key)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">{key}) {value}</span>
                </label>
              );
            })}
          </div>
        )}

        {currentQuestion.question_type === 'true_false' && (
          <div className="grid gap-2">
            {['True', 'False'].map((option) => {
              const optionId = `${currentQuestion.id}-${option}`;
              const selected = answers[currentQuestion.id] === option.toLowerCase();
              return (
                <label
                  key={optionId}
                  htmlFor={optionId}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                    selected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20' : 'hover:bg-muted'
                  }`}
                >
                  <input
                    id={optionId}
                    type="radio"
                    name={currentQuestion.id}
                    value={option.toLowerCase()}
                    checked={selected}
                    onChange={() => handleAnswerChange(currentQuestion.id, option.toLowerCase())}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">{option}</span>
                </label>
              );
            })}
          </div>
        )}

        {currentQuestion.question_type === 'fill_blank' && (
          <Input
            placeholder="Type your answer"
            value={(answers[currentQuestion.id] as string) ?? ''}
            onChange={(event) => handleAnswerChange(currentQuestion.id, event.target.value)}
          />
        )}

        {currentQuestion.question_type === 'drag_drop' && (
          <Textarea
            placeholder="Describe your answer or list the ordered steps."
            value={(answers[currentQuestion.id] as string) ?? ''}
            onChange={(event) => handleAnswerChange(currentQuestion.id, event.target.value)}
            rows={4}
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
          disabled={currentIndex === 0 || !!result}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isPending}
          >
            Reset
          </Button>
          {currentIndex < totalQuestions - 1 ? (
            <Button
              onClick={() => setCurrentIndex((index) => Math.min(index + 1, totalQuestions - 1))}
              disabled={!!result}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isPending || !!result}>
              {isPending ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </div>

      {result && (
        <div className="space-y-4 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Results</h3>
              <p className="text-sm text-muted-foreground">
                You scored {result.score} out of {result.maxScore} points ({result.percentage}%).
              </p>
            </div>
            <Badge variant={result.passed ? 'default' : 'destructive'}>
              {result.passed ? 'Passed' : 'Needs Review'}
            </Badge>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-3">
            {result.breakdown.map((item) => (
              <div
                key={item.questionId}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Question {item.questionId.slice(0, 6)}</span>
                  <Badge variant={item.correct ? 'default' : 'destructive'}>
                    {item.correct ? 'Correct' : 'Incorrect'}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your answer: {Array.isArray(item.answer) ? item.answer.join(', ') : item.answer ?? '—'}
                </p>
                {!item.correct && (
                  <p className="mt-1 text-sm">
                    Correct answer: <span className="font-medium">{item.correctAnswer}</span>
                  </p>
                )}
                {item.explanation && (
                  <p className="mt-2 text-sm text-muted-foreground">{item.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end">
            <Button onClick={handleReset} variant="outline">
              Retake Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

