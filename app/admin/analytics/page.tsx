import { createClient } from '@/lib/supabase/server';
import AnalyticsDashboard from '@/components/admin/analytics/AnalyticsDashboard';
export default async function AnalyticsPage() {
  const supabase = await createClient();
  // Fetch comprehensive analytics data
  const [
    jobsData,
    candidatesData,
    placementsData,
    blogData,
    resourcesData,
    bannersData,
    coursesData,
    revenueData
  ] = await Promise.all([
    supabase.from('jobs').select('id, status, created_at, posted_date, filled_date, openings, filled'),
    supabase.from('candidates').select('id, availability_status, created_at, desired_rate_min, rating'),
    supabase.from('placements').select('id, status, start_date, bill_rate, pay_rate, margin'),
    supabase.from('blog_posts').select('id, status, view_count, published_at'),
    supabase.from('resources').select('id, status, download_count, view_count'),
    supabase.from('banners').select('id, status, impression_count, click_count, ctr'),
    supabase.from('learning_paths').select('id, status, estimated_hours'),
    supabase.from('daily_metrics').select('*').gte('metric_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  ]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Comprehensive insights across all business operations
        </p>
      </div>
      <AnalyticsDashboard
        jobsData={jobsData.data || []}
        candidatesData={candidatesData.data || []}
        placementsData={placementsData.data || []}
        blogData={blogData.data || []}
        resourcesData={resourcesData.data || []}
        bannersData={bannersData.data || []}
        coursesData={coursesData.data || []}
        revenueData={revenueData.data || []}
      />
    </div>
  );
}
