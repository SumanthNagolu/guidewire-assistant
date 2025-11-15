import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ClientForm from '@/components/employee/clients/ClientForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
export default async function NewClientPage() {
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/employee/clients"
              className="text-wisdom-gray-600 hover:text-trust-blue"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-bold text-trust-blue-900">
                Add New Client
              </h1>
              <p className="text-wisdom-gray-600 mt-1">
                Create a new client account
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <ClientForm userId={user.id} />
        </div>
      </div>
    </div>
  );
}
