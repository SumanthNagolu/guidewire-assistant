import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// UNIFIED MIDDLEWARE WITH ROLE-BASED ACCESS CONTROL
// ============================================================================

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const origin = request.nextUrl.origin;

  // ========================================================================
  // HANDLE EMAIL VERIFICATION ERRORS ON HOME PAGE
  // ========================================================================
  
  if (pathname === '/' && request.nextUrl.searchParams.get('error') === 'access_denied') {
    const errorCode = request.nextUrl.searchParams.get('error_code');
    
    // Redirect OTP expired errors to the verify-email page
    if (errorCode === 'otp_expired') {
      const params = new URLSearchParams({
        error: request.nextUrl.searchParams.get('error') || '',
        error_code: errorCode,
        error_description: request.nextUrl.searchParams.get('error_description') || '',
      });
      
      return NextResponse.redirect(`${origin}/signup/student/verify-email?${params.toString()}`);
    }
  }

  // ========================================================================
  // SUBDOMAIN ROUTING (Optional - for multi-tenant future)
  // ========================================================================
  
  const isAcademySubdomain = hostname.startsWith('academy.');
  const isEmployeeRoute = pathname.startsWith('/employee') || pathname.startsWith('/admin');
  const isStudentRoute = 
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/topics') ||
    pathname.startsWith('/academy');

  // Subdomain redirects (only in production)
  if (hostname.includes('intimesolutions.com')) {
    if (!isAcademySubdomain && isStudentRoute) {
      const url = request.nextUrl.clone();
      url.host = `academy.${hostname}`;
      return NextResponse.redirect(url);
    }

    if (isAcademySubdomain && isEmployeeRoute) {
      const url = request.nextUrl.clone();
      url.host = hostname.replace('academy.', '');
      return NextResponse.redirect(url);
    }
  }

  // ========================================================================
  // ROLE-BASED ACCESS CONTROL
  // ========================================================================

  // Public routes (no auth required)
  const publicRoutes = [
    '/login',
    '/signup',
    '/auth/callback',
    '/reset-password',
    '/',
    '/about',
    '/contact',
    '/services',
    '/industries',
    '/careers'
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || 
                        pathname.match(/^\/industries\/[^/]+$/) ||
                        pathname.match(/^\/services\/[^/]+$/);

  // Allow admin login page (public for authentication)
  if (pathname === '/admin/login') {
    return await updateSession(request);
  }

  if (isPublicRoute) {
    return await updateSession(request);
  }

  // API routes (auth required but no role check)
  if (pathname.startsWith('/api/')) {
    return await updateSession(request);
  }

  // Protected routes - check authentication
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // Admin routes redirect to admin login
    if (pathname.startsWith('/admin')) {
      const redirectUrl = new URL('/admin/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Other protected routes redirect to main login
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ========================================================================
  // ROLE-BASED ROUTE ACCESS
  // ========================================================================

  // Get user profile with role (simpler approach)
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = userProfile?.role || null;

  // Check role-based permissions
  // Skip role check for admin routes - handled in admin-specific block below

  // Admin: Access to admin portal
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/ceo') && pathname !== '/admin/login') {
    // Check admin role using user_profiles (simpler check)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      // Not an admin - redirect to appropriate portal based on role
      const roleRedirects: Record<string, string> = {
        student: '/academy',
        recruiter: '/employee/dashboard',
        sales: '/employee/dashboard',
        account_manager: '/employee/dashboard',
        operations: '/employee/dashboard',
        employee: '/employee/dashboard',
      };
      
      const destination = roleRedirects[profile?.role || 'student'] || '/';
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  // Employee portal: Access for recruiters, sales, operations
  if (pathname.startsWith('/employee')) {
    const employeeRoles = ['recruiter', 'sales', 'account_manager', 'operations', 'admin', 'employee'];
    if (!userRole || !employeeRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/academy', request.url));
    }
  }

  // Academy/Training: Access for students (and admins for testing)
  if (pathname.startsWith('/academy') || pathname.startsWith('/dashboard')) {
    const academyRoles = ['student', 'admin'];
    if (!userRole || !academyRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/employee/dashboard', request.url));
    }
  }

  // Continue with session update
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

