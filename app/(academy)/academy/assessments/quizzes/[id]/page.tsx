import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getQuizWithQuestions } from '@/modules/assessments/quizzes';
import QuizRunner from '@/components/features/assessments/QuizRunner';
export default async function QuizAttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const { quiz, questions } = await getQuizWithQuestions(id);
    return (
      <div className="space-y-6 pb-16">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/assessments/quizzes">← Back to Assessments</Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizRunner quiz={quiz} questions={questions} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
