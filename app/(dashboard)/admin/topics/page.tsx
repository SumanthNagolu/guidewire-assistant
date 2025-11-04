import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Upload, Plus } from 'lucide-react';

export default async function AdminTopicsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
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

  // Group by product
  const topicsByProduct = topics?.reduce((acc: any, topic) => {
    const productCode = topic.products.code;
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
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Topic
          </Button>
        </div>
      </div>

      {/* CSV Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload via CSV</CardTitle>
          <CardDescription>
            Upload multiple topics at once using a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm font-medium mb-2">CSV Format:</p>
            <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
              product_code,position,title,description,duration_minutes,prerequisites,video_url,slides_url,notes,learning_objectives
            </code>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Example:</p>
            <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
              CC,1,&quot;Introduction to ClaimCenter&quot;,&quot;Learn the basics...&quot;,60,&quot;[]&quot;,https://youtube.com/...,https://slides.com/...,&quot;Notes here&quot;,&quot;[&apos;Objective 1&apos;]&apos;&quot;
            </code>
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
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
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

