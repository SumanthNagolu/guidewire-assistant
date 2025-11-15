'use client';

import { useState } from 'react';
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
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function NewDepartmentPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parent_id: '',
    manager_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);

  // Load dropdown data
  React.useEffect(() => {
    loadDepartments();
    loadManagers();
  }, []);

  const loadDepartments = async () => {
    const { data } = await supabase
      .from('departments')
      .select('id, name, code')
      .eq('is_active', true)
      .order('name');
    
    if (data) setDepartments(data);
  };

  const loadManagers = async () => {
    const { data } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_id, designation')
      .eq('employment_status', 'Active')
      .or('role_id.eq.role-002,role_id.eq.role-001') // Managers and HR
      .order('first_name');
    
    if (data) setManagers(data);
  };

  const generateCode = (name: string) => {
    // Auto-generate department code from name
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      code: formData.code || generateCode(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const departmentData = {
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        parent_id: formData.parent_id || null,
        manager_id: formData.manager_id || null,
        is_active: true,
      };

      const { error } = await supabase
        .from('departments')
        .insert(departmentData);

      if (error) throw error;

      toast.success('Department created successfully!');
      router.push('/hr/settings/departments');
    } catch (error) {
      toast.error('Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/hr/settings/departments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Department</h1>
          <p className="text-gray-600 mt-1">Create a new department in your organization</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Department Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Department Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Department Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Engineering, Sales, Marketing"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              {/* Department Code */}
              <div className="space-y-2">
                <Label htmlFor="code">
                  Department Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="e.g., ENG, SALES, MKTG"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  maxLength={10}
                  required
                />
                <p className="text-xs text-gray-500">
                  Unique code for the department (max 10 characters)
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the department's role and responsibilities"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Parent Department */}
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Department (Optional)</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Root Department)" />
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
                <p className="text-xs text-gray-500">
                  Select a parent if this is a sub-department
                </p>
              </div>

              {/* Department Manager */}
              <div className="space-y-2">
                <Label htmlFor="manager">Department Manager</Label>
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
                        {mgr.first_name} {mgr.last_name} ({mgr.employee_id}) - {mgr.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Link href="/hr/settings/departments">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading || !formData.name || !formData.code}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Department'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Help Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Tips for Creating Departments</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Department Code:</strong> Use short, memorable codes (e.g., ENG for Engineering)
            </p>
            <p>
              <strong>Hierarchy:</strong> Create root departments first, then add sub-departments
            </p>
            <p>
              <strong>Manager Assignment:</strong> Assign managers with leadership roles
            </p>
            <p>
              <strong>Best Practice:</strong> Keep department structure flat when possible
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

