import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import EmployeesTable from '@/components/hr/employees/EmployeesTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download, Upload } from 'lucide-react';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'Employees | HR Portal',
  description: 'Manage employee records and information',
};
export default async function EmployeesPage() {
  const supabase = await createClient();
  // Fetch all employees with their departments and roles
  const { data: employees } = await supabase
    .from('employees')
    .select(`
      *,
      departments(name),
      hr_roles(name),
      reporting_manager:employees!employees_reporting_manager_id_fkey(first_name, last_name)
    `)
    .order('first_name', { ascending: true });
  // Get department list for filters
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .eq('is_active', true)
    .order('name');
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage employee records and information</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/hr/employees/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Link>
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-2xl font-bold">{employees?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {employees?.filter(e => e.employment_status === 'Active').length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">On Leave</p>
          <p className="text-2xl font-bold text-orange-600">
            {employees?.filter(e => e.employment_status === 'On Leave').length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Departments</p>
          <p className="text-2xl font-bold">{departments?.length || 0}</p>
        </div>
      </div>
      {/* Employees Table */}
      <EmployeesTable 
        employees={employees || []} 
        departments={departments || []}
      />
    </div>
  );
}
