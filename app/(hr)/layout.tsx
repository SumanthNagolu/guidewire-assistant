import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import HRSidebar from '@/components/hr/layout/HRSidebar';
import HRHeader from '@/components/hr/layout/HRHeader';
export default async function HRLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Redirect to login if not authenticated
  if (!user) {
    redirect('/hr/login');
  }
  // Get employee details for the logged-in user
  const { data: employee } = await supabase
    .from('employees')
    .select('*, hr_roles(name, permissions)')
    .eq('user_id', user.id)
    .single();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main layout container */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <HRSidebar employee={employee} />
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <HRHeader employee={employee} />
          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
