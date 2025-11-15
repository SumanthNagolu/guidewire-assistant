import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OpportunitiesBoard from '@/components/employee/opportunities/OpportunitiesBoard';
export default async function OpportunitiesPage() {
  const supabase = await createClient() as any; // Type cast for CRM tables
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
  if (!profile?.role || !['admin', 'sales', 'account_manager'].includes(profile.role)) {
    redirect('/employee/dashboard');
  }
  // Get opportunities with client details
  let query = supabase
    .from('opportunities')
    .select(`
      *,
      client:clients(id, name, industry, tier)
    `)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });
  // Apply filters based on role
  if (profile.role === 'sales') {
    query = query.eq('owner_id', user.id);
  }
  const { data: opportunities, error } = await query;
  if (error) {
    }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-trust-blue-900">
              Sales Pipeline
            </h1>
            <p className="text-wisdom-gray-600 mt-1">
              Drag and drop opportunities to update their stage
            </p>
          </div>
        </div>
      </div>
      {/* Pipeline Board */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OpportunitiesBoard 
          opportunities={opportunities || []} 
          userId={user.id}
          userRole={profile.role}
        />
      </div>
    </div>
  );
}
