import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, PlusCircle, Users, Key, Edit, Copy, Power } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Role Management | HR Portal',
  description: 'Manage HR roles and permissions',
};

export default async function RolesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Check permissions
  const { data: employee } = await supabase
    .from('employees')
    .select('*, hr_roles(permissions)')
    .eq('user_id', user.id)
    .single();

  if (!employee?.hr_roles?.permissions?.hr && !employee?.hr_roles?.permissions?.admin) {
    redirect('/hr/dashboard');
  }

  // Fetch all roles
  const { data: roles } = await supabase
    .from('hr_roles')
    .select('*')
    .order('name');

  // Get user count for each role
  const rolesWithCount = await Promise.all(
    (roles || []).map(async (role) => {
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', role.id)
        .eq('employment_status', 'Active');

      // Count permissions
      const permissionCount = role.permissions 
        ? Object.values(role.permissions).filter(v => v === true).length 
        : 0;

      return {
        ...role,
        user_count: count || 0,
        permission_count: permissionCount,
      };
    })
  );

  const totalRoles = roles?.length || 0;
  const totalUsers = rolesWithCount.reduce((sum, r) => sum + (r.user_count || 0), 0);
  const totalPermissions = 32; // As designed in UX

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-1">
            Manage HR roles and permissions
          </p>
        </div>
        <Link href="/hr/settings/roles/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Role
          </Button>
        </Link>
      </div>

      {/* Stats Cards - TC-ROLE-002 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-3xl font-bold">{totalRoles}</p>
              </div>
              <Shield className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Permissions</p>
                <p className="text-3xl font-bold">{totalPermissions}</p>
              </div>
              <Key className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar - TC-ROLE-004 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Roles</CardTitle>
            <div className="w-64">
              <Input
                type="search"
                placeholder="Search roles..."
                className="w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rolesWithCount.map((role) => (
              <div
                key={role.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {role.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Code: {role.code}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Users</p>
                        <p className="text-sm font-medium flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {role.user_count}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Permissions</p>
                        <p className="text-sm font-medium flex items-center">
                          <Key className="h-3 w-3 mr-1" />
                          {role.permission_count} / {totalPermissions}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <Badge variant={role.is_active ? 'default' : 'secondary'}>
                          {role.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    {role.description && (
                      <p className="text-sm text-gray-600 mt-3">
                        {role.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Link href={`/hr/settings/roles/${role.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/hr/settings/roles/new?template=${role.id}`}>
                      <Button variant="outline" size="sm">
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicate
                      </Button>
                    </Link>
                    <Link href={`/hr/employees?role=${role.id}`}>
                      <Button variant="outline" size="sm">
                        <Users className="h-3 w-3 mr-1" />
                        View Users
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {rolesWithCount.length === 0 && (
              <div className="py-12 text-center">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No roles created yet</p>
                <Link href="/hr/settings/roles/new">
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create First Role
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

