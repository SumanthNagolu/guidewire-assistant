import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DepartmentEditForm from '@/components/hr/settings/DepartmentEditForm';

export const metadata: Metadata = {
  title: 'Edit Department | HR Portal',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditDepartmentPage({ params }: PageProps) {
  const { id } = await params;
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

  // Fetch department details
  const { data: department } = await supabase
    .from('departments')
    .select(`
      *,
      manager:manager_id (
        id,
        first_name,
        last_name,
        employee_id
      ),
      parent:parent_id (
        id,
        name,
        code
      )
    `)
    .eq('id', id)
    .single();

  if (!department) {
    redirect('/hr/settings/departments');
  }

  // Get employee count
  const { count: employeeCount } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('department_id', id)
    .eq('employment_status', 'Active');

  return (
    <DepartmentEditForm 
      department={department} 
      employeeCount={employeeCount || 0}
    />
  );
}

