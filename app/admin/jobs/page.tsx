import { createClient } from '@/lib/supabase/server';
import JobManagement from '@/components/admin/jobs/JobManagement';
export default async function AdminJobsPage() {
  const supabase = await createClient();
  // Fetch jobs from database
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      client:client_id(
        id,
        company_name
      ),
      owner:owner_id(
        id,
        first_name,
        last_name
      ),
      applications:applications(count)
    `)
    .order('created_at', { ascending: false });
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Jobs Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage job postings and view applications
          </p>
        </div>
      </div>
      <JobManagement initialJobs={jobs || []} />
    </div>
  );
}
