import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UserDirectory from '@/components/admin/users/UserDirectory';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function AdminUsersPage() {
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

  // Fetch all users with their team information
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select(`
      id,
      full_name,
      email,
      role,
      phone,
      is_active,
      region,
      stream,
      location,
      job_title,
      created_at,
      team_id,
      teams:team_id (
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
  }

  // Fetch teams for filters
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage internal users, roles, and permissions
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </Link>
      </div>

      {/* User Directory Component */}
      <UserDirectory 
        initialUsers={users || []} 
        teams={teams || []}
      />
    </div>
  );
}

