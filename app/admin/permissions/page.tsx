import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PermissionManagement from '@/components/admin/permissions/PermissionManagement';
export default async function PermissionsPage() {
  const supabase = await createClient();
  // Check authentication and admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/employee/login');
  }
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') {
    redirect('/admin');
  }
  // Fetch users with their roles
  const { data: users } = await supabase
    .from('user_profiles')
    .select(`
      id,
      role,
      first_name,
      last_name,
      email,
      created_at
    `)
    .order('created_at', { ascending: false });
  // Fetch audit logs
  const { data: auditLogs } = await supabase
    .from('cms_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Permissions & Security
        </h1>
        <p className="text-gray-500 mt-1">
          Manage user roles, permissions, and view audit logs
        </p>
      </div>
      <PermissionManagement 
        initialUsers={users || []} 
        initialAuditLogs={auditLogs || []}
      />
    </div>
  );
}
