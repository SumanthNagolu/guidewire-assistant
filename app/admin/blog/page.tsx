import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import BlogManagementClient from '@/components/admin/blog/BlogManagementClient';
export default async function AdminBlogPage() {
  const supabase = await createClient();
  // Fetch blog posts from database
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      category,
      tags,
      status,
      view_count,
      published_at,
      scheduled_for,
      created_at,
      author:author_id(
        id,
        email,
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false });
  if (error) {
    }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Blog Management
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage blog posts
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </Link>
      </div>
      {/* Blog Management Client Component */}
      <BlogManagementClient initialPosts={posts || []} />
    </div>
  );
}
