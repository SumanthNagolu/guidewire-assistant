import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import JobsTable from '@/components/employee/jobs/JobsTable';
import JobsFilters from '@/components/employee/jobs/JobsFilters';
import Link from 'next/link';
import { Plus } from 'lucide-react';
export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient() as any; // Type cast for CRM tables
  const params = await searchParams;
  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/employee/login');
  }
  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile?.role || !['admin', 'recruiter', 'sales', 'account_manager', 'operations'].includes(profile.role)) {
    redirect('/employee/dashboard');
  }
  // Get search and filter params
  const search = typeof params.search === 'string' ? params.search : '';
  const status = typeof params.status === 'string' ? params.status : 'all';
  const priority = typeof params.priority === 'string' ? params.priority : 'all';
  const employmentType = typeof params.employmentType === 'string' ? params.employmentType : 'all';
  const remotePolicy = typeof params.remotePolicy === 'string' ? params.remotePolicy : 'all';
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const perPage = 20;
  // Build query
  let query = supabase
    .from('jobs')
    .select(`
      *,
      client:clients(id, name),
      client_contact:contacts(id, first_name, last_name, email)
    `, { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  // Apply filters based on role
  if (profile.role === 'recruiter') {
    query = query.eq('owner_id', user.id);
  }
  // Search filter
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`
    );
  }
  // Status filter
  if (status !== 'all') {
    query = query.eq('status', status);
  }
  // Priority filter
  if (priority !== 'all') {
    query = query.eq('priority', priority);
  }
  // Employment type filter
  if (employmentType !== 'all') {
    query = query.eq('employment_type', employmentType);
  }
  // Remote policy filter
  if (remotePolicy !== 'all') {
    query = query.eq('remote_policy', remotePolicy);
  }
  // Pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);
  // Execute query
  const { data: jobs, count, error } = await query;
  if (error) {
    }
  const totalPages = count ? Math.ceil(count / perPage) : 0;
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-trust-blue-900">
                Job Requisitions
              </h1>
              <p className="text-wisdom-gray-600 mt-1">
                Manage your open positions and job requisitions
              </p>
            </div>
            <Link
              href="/employee/jobs/new"
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Job
            </Link>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <JobsFilters
          initialSearch={search}
          initialStatus={status}
          initialPriority={priority}
          initialEmploymentType={employmentType}
          initialRemotePolicy={remotePolicy}
        />
        {/* Results Summary */}
        <div className="mb-4 text-sm text-wisdom-gray-600">
          Showing {jobs?.length || 0} of {count || 0} jobs
          {profile.role === 'recruiter' && ' (your jobs only)'}
        </div>
        {/* Jobs Table */}
        <JobsTable
          jobs={jobs || []}
          currentPage={page}
          totalPages={totalPages}
          userRole={profile.role}
        />
      </div>
    </div>
  );
}
