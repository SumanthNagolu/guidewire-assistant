'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Shield, Trash2, AlertTriangle, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Permission definitions (same as create page)
const PERMISSION_CATEGORIES = [
  {
    name: 'Employee Management',
    permissions: [
      { code: 'view_all_employees', label: 'View All Employees', description: 'Access all employee records' },
      { code: 'view_team_employees', label: 'View Team Employees', description: 'Access direct reports only' },
      { code: 'create_employee', label: 'Create Employee', description: 'Add new employees', requires: ['view_all_employees'] },
      { code: 'edit_employee', label: 'Edit Employee', description: 'Modify employee records', requires: ['view_all_employees'] },
      { code: 'delete_employee', label: 'Delete Employee', description: 'Remove employees', requires: ['edit_employee'] },
      { code: 'approve_profile_changes', label: 'Approve Profile Changes', description: 'Approve employee updates' },
    ],
  },
  {
    name: 'Leave Management',
    permissions: [
      { code: 'view_team_leaves', label: 'View Team Leaves', description: 'See team leave requests' },
      { code: 'view_all_leaves', label: 'View All Leaves', description: 'See all company leaves' },
      { code: 'approve_team_leaves', label: 'Approve Team Leaves', description: 'Approve direct reports', requires: ['view_team_leaves'] },
      { code: 'approve_all_leaves', label: 'Approve All Leaves', description: 'Final HR approval', requires: ['view_all_leaves'] },
      { code: 'configure_leave_types', label: 'Configure Leave Types', description: 'Manage leave policies' },
      { code: 'adjust_leave_balances', label: 'Adjust Leave Balances', description: 'Modify balances' },
    ],
  },
  {
    name: 'Time & Attendance',
    permissions: [
      { code: 'view_team_timesheets', label: 'View Team Timesheets', description: 'See team timesheets' },
      { code: 'view_all_timesheets', label: 'View All Timesheets', description: 'See all timesheets' },
      { code: 'approve_team_timesheets', label: 'Approve Team Timesheets', description: 'Approve team hours', requires: ['view_team_timesheets'] },
      { code: 'approve_all_timesheets', label: 'Approve All Timesheets', description: 'Final approval', requires: ['view_all_timesheets'] },
      { code: 'configure_shifts', label: 'Configure Shifts', description: 'Manage work shifts' },
    ],
  },
  {
    name: 'Expense Management',
    permissions: [
      { code: 'view_team_expenses', label: 'View Team Expenses', description: 'See team claims' },
      { code: 'view_all_expenses', label: 'View All Expenses', description: 'See all claims' },
      { code: 'approve_team_expenses', label: 'Approve Team Expenses', description: 'Approve team claims', requires: ['view_team_expenses'] },
      { code: 'approve_all_expenses', label: 'Approve All Expenses', description: 'Final approval', requires: ['view_all_expenses'] },
      { code: 'process_expense_payments', label: 'Process Payments', description: 'Mark expenses as paid' },
    ],
  },
  {
    name: 'Payroll',
    permissions: [
      { code: 'view_payroll', label: 'View Payroll', description: 'Access payroll data' },
      { code: 'process_payroll', label: 'Process Payroll', description: 'Run payroll', requires: ['view_payroll'] },
      { code: 'generate_pay_stubs', label: 'Generate Pay Stubs', description: 'Create pay stubs', requires: ['view_payroll'] },
    ],
  },
  {
    name: 'Reports & Analytics',
    permissions: [
      { code: 'view_team_reports', label: 'View Team Reports', description: 'Team analytics' },
      { code: 'view_all_reports', label: 'View All Reports', description: 'Company-wide reports' },
      { code: 'export_reports', label: 'Export Reports', description: 'Download reports' },
    ],
  },
  {
    name: 'Administration',
    permissions: [
      { code: 'manage_departments', label: 'Manage Departments', description: 'CRUD departments' },
      { code: 'manage_roles', label: 'Manage Roles', description: 'CRUD roles' },
      { code: 'system_config', label: 'System Configuration', description: 'Configure system' },
      { code: 'view_audit_log', label: 'View Audit Log', description: 'Access audit trail' },
    ],
  },
];

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<any>(null);
  const [userCount, setUserCount] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true,
  });
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  useEffect(() => {
    loadRole();
  }, [roleId]);

  const loadRole = async () => {
    setLoading(true);
    try {
      // Load role data
      const { data: roleData, error: roleError } = await supabase
        .from('hr_roles')
        .select('*')
        .eq('id', roleId)
        .single();

      if (roleError) throw roleError;

      setRole(roleData);
      setFormData({
        name: roleData.name,
        code: roleData.code,
        description: roleData.description || '',
        is_active: roleData.is_active,
      });
      setPermissions(roleData.permissions || {});

      // Load user count
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', roleId)
        .eq('employment_status', 'Active');

      setUserCount(count || 0);
    } catch (error) {
      toast.error('Failed to load role');
      router.push('/hr/settings/roles');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (code: string, permission: any) => {
    const newPermissions = { ...permissions };

    if (newPermissions[code]) {
      // Unchecking - remove permission
      delete newPermissions[code];
    } else {
      // Checking - add permission and dependencies
      newPermissions[code] = true;

      // Auto-check dependencies
      if (permission.requires) {
        permission.requires.forEach((req: string) => {
          newPermissions[req] = true;
        });
      }
    }

    setPermissions(newPermissions);
  };

  const getSelectedCount = () => {
    return Object.values(permissions).filter(v => v === true).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.code) {
      toast.error('Role name and code are required');
      return;
    }

    if (getSelectedCount() === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    // TC-ROLE-021: Warning if role in use and permissions removed
    const originalPermissionCount = Object.values(role.permissions || {}).filter(v => v === true).length;
    const newPermissionCount = getSelectedCount();
    
    if (userCount > 0 && newPermissionCount < originalPermissionCount) {
      if (!confirm(`Warning: ${userCount} employee(s) will have reduced permissions. Continue?`)) {
        return;
      }
    }

    setSaving(true);

    try {
      const roleData = {
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        permissions,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('hr_roles')
        .update(roleData)
        .eq('id', roleId);

      if (error) {
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          toast.error('Role code already exists');
          return;
        }
        throw error;
      }

      // TC-ROLE-020: Create audit log entry
      await supabase.from('audit_logs').insert({
        action: 'role_updated',
        entity_type: 'hr_role',
        entity_id: roleId,
        changes: {
          old: role,
          new: roleData,
        },
      });

      toast.success('Role updated successfully!');
      router.push('/hr/settings/roles');
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // TC-ROLE-024: Cannot delete role in use
    if (userCount > 0) {
      toast.error(`Cannot delete role with ${userCount} active user(s). Please reassign users first.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('hr_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Role deleted successfully');
      router.push('/hr/settings/roles');
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  const handleDeactivate = async () => {
    try {
      const { error } = await supabase
        .from('hr_roles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Role deactivated successfully');
      setFormData({ ...formData, is_active: false });
      setShowDeactivateDialog(false);
    } catch (error) {
      toast.error('Failed to deactivate role');
    }
  };

  const totalPermissions = PERMISSION_CATEGORIES.reduce(
    (sum, cat) => sum + cat.permissions.length,
    0
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/hr/settings/roles">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
            <p className="text-gray-600 mt-1">
              Last updated: {role?.updated_at ? new Date(role.updated_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Delete Button - TC-ROLE-022 */}
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          disabled={userCount > 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Role
        </Button>
      </div>

      {/* Warning if role in use - TC-ROLE-021 */}
      {userCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">
                  This role is currently assigned to {userCount} employee(s)
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Changes to permissions will affect all users with this role immediately.
                  To delete this role, you must first reassign all users.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Role Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Payroll Specialist, Recruiter"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">
                    Role Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., PAYROLL_SPEC"
                    maxLength={20}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this role's responsibilities"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {formData.description.length}/500
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="active" className="font-normal cursor-pointer">
                      Role is active
                    </Label>
                  </div>

                  {/* TC-ROLE-025: Deactivate button */}
                  {formData.is_active && userCount > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeactivateDialog(true)}
                    >
                      Deactivate Role
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permission Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Select permissions for this role ({getSelectedCount()}/{totalPermissions} selected)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {PERMISSION_CATEGORIES.map((category) => (
                  <div key={category.name} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-3">{category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.permissions.map((perm) => (
                        <div
                          key={perm.code}
                          className={`flex items-start space-x-3 p-3 rounded-lg border ${
                            permissions[perm.code]
                              ? 'bg-indigo-50 border-indigo-200'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          } transition-colors cursor-pointer`}
                          onClick={() => togglePermission(perm.code, perm)}
                        >
                          <input
                            type="checkbox"
                            checked={permissions[perm.code] || false}
                            onChange={(e) => {
                              e.stopPropagation();
                              togglePermission(perm.code, perm);
                            }}
                            className="mt-1 rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {perm.label}
                            </p>
                            <p className="text-xs text-gray-500">{perm.description}</p>
                            {perm.requires && permissions[perm.code] && (
                              <p className="text-xs text-indigo-600 mt-1">
                                ✓ Includes: {perm.requires.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <Link href="/hr/settings/roles">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving || !formData.name || !formData.code || getSelectedCount() === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* User Impact Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Employees with this role</p>
                <p className="text-2xl font-bold text-indigo-600">{userCount}</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500">Permissions Selected</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {getSelectedCount()} / {totalPermissions}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium">
                  {formData.is_active ? '✓ Active' : '○ Inactive'}
                </p>
              </div>
              {userCount > 0 && (
                <div className="border-t pt-3">
                  <Link href={`/hr/employees?role=${roleId}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Users className="h-3 w-3 mr-2" />
                      View All Users
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Change Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2">
              <p>• Changes take effect immediately</p>
              <p>• All users must refresh to see updates</p>
              <p>• Changes are logged in audit trail</p>
              {userCount > 0 && (
                <p className="text-amber-600 font-semibold">
                  • {userCount} employee(s) will be affected
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog - TC-ROLE-022, TC-ROLE-023 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            <AlertDialogDescription>
              {userCount > 0 ? (
                <>
                  <strong>Cannot delete this role.</strong>
                  <br />
                  This role is currently assigned to {userCount} employee(s).
                  Please reassign all users before deleting.
                </>
              ) : (
                <>
                  This action cannot be undone. The role &quot;{formData.name}&quot; will be permanently deleted.
                  <br />
                  <br />
                  <strong>Affected: 0 employees</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {userCount === 0 && (
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Role
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Confirmation Dialog - TC-ROLE-025 */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Users will keep this role but it will be marked as inactive.
              New employees cannot be assigned this role until it&apos;s reactivated.
              <br />
              <br />
              <strong>{userCount} employee(s) will be affected</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

