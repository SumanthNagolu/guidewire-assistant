import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { getActiveQuizzes, getRecentQuizAttempts } from '@/modules/assessments/quizzes';
import type { Database } from '@/types/database';
export default async function QuizzesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('preferred_product_id, first_name')
    .eq('id', user.id)
    .maybeSingle()
    .returns<Pick<Database['public']['Tables']['user_profiles']['Row'], 'preferred_product_id' | 'first_name'>>();
  const preferredProductId = profile?.preferred_product_id ?? undefined;
  const [quizzes, recentAttempts] = await Promise.all([
    getActiveQuizzes({ productId: preferredProductId }),
    getRecentQuizAttempts(5),
  ]);
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <p className="text-muted-foreground">
          Validate your knowledge and unlock interview readiness. Complete quizzes and review
          your recent results below.
        </p>
      </header>
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {quizzes.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle>No quizzes available yet</CardTitle>
              <CardDescription>
                Once new assessments are published for your track, you&apos;ll see them here.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                {quiz.description && (
                  <CardDescription>{quiz.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Passing score:</span>
                  <Badge variant="outline">{quiz.passing_percentage}%</Badge>
                </div>
                {quiz.topic_id && (
                  <p className="text-sm text-muted-foreground">
                    Linked topic ID: <span className="font-mono">{quiz.topic_id}</span>
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/assessments/quizzes/${quiz.id}`}>Start Assessment</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </section>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Recent Results</h2>
          <p className="text-sm text-muted-foreground">
            Track how you&apos;re progressing across assessments.
          </p>
        </div>
        {recentAttempts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No attempts yet</CardTitle>
              <CardDescription>Start a quiz to see your progress history.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentAttempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardHeader>
                  <CardTitle className="text-base">Attempt {attempt.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                    {attempt.created_at ? new Date(attempt.created_at).toLocaleString() : 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Score</span>
                    <span className="font-medium">
                      {Number(attempt.percentage ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant={attempt.passed ? 'default' : 'destructive'}>
                      {attempt.passed ? 'Passed' : 'Review needed'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
