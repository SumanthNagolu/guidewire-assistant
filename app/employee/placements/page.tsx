import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PlacementsTable from '@/components/employee/placements/PlacementsTable';
import PlacementsFilters from '@/components/employee/placements/PlacementsFilters';
import Link from 'next/link';
import { Plus, AlertCircle } from 'lucide-react';

export default async function PlacementsPage({
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

  if (!profile || !['admin', 'recruiter', 'account_manager', 'operations'].includes(profile.role)) {
    redirect('/employee/dashboard');
  }

  // Get search and filter params
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : 'all';
  const endingSoon = typeof searchParams.endingSoon === 'string' ? searchParams.endingSoon === 'true' : false;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const perPage = 20;

  // Build query
  let query = supabase
    .from('placements')
    .select(`
      *,
      candidate:candidates(id, first_name, last_name, email),
      job:jobs(id, title, clients(name)),
      recruiter:user_profiles!placements_recruiter_id_fkey(id, full_name)
    `, { count: 'exact' })
    .is('deleted_at', null)
    .order('start_date', { ascending: false });

  // Search filter
  if (search) {
    query = query.or(
      `candidate.first_name.ilike.%${search}%,candidate.last_name.ilike.%${search}%`
    );
  }

  // Status filter
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  // Ending soon filter (within 30 days)
  if (endingSoon) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    query = query
      .eq('status', 'active')
      .lte('end_date', thirtyDaysFromNow.toISOString());
  }

  // Pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  // Execute query
  const { data: placements, count, error } = await query;

  if (error) {
    console.error('Error fetching placements:', error);
  }

  // Get alert counts
  const { data: endingSoonCount } = await supabase
    .from('placements')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .lte('end_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

  const totalPages = count ? Math.ceil(count / perPage) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-trust-blue-900">
                Placements
              </h1>
              <p className="text-wisdom-gray-600 mt-1">
                Track active placements and contract timelines
              </p>
            </div>
            <Link
              href="/employee/placements/new"
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Placement
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {endingSoonCount && endingSoonCount > 0 && !endingSoon && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/employee/placements?endingSoon=true"
            className="flex items-center gap-3 p-4 bg-innovation-orange-50 border-l-4 border-innovation-orange rounded-lg hover:bg-innovation-orange-100 transition-colors"
          >
            <AlertCircle className="w-6 h-6 text-innovation-orange" />
            <div>
              <p className="font-semibold text-innovation-orange-900">
                {endingSoonCount} placements ending within 30 days
              </p>
              <p className="text-sm text-innovation-orange-700">
                Click to review and take action
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <PlacementsFilters
          initialSearch={search}
          initialStatus={status}
          initialEndingSoon={endingSoon}
        />

        {/* Results Summary */}
        <div className="mb-4 text-sm text-wisdom-gray-600">
          Showing {placements?.length || 0} of {count || 0} placements
        </div>

        {/* Placements Table */}
        <PlacementsTable
          placements={placements || []}
          currentPage={page}
          totalPages={totalPages}
          userRole={profile.role}
        />
      </div>
    </div>
  );
}

