import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/admin/auth/AdminLoginForm';

export const metadata = {
  title: 'Admin Login | InTime eSolutions',
  description: 'Sign in to the admin portal',
};

export default async function AdminLoginPage() {
  const supabase = await createClient();
  
  // If already authenticated, check if admin
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role === 'admin') {
      // Already logged in as admin, redirect to dashboard
      redirect('/admin');
    } else {
      // Logged in but not admin, redirect to appropriate portal
      const roleRedirects: Record<string, string> = {
        student: '/academy',
        recruiter: '/employee/dashboard',
        sales: '/employee/dashboard',
        account_manager: '/employee/dashboard',
        operations: '/employee/dashboard',
        employee: '/employee/dashboard',
      };
      
      redirect(roleRedirects[profile?.role || 'student'] || '/');
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            InTime Admin
          </h1>
          <p className="text-purple-200">
            Administrative Portal
          </p>
        </div>
        
        {/* Login Form Card */}
        <AdminLoginForm />
        
        {/* Footer */}
        <p className="text-center text-purple-300 text-sm mt-6">
          Need access? Contact your administrator
        </p>
      </div>
    </div>
  );
}

