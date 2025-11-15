import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Admin authentication guard utilities
 * Use in server components and API routes to verify admin access
 */

export interface AdminAuthResult {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    role: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

/**
 * Verify user is authenticated and has admin role
 * Redirects if not authenticated or not admin
 * 
 * @returns User and profile data if admin
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/admin/login');
  }
  
  // Get user profile and verify admin role
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, role, first_name, last_name, email')
    .eq('id', user.id)
    .single();
  
  if (profileError || !profile) {
    redirect('/admin/login');
  }
  
  if (profile.role !== 'admin') {
    // Not an admin - redirect to appropriate portal
    const roleRedirects: Record<string, string> = {
      student: '/academy',
      recruiter: '/employee/dashboard',
      sales: '/employee/dashboard',
      account_manager: '/employee/dashboard',
      operations: '/employee/dashboard',
      employee: '/employee/dashboard',
    };
    
    redirect(roleRedirects[profile.role] || '/');
  }
  
  return {
    user: {
      id: user.id,
      email: user.email!,
    },
    profile,
  };
}

/**
 * Check if user is admin without redirecting
 * Use for API routes or conditional rendering
 * 
 * @returns { isAdmin: boolean, user, profile }
 */
export async function checkAdmin(): Promise<{
  isAdmin: boolean;
  user: any | null;
  profile: any | null;
}> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { isAdmin: false, user: null, profile: null };
    }
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, role, first_name, last_name, email')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.role === 'admin';
    
    return { isAdmin, user, profile };
  } catch (err) {
    return { isAdmin: false, user: null, profile: null };
  }
}

/**
 * Get current admin user data
 * Throws error if not authenticated or not admin
 * Use in API routes
 */
export async function getAdminUser(): Promise<AdminAuthResult> {
  const { isAdmin, user, profile } = await checkAdmin();
  
  if (!isAdmin || !user || !profile) {
    throw new Error('Admin access required');
  }
  
  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
  };
}

