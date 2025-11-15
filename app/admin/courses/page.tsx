import { createClient } from '@/lib/supabase/server';
import CourseBuilder from '@/components/admin/courses/CourseBuilder';
export default async function CoursesPage() {
  const supabase = await createClient();
  // Fetch learning paths (courses)
  const { data: courses } = await supabase
    .from('learning_paths')
    .select(`
      *,
      user:user_id(
        id,
        email,
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false });
  // Fetch available topics for course creation
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Course Builder
        </h1>
        <p className="text-gray-500 mt-1">
          Create and manage learning paths with AI-powered curriculum design
        </p>
      </div>
      <CourseBuilder 
        initialCourses={courses || []} 
        availableTopics={topics || []}
      />
    </div>
  );
}
