import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import CandidateForm from '@/components/employee/candidates/CandidateForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
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
  if (!profile?.role || !['admin', 'recruiter'].includes(profile.role)) {
    redirect('/employee/dashboard');
  }
  // Get candidate
  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (error || !candidate) {
    notFound();
  }
  // Check if user has access (admins can edit all, recruiters can edit their own)
  if (profile.role === 'recruiter' && candidate.owner_id !== user.id) {
    redirect('/employee/candidates');
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/employee/candidates/${candidate.id}`}
              className="text-wisdom-gray-600 hover:text-trust-blue"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-bold text-trust-blue-900">
                Edit Candidate
              </h1>
              <p className="text-wisdom-gray-600 mt-1">
                {candidate.first_name} {candidate.last_name}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <CandidateForm userId={user.id} candidate={candidate} />
        </div>
      </div>
    </div>
  );
}
