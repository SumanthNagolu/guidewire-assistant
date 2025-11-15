import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmployeeEditForm from '@/components/hr/employees/EmployeeEditForm';

export const metadata: Metadata = {
  title: 'Edit Employee | HR Portal',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEmployeePage({ params }: PageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Fetch employee
  const { data: employee } = await supabase
    .from('employees')
    .select(`
      *,
      departments(id, name),
      hr_roles(id, name),
      reporting_manager:employees!employees_reporting_manager_id_fkey(
        id, first_name, last_name
      )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (!employee) {
    redirect('/hr/employees');
  }

  // Fetch departments for dropdown
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, code')
    .eq('is_active', true)
    .order('name');

  // Fetch roles for dropdown  
  const { data: roles } = await supabase
    .from('hr_roles')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  // Fetch potential managers
  const { data: managers } = await supabase
    .from('employees')
    .select('id, first_name, last_name, employee_id, designation')
    .eq('employment_status', 'Active')
    .neq('id', resolvedParams.id) // Exclude self
    .order('first_name');

  return (
    <EmployeeEditForm 
      employee={employee}
      departments={departments || []}
      roles={roles || []}
      managers={managers || []}
    />
  );
}

