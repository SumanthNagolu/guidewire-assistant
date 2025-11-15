import CourseEditor from '@/components/admin/courses/CourseEditor';
import { createClient } from '@/lib/supabase/server';
export default async function EditCoursePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const supabase = await createClient();
  // Fetch available topics
  const { data: topics } = await supabase
    .from('topics')
    .select(`
      id,
      title,
      description,
      duration_minutes,
      difficulty,
      products(name, code)
    `)
    .order('title');
  return <CourseEditor courseId={id} availableTopics={topics || []} />;
}
