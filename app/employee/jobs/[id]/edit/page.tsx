import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import JobForm from '@/components/employee/jobs/JobForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient() as any; // Type cast for CRM tables
  const { id } = await params;
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
  if (!profile?.role || !['admin', 'recruiter', 'sales'].includes(profile.role)) {
    redirect('/employee/dashboard');
  }
  // Get job
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (error || !job) {
    notFound();
  }
  // Check if user has access
  if (profile.role === 'recruiter' && job.owner_id !== user.id) {
    redirect('/employee/jobs');
  }
  // Get clients for dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .is('deleted_at', null)
    .order('name');
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/employee/jobs/${job.id}`}
              className="text-wisdom-gray-600 hover:text-trust-blue"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-bold text-trust-blue-900">
                Edit Job Requisition
              </h1>
              <p className="text-wisdom-gray-600 mt-1">
                {job.title}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <JobForm userId={user.id} clients={clients || []} job={job} />
        </div>
      </div>
    </div>
  );
}
