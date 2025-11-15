'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Shield, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Permission definitions matching UX design
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

export default function NewRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true,
  });

  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    const { data } = await supabase
      .from('hr_roles')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setFormData({
        name: `${data.name} (Copy)`,
        code: `${data.code}_COPY`,
        description: data.description || '',
        is_active: true,
      });
      setPermissions(data.permissions || {});
    }
  };

  const generateCode = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 20);
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      code: formData.code || generateCode(name),
    });
  };

  const togglePermission = (code: string, permission: any) => {
    const newPermissions = { ...permissions };

    if (newPermissions[code]) {
      // Unchecking - remove permission
      delete newPermissions[code];
    } else {
      // Checking - add permission and dependencies
      newPermissions[code] = true;

      // Auto-check dependencies (TC-ROLE-009)
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

    // TC-ROLE-013: Validation
    if (!formData.name || !formData.code) {
      toast.error('Role name and code are required');
      return;
    }

    // TC-ROLE-014: No permissions validation
    if (getSelectedCount() === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    setLoading(true);

    try {
      const roleData = {
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        permissions,
        is_active: formData.is_active,
      };

      const { error } = await supabase.from('hr_roles').insert(roleData);

      if (error) {
        // TC-ROLE-012: Duplicate code
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          toast.error('Role code already exists');
          return;
        }
        throw error;
      }

      toast.success('Role created successfully!');
      router.push('/hr/settings/roles');
    } catch (error) {
      toast.error('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const totalPermissions = PERMISSION_CATEGORIES.reduce(
    (sum, cat) => sum + cat.permissions.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/hr/settings/roles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
          <p className="text-gray-600 mt-1">Define a new HR role with specific permissions</p>
        </div>
      </div>

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
                {/* TC-ROLE-007 */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Role Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Payroll Specialist, Recruiter"
                    required
                  />
                </div>

                {/* TC-ROLE-006: Auto-generate code */}
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
                  <p className="text-xs text-gray-500">
                    Auto-generated from name, or enter custom code
                  </p>
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
              </CardContent>
            </Card>

            {/* Permission Matrix - TC-ROLE-008, TC-ROLE-009 */}
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
                disabled={loading || !formData.name || !formData.code || getSelectedCount() === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Role'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Role Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Role Name</p>
                <p className="font-medium">{formData.name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Role Code</p>
                <p className="font-mono font-medium">{formData.code || 'Not set'}</p>
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
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2">
              <p>• Use clear, descriptive role names</p>
              <p>• Role codes must be unique</p>
              <p>• Start with minimum permissions</p>
              <p>• Grant additional access as needed</p>
              <p>• Some permissions auto-include dependencies</p>
            </CardContent>
          </Card>

          {/* Template Options - TC-ROLE-010 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Start Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  // Copy Employee role permissions
                  setPermissions({
                    view_team_employees: true,
                    view_team_leaves: true,
                    view_team_timesheets: true,
                    view_team_expenses: true,
                    view_team_reports: true,
                  });
                  toast.success('Copied Employee role permissions');
                }}
              >
                Copy from Employee
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  // Copy Manager role permissions
                  setPermissions({
                    view_team_employees: true,
                    view_team_leaves: true,
                    approve_team_leaves: true,
                    view_team_timesheets: true,
                    approve_team_timesheets: true,
                    view_team_expenses: true,
                    approve_team_expenses: true,
                    view_team_reports: true,
                  });
                  toast.success('Copied Manager role permissions');
                }}
              >
                Copy from Manager
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

