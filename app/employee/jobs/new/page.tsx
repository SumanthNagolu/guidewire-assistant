import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import JobForm from '@/components/employee/jobs/JobForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewJobPage() {
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
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'recruiter', 'sales'].includes(profile.role)) {
    redirect('/employee/dashboard');
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
              href="/employee/jobs"
              className="text-wisdom-gray-600 hover:text-trust-blue"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-bold text-trust-blue-900">
                Add New Job Requisition
              </h1>
              <p className="text-wisdom-gray-600 mt-1">
                Create a new job opening for your clients
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <JobForm userId={user.id} clients={clients || []} />
        </div>
      </div>
    </div>
  );
}

