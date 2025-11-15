import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, PlusCircle, Users, UserCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Department Management | HR Portal',
  description: 'Manage company departments and organizational structure',
};

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  manager_id: string;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  manager?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
  employee_count?: number;
}

export default async function DepartmentsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Check if user has HR/Admin permissions
  const { data: employee } = await supabase
    .from('employees')
    .select('*, hr_roles(name, permissions)')
    .eq('user_id', user.id)
    .single();

  const hasPermission = employee?.hr_roles?.permissions?.hr || employee?.hr_roles?.permissions?.admin;

  if (!hasPermission) {
    redirect('/hr/dashboard');
  }

  // Fetch all departments with employee count
  const { data: departments } = await supabase
    .from('departments')
    .select(`
      *,
      manager:manager_id (
        first_name,
        last_name,
        employee_id
      )
    `)
    .order('name', { ascending: true });

  // Get employee count for each department
  const departmentsWithCount = await Promise.all(
    (departments || []).map(async (dept) => {
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', dept.id)
        .eq('employment_status', 'Active');

      return {
        ...dept,
        employee_count: count || 0,
      };
    })
  );

  // Organize into hierarchy
  const rootDepartments = departmentsWithCount.filter(d => !d.parent_id);
  const childDepartments = departmentsWithCount.filter(d => d.parent_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600 mt-1">
            Manage organizational structure and departments
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/hr/settings/departments/org-chart">
            <Button variant="outline">
              <Building2 className="h-4 w-4 mr-2" />
              View Org Chart
            </Button>
          </Link>
          <Link href="/hr/settings/departments/new">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold">{departments?.length || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold">
                  {departmentsWithCount.reduce((sum, d) => sum + (d.employee_count || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Root Departments</p>
                <p className="text-2xl font-bold">{rootDepartments.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sub-Departments</p>
                <p className="text-2xl font-bold">{childDepartments.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rootDepartments.map((department) => (
              <div key={department.id}>
                {/* Parent Department */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {department.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Code: {department.code}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Manager</p>
                          <p className="text-sm font-medium">
                            {department.manager
                              ? `${department.manager.first_name} ${department.manager.last_name}`
                              : 'Not assigned'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Employees</p>
                          <p className="text-sm font-medium flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {department.employee_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              department.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {department.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {department.description && (
                        <p className="text-sm text-gray-600 mt-3">
                          {department.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Link href={`/hr/settings/departments/${department.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/hr/employees?department=${department.id}`}>
                        <Button variant="outline" size="sm">
                          <Users className="h-3 w-3 mr-1" />
                          View Team
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Child Departments */}
                {childDepartments
                  .filter(child => child.parent_id === department.id)
                  .map((child) => (
                    <div
                      key={child.id}
                      className="ml-12 mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="text-md font-semibold text-gray-900">
                                {child.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {child.code} • {child.employee_count} employees
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/hr/settings/departments/${child.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {departments && departments.length === 0 && (
            <div className="py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No departments created yet</p>
              <Link href="/hr/settings/departments/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Department
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

