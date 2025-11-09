import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CandidatesTable from '@/components/employee/candidates/CandidatesTable';
import CandidatesFilters from '@/components/employee/candidates/CandidatesFilters';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

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
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'recruiter', 'sales', 'account_manager', 'operations'].includes(profile.role)) {
    redirect('/employee/dashboard');
  }

  // Get search and filter params
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : 'all';
  const availability = typeof searchParams.availability === 'string' ? searchParams.availability : 'all';
  const workAuth = typeof searchParams.workAuth === 'string' ? searchParams.workAuth : 'all';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const perPage = 20;

  // Build query
  let query = supabase
    .from('candidates')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Apply filters based on role
  if (profile.role === 'recruiter') {
    query = query.eq('owner_id', user.id);
  }

  // Search filter
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,current_title.ilike.%${search}%`
    );
  }

  // Status filter
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  // Availability filter
  if (availability !== 'all') {
    query = query.eq('availability', availability);
  }

  // Work authorization filter
  if (workAuth !== 'all') {
    query = query.eq('work_authorization', workAuth);
  }

  // Pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  // Execute query
  const { data: candidates, count, error } = await query;

  if (error) {
    console.error('Error fetching candidates:', error);
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
                Candidates
              </h1>
              <p className="text-wisdom-gray-600 mt-1">
                Manage your candidate database
              </p>
            </div>
            <Link
              href="/employee/candidates/new"
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Candidate
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <CandidatesFilters
          initialSearch={search}
          initialStatus={status}
          initialAvailability={availability}
          initialWorkAuth={workAuth}
        />

        {/* Results Summary */}
        <div className="mb-4 text-sm text-wisdom-gray-600">
          Showing {candidates?.length || 0} of {count || 0} candidates
          {profile.role === 'recruiter' && ' (your candidates only)'}
        </div>

        {/* Candidates Table */}
        <CandidatesTable
          candidates={candidates || []}
          currentPage={page}
          totalPages={totalPages}
          userRole={profile.role}
        />
      </div>
    </div>
  );
}

