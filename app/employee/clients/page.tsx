import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ClientsTable from '@/components/employee/clients/ClientsTable';
import ClientsFilters from '@/components/employee/clients/ClientsFilters';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function ClientsPage({
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

  if (!profile || !['admin', 'recruiter', 'sales', 'account_manager'].includes(profile.role)) {
    redirect('/employee/dashboard');
  }

  // Get search and filter params
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : 'all';
  const tier = typeof searchParams.tier === 'string' ? searchParams.tier : 'all';
  const industry = typeof searchParams.industry === 'string' ? searchParams.industry : 'all';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const perPage = 20;

  // Build query
  let query = supabase
    .from('clients')
    .select('*, contacts(count)', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Search filter
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,industry.ilike.%${search}%,website.ilike.%${search}%`
    );
  }

  // Status filter
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  // Tier filter
  if (tier !== 'all') {
    query = query.eq('tier', tier);
  }

  // Industry filter
  if (industry !== 'all') {
    query = query.eq('industry', industry);
  }

  // Pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  // Execute query
  const { data: clients, count, error } = await query;

  if (error) {
    console.error('Error fetching clients:', error);
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
                Clients
              </h1>
              <p className="text-wisdom-gray-600 mt-1">
                Manage your client relationships and accounts
              </p>
            </div>
            <Link
              href="/employee/clients/new"
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Client
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <ClientsFilters
          initialSearch={search}
          initialStatus={status}
          initialTier={tier}
          initialIndustry={industry}
        />

        {/* Results Summary */}
        <div className="mb-4 text-sm text-wisdom-gray-600">
          Showing {clients?.length || 0} of {count || 0} clients
        </div>

        {/* Clients Table */}
        <ClientsTable
          clients={clients || []}
          currentPage={page}
          totalPages={totalPages}
          userRole={profile.role}
        />
      </div>
    </div>
  );
}

