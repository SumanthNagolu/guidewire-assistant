'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Trash2, Users } from 'lucide-react';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DepartmentEditFormProps {
  department: any;
  employeeCount: number;
}

export default function DepartmentEditForm({ department, employeeCount }: DepartmentEditFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: department.name || '',
    code: department.code || '',
    description: department.description || '',
    parent_id: department.parent_id || '',
    manager_id: department.manager_id || '',
    is_active: department.is_active ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    loadDepartments();
    loadManagers();
  }, []);

  const loadDepartments = async () => {
    const { data } = await supabase
      .from('departments')
      .select('id, name, code')
      .eq('is_active', true)
      .neq('id', department.id) // Exclude current department
      .order('name');
    
    if (data) setDepartments(data);
  };

  const loadManagers = async () => {
    const { data } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_id, designation')
      .eq('employment_status', 'Active')
      .order('first_name');
    
    if (data) setManagers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('departments')
        .update({
          name: formData.name,
          code: formData.code,
          description: formData.description || null,
          parent_id: formData.parent_id || null,
          manager_id: formData.manager_id || null,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', department.id);

      if (error) throw error;

      toast.success('Department updated successfully!');
      router.push('/hr/settings/departments');
    } catch (error) {
            toast.error('Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (employeeCount > 0) {
      toast.error(`Cannot delete department with ${employeeCount} active employees`);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', department.id);

      if (error) throw error;

      toast.success('Department deleted successfully!');
      router.push('/hr/settings/departments');
    } catch (error) {
            toast.error('Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/hr/settings/departments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Department</h1>
            <p className="text-gray-600 mt-1">{department.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Department Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Department Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Department Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    maxLength={10}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Parent Department */}
                <div className="space-y-2">
                  <Label>Parent Department</Label>
                  <Select
                    value={formData.parent_id}
                    onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Root Department)</SelectItem>
                      {departments.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Manager */}
                <div className="space-y-2">
                  <Label>Department Manager</Label>
                  <Select
                    value={formData.manager_id}
                    onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {managers.map((mgr: any) => (
                        <SelectItem key={mgr.id} value={mgr.id}>
                          {mgr.first_name} {mgr.last_name} - {mgr.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="active" className="font-normal cursor-pointer">
                    Department is active
                  </Label>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={employeeCount > 0 || loading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Department
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Department?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          department "{department.name}".
                          {employeeCount > 0 && (
                            <p className="text-red-600 mt-2">
                              Cannot delete: {employeeCount} active employees in this department.
                              Please reassign employees first.
                            </p>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={employeeCount > 0}
                          className="bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <div className="flex space-x-3">
                    <Link href="/hr/settings/departments">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Department Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  {employeeCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Department Code</p>
                <p className="text-sm font-mono font-medium">{department.code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm">
                  {new Date(department.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm">
                  {new Date(department.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {employeeCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/hr/employees?department=${department.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    View All Employees
                  </Button>
                </Link>
                <Link href={`/hr/reports/analytics?department=${department.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    View Department Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Deleting a department</strong> requires reassigning all employees first.
              </p>
              <p>
                <strong>Changing the manager</strong> will notify both the old and new managers.
              </p>
              <p>
                <strong>Deactivating</strong> prevents new employees from being assigned.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

