import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UserCreationWizard from '@/components/admin/users/UserCreationWizard';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewUserPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch teams for the wizard
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, region, department')
    .eq('is_active', true)
    .order('name');

  // Fetch role templates
  const { data: roleTemplates } = await supabase
    .from('role_templates')
    .select('id, role_name, display_name, description')
    .order('display_name');

  // Fetch all users for manager selection
  const { data: potentialManagers } = await supabase
    .from('user_profiles')
    .select('id, full_name, email, role')
    .eq('is_active', true)
    .order('full_name');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
          <p className="text-gray-600 mt-1">
            Add a new internal user to the system
          </p>
        </div>
      </div>

      {/* Wizard Component */}
      <UserCreationWizard 
        teams={teams || []}
        roleTemplates={roleTemplates || []}
        potentialManagers={potentialManagers || []}
      />
    </div>
  );
}

