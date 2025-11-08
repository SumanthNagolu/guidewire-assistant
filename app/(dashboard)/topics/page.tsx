import { createClient } from '@/lib/supabase/server';
import { getTopicsByProduct } from '@/modules/topics/queries';
import TopicsList from '@/components/features/topics/TopicsList';
import ProductFilter from '@/components/features/topics/ProductFilter';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const rawSearchParams = await searchParams;
  const productParam = rawSearchParams.product;
  const product = Array.isArray(productParam) ? productParam[0] : productParam;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get products
  type Product = {
    id: string;
    name: string;
    code: string;
    description: string | null;
  };

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('code')
    .returns<Product[]>();

  // Get topics filtered by product
  const topics = await getTopicsByProduct(product, user.id);

  const selectedProduct = products?.find((p) => p.code === product);
  
  // Calculate stats
  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.completion?.completed_at).length;
  const inProgressTopics = topics.filter(
    (t) => t.completion && !t.completion.completed_at
  ).length;

  const recommendedTopic = topics.find(
    (topic) => !topic.is_locked && !topic.completion?.completed_at
  );
  const firstLockedTopic = topics.find((topic) => topic.is_locked);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedProduct ? selectedProduct.name : 'All Topics'}
          </h1>
          <p className="text-gray-600 mt-2">
            Browse and progress through {totalTopics} sequential topics
          </p>
        </div>

        {/* Product Filter - Now a client component */}
        <ProductFilter
          products={products || []}
          currentProduct={product}
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        <Badge variant="outline" className="px-4 py-2">
          📚 {totalTopics} Total Topics
        </Badge>
        <Badge variant="default" className="px-4 py-2 bg-green-600">
          ✓ {completedTopics} Completed
        </Badge>
        <Badge variant="secondary" className="px-4 py-2">
          🔄 {inProgressTopics} In Progress
        </Badge>
        <Badge variant="outline" className="px-4 py-2">
          🔒 {totalTopics - completedTopics - inProgressTopics} Locked
        </Badge>
      </div>

      {(recommendedTopic || firstLockedTopic) && (
        <Card className="border border-indigo-100 bg-indigo-50/70">
          <CardHeader>
            <CardTitle className="text-indigo-900 text-base md:text-lg">
              {recommendedTopic
                ? `Up next: Topic #${recommendedTopic.position} – ${recommendedTopic.title}`
                : `Next unlock: Topic #${firstLockedTopic?.position}`}
            </CardTitle>
            <CardDescription className="text-indigo-800">
              {recommendedTopic
                ? 'Follow the checklist below to stay on track. Each topic builds on the last—lock in this win before advancing.'
                : 'Complete the remaining prerequisite topics to unlock the next module in your sequential learning path.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-indigo-900">
              {recommendedTopic ? (
                <ul className="list-disc space-y-1 pl-4">
                  <li>Watch the lesson and capture one interview-ready insight.</li>
                  <li>Summarize the workflow in your persona playbook.</li>
                  <li>Ask the mentor a “why does this matter?” question to deepen mastery.</li>
                </ul>
              ) : (
                <p>
                  You&apos;re just one topic away from unlocking{' '}
                  <strong>Topic #{firstLockedTopic?.position}</strong>. Keep momentum—finish the previous
                  lesson and refresh this page.
                </p>
              )}
            </div>

            {recommendedTopic && (
              <Link href={`/topics/${recommendedTopic.id}`} className="w-full md:w-auto">
                <Button className="w-full md:w-auto gap-2">
                  Resume Topic #{recommendedTopic.position}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Topics List */}
      <TopicsList topics={topics} />
    </div>
  );
}
