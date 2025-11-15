import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { platformOrchestrator } from '@/lib/integration/platform-orchestrator';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorCode = requestUrl.searchParams.get('error_code');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const origin = requestUrl.origin;
  
  // Handle email verification errors (expired links, etc.)
  if (error) {
    const params = new URLSearchParams({
      error: error || '',
      error_code: errorCode || '',
      error_description: errorDescription || '',
    });
    
    return NextResponse.redirect(`${origin}/signup/student/verify-email?${params.toString()}`);
  }
  
  if (code) {
    const supabase = await createClient();
    // Exchange code for session
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!authError && data.user) {
      // Get complete user profile with roles
      const userProfile = await platformOrchestrator.getUserCompleteProfile(data.user.id);
      
      // Create profile if it doesn't exist (for email confirmation flow)
      if (!userProfile) {
        const metadata = data.user.user_metadata;
        const userType = metadata?.user_type || metadata?.role || 'student';
        
        // Create base profile
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: metadata.first_name || metadata.full_name?.split(' ')[0] || metadata.name?.split(' ')[0] || null,
          last_name: metadata.last_name || metadata.full_name?.split(' ').slice(1).join(' ') || metadata.name?.split(' ').slice(1).join(' ') || null,
          role: userType,
          onboarding_completed: false,
        });
        
        // Redirect to student profile setup for students
        if (userType === 'student') {
          return NextResponse.redirect(`${origin}/student-profile-setup`);
        }
        
        return NextResponse.redirect(`${origin}/profile-setup`);
      }
      
      // If profile exists but onboarding not completed
      const profile = userProfile as any;
      if (!profile.onboarding_completed) {
        // Check user metadata to determine if they're a student
        const userType = data.user.user_metadata?.user_type || data.user.user_metadata?.role || profile.role;
        
        // Students always go to student-profile-setup after email confirmation
        if (userType === 'student' || profile.role === 'student') {
          return NextResponse.redirect(`${origin}/student-profile-setup`);
        }
        // Other roles use the old profile setup
        return NextResponse.redirect(`${origin}/profile-setup`);
      }
      
      // Route based on user's roles (unified routing)
      const roles = profile.roles || [];
      
      // CEO/Admin dashboard
      if (roles.includes('ceo') || roles.includes('admin')) {
        return NextResponse.redirect(`${origin}/admin`);
      }
      
      // Employee/HR portal
      if (roles.includes('employee') || roles.includes('hr') || roles.includes('manager')) {
        return NextResponse.redirect(`${origin}/employee/dashboard`);
      }
      
      // Recruitment platform
      if (roles.includes('recruiter') || roles.includes('sourcer') || roles.includes('screener')) {
        return NextResponse.redirect(`${origin}/platform`);
      }
      
      // Default to academy for students
      return NextResponse.redirect(`${origin}/academy`);
    }
  }
  
  // Redirect to login on error
  return NextResponse.redirect(`${origin}/login`);
}
