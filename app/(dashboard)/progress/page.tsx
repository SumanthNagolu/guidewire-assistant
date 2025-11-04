import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, Trophy, Target, TrendingUp } from 'lucide-react';

export default async function ProgressPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, products(name, code)')
    .eq('id', user.id)
    .single();

  // Get products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('code');

  // Get all user completions with topic info
  const { data: completions } = await supabase
    .from('topic_completions')
    .select(`
      *,
      topics!inner(
        id,
        title,
        position,
        duration_minutes,
        product_id,
        products!inner(name, code)
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  // Calculate stats per product
  const productStats = await Promise.all(
    (products || []).map(async (product) => {
      const { count: totalTopics } = await supabase
        .from('topics')
        .select('*', { count: 'only', head: true })
        .eq('product_id', product.id)
        .eq('published', true);

      const completedTopics = completions?.filter(
        (c: any) =>
          c.topics.product_id === product.id && c.completed_at !== null
      ) || [];

      const inProgressTopics = completions?.filter(
        (c: any) =>
          c.topics.product_id === product.id && c.completed_at === null
      ) || [];

      const totalTime = completedTopics.reduce(
        (sum, c) => sum + (c.time_spent_seconds || 0),
        0
      );

      const completionPercentage = totalTopics
        ? Math.round((completedTopics.length / totalTopics) * 100)
        : 0;

      return {
        product,
        totalTopics: totalTopics || 0,
        completedCount: completedTopics.length,
        inProgressCount: inProgressTopics.length,
        totalTimeMinutes: Math.round(totalTime / 60),
        completionPercentage,
      };
    })
  );

  // Overall stats
  const totalCompleted = completions?.filter((c) => c.completed_at).length || 0;
  const totalInProgress = completions?.filter((c) => !c.completed_at).length || 0;
  const totalTimeSpent = Math.round(
    (completions?.reduce((sum, c) => sum + (c.time_spent_seconds || 0), 0) || 0) / 60
  );

  // Recent completions
  const recentCompletions = completions?.filter((c) => c.completed_at).slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-600 mt-2">
          Track your learning journey across all Guidewire products
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics Completed</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {totalInProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTimeSpent}</div>
            <p className="text-xs text-muted-foreground">minutes of learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience Level</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{profile?.assumed_persona || 'Not set'}</div>
            <p className="text-xs text-muted-foreground">Target level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">days (coming soon)</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress by Product */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Progress by Product</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {productStats.map((stat) => (
            <Card key={stat.product.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {stat.product.name}
                  {profile?.preferred_product_id === stat.product.id && (
                    <Badge>Primary</Badge>
                  )}
                </CardTitle>
                <CardDescription>{stat.product.code}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-medium">{stat.completionPercentage}%</span>
                  </div>
                  <Progress value={stat.completionPercentage} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Completed</p>
                    <p className="text-xl font-bold text-green-600">
                      {stat.completedCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">In Progress</p>
                    <p className="text-xl font-bold text-blue-600">
                      {stat.inProgressCount}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-600">
                    {stat.totalTimeMinutes} minutes invested
                  </p>
                </div>

                <Link href={`/topics?product=${stat.product.code}`}>
                  <Button variant="outline" className="w-full">
                    View Topics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Completions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Completions</h2>
        <Card>
          <CardContent className="p-0">
            {recentCompletions.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p>No completed topics yet.</p>
                <Link href="/topics" className="inline-block mt-4">
                  <Button>Start Learning</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {recentCompletions.map((completion: any) => (
                  <div
                    key={completion.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">
                            {completion.topics.products.code}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Topic #{completion.topics.position}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900">
                          {completion.topics.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Completed{' '}
                          {new Date(completion.completed_at).toLocaleDateString()} •{' '}
                          {Math.round(completion.time_spent_seconds / 60)} min
                        </p>
                      </div>
                      <Link href={`/topics/${completion.topic_id}`}>
                        <Button variant="ghost" size="sm">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

