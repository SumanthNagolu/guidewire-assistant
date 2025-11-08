import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ContentUploadForm from '@/components/features/admin/ContentUploadForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Video, Presentation } from 'lucide-react';

export default async function ContentUploadPage() {
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

  // Get all products for the dropdown
  const { data: products } = await supabase
    .from('products')
    .select('id, code, name')
    .order('name');

  // Get all topics for the dropdown
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, product_id')
    .eq('is_published', true)
    .order('position');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Upload className="h-8 w-8 text-indigo-600" />
          Content Upload
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload lesson content (slides, videos, assignments) to Supabase Storage
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Presentation className="h-4 w-4 text-blue-600" />
              Slides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              PPT, PPTX files
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max 500 MB per file
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-purple-600" />
              Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              MP4, MOV, AVI, WebM
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max 500 MB per file
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-green-600" />
              Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              PDF files
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max 500 MB per file
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Form */}
      <ContentUploadForm products={products || []} topics={Array.isArray(topics) ? topics : []} />

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm">📋 Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-blue-900 space-y-2">
          <p className="font-medium">File Naming Convention:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Slides:</strong> slides.pptx or lesson.pptx</li>
            <li><strong>Videos:</strong> demo-01.mp4, demo-02.mp4, etc.</li>
            <li><strong>Assignments:</strong> assignment.pdf or exercises.pdf</li>
          </ul>
          <p className="font-medium mt-3">Storage Structure:</p>
          <p className="font-mono text-xs bg-blue-100 p-2 rounded">
            {`{PRODUCT_CODE}/{TOPIC_CODE}/{filename}`}
          </p>
          <p className="mt-2">Example: CC/cc-01-001/slides.pptx</p>
        </CardContent>
      </Card>
    </div>
  );
}

