import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { TopicUploadForm } from '@/components/features/admin/TopicUploadForm';
import TopicEditButton from '@/components/features/admin/TopicEditButton';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminTopicsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get all topics
  const { data: topics } = await supabase
    .from('topics')
    .select(`
      *,
      products(name, code)
    `)
    .order('position', { ascending: true });

  console.log('[Admin Topics] Total topics loaded:', topics?.length || 0);
  if (topics && topics.length > 0) {
    console.log('[Admin Topics] First topic ID:', topics[0].id);
    console.log('[Admin Topics] First topic title:', topics[0].title);
  }

  type TopicWithProduct = {
    products: { name: string; code: string } | null;
    [key: string]: any;
  };

  // Group by product
  const topicsByProduct = topics?.reduce((acc: any, topic: TopicWithProduct) => {
    const productCode = topic.products?.code;
    if (!productCode) return acc;
    if (!acc[productCode]) {
      acc[productCode] = [];
    }
    acc[productCode].push(topic);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Topic Management</h1>
          <p className="text-gray-600 mt-2">
            Manage topics across all Guidewire products
          </p>
        </div>

        <div className="flex gap-2">
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Topic
          </Button>
        </div>
      </div>

      {/* Bulk Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload Topics</CardTitle>
          <CardDescription>
            Import ClaimCenter topics from JSON or seed via CLI for large batches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TopicUploadForm />

          <div className="space-y-3 rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-medium">JSON Schema</p>
            <pre className="block overflow-x-auto whitespace-pre rounded bg-white p-3 text-xs">
{`{
  "product_code": "CC",
  "position": 1,
  "title": "Topic title",
  "description": "Summary",
  "duration_minutes": 30,
  "prerequisites": ["topic-id"],
  "content": {
    "video_url": "https://…",
    "slides_url": "https://…",
    "learning_objectives": ["Objective 1"]
  }
}`}
            </pre>
            <p>
              Use the sample file at <code>data/claimcenter-topics.json</code> or run
              <code className="mx-1 rounded bg-white px-2 py-1">npm run seed:claimcenter</code>
              after setting <code className="mx-1 rounded bg-white px-2 py-1">NEXT_PUBLIC_SUPABASE_URL</code>
              and
              <code className="mx-1 rounded bg-white px-2 py-1">SUPABASE_SERVICE_ROLE_KEY</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Topics by Product */}
      <div className="space-y-6">
        {Object.entries(topicsByProduct || {}).map(([productCode, productTopics]: [string, any]) => (
          <Card key={productCode}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {productTopics[0]?.products.name}
                <Badge variant="secondary">{productCode}</Badge>
                <Badge variant="outline">{productTopics.length} topics</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {productTopics.slice(0, 10).map((topic: any) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 font-mono">
                        #{topic.position}
                      </span>
                      <div>
                        <p className="font-medium">{topic.title}</p>
                        <p className="text-sm text-gray-600">
                          {topic.duration_minutes} min
                          {!topic.published && (
                            <Badge variant="outline" className="ml-2">
                              Draft
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    <TopicEditButton topicId={topic.id} title={`Edit ${topic.title}`} />
                  </div>
                ))}
                {productTopics.length > 10 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    + {productTopics.length - 10} more topics
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

