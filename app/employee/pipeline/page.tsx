import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PipelineBoard from '@/components/employee/pipeline/PipelineBoard';
export default async function PipelinePage() {
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
  if (!profile?.role || !['admin', 'recruiter', 'sales', 'account_manager', 'operations'].includes(profile.role)) {
    redirect('/employee/dashboard');
  }
  // Get applications with candidate and job details
  let query = supabase
    .from('applications')
    .select(`
      *,
      candidate:candidates(id, first_name, last_name, email, phone, skills, current_title, location),
      job:jobs(id, title, client_id, clients(name))
    `)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });
  // Apply filters based on role
  if (profile.role === 'recruiter') {
    query = query.eq('recruiter_id', user.id);
  }
  const { data: applications, error } = await query;
  if (error) {
    }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-trust-blue-900">
              Recruitment Pipeline
            </h1>
            <p className="text-wisdom-gray-600 mt-1">
              Drag and drop applications to update their status
            </p>
          </div>
        </div>
      </div>
      {/* Pipeline Board */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PipelineBoard 
          applications={applications || []} 
          userId={user.id}
          userRole={profile.role}
        />
      </div>
    </div>
  );
}
