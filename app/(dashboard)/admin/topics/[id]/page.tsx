import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TopicEditForm from '@/components/features/admin/TopicEditForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import ContentViewer from '@/components/features/content/ContentViewer';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type TopicRecord = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  position: number;
  published: boolean;
  prerequisites: string[];
  content: Record<string, unknown> | null;
  product_id: string;
  products: { code: string; name: string };
};

export default async function AdminTopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { id } = await params;

  const { data: topic, error } = await supabase
    .from('topics')
    .select(
      `
        id,
        code,
        title,
        description,
        duration_minutes,
        position,
        published,
        prerequisites,
        content,
        product_id,
        products:products!inner(code, name)
      `
    )
    .eq('id', id)
    .single<TopicRecord>();

  if (error || !topic) {
    redirect('/admin/topics');
  }

  const { data: siblingTopics } = await supabase
    .from('topics')
    .select('id, title, position, code')
    .eq('product_id', topic.product_id);

  const prerequisiteOptions = (siblingTopics || [])
    .filter((item: any) => item.id !== topic.id)
    .map((item: any) => ({
      id: item.id as string,
      title: item.title as string,
      position: item.position as number,
      code: item.code as string,
    }));

  const slidesFile =
    (topic.content?.slides as string | null) ??
    (topic.content?.slides_url as string | null) ??
    null;

  const demos = Array.isArray(topic.content?.demos)
    ? (topic.content?.demos as string[])
    : [];
  const legacyVideo =
    typeof topic.content?.video_url === 'string' && topic.content.video_url.length > 0
      ? topic.content.video_url
      : null;
  const demosList = legacyVideo
    ? Array.from(new Set([...demos, legacyVideo]))
    : demos;

  const assignmentFile =
    (topic.content?.assignment as string | null) ??
    (topic.content?.assignment_url as string | null) ??
    null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Link href="/admin/topics">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Topics
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Topic</h1>
          <p className="text-muted-foreground">
            {topic.products.name} ({topic.products.code}) • Topic #{topic.position}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/content-upload">Go to Content Upload</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Topic Details</CardTitle>
            <CardDescription>Update metadata, prerequisites, and learning objectives.</CardDescription>
          </CardHeader>
          <CardContent>
            <TopicEditForm topic={topic} prerequisiteOptions={prerequisiteOptions} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Content Preview
              </CardTitle>
              <CardDescription>
                Uploaded files for this topic. Manage files in the Content Upload section.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentViewer
                productCode={topic.products.code}
                topicCode={topic.code}
                content={{
                  slides: slidesFile,
                  demos: demosList.length ? demosList : null,
                  assignment: assignmentFile,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
