import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Check if this is the academy subdomain
  const isAcademySubdomain = hostname.startsWith('academy.');
  
  // Training app routes (auth and dashboard)
  const isTrainingRoute = 
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/topics') ||
    pathname.startsWith('/assessments') ||
    pathname.startsWith('/progress') ||
    pathname.startsWith('/ai-mentor') ||
    pathname.startsWith('/setup') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin');

  // If on main domain and accessing training routes, redirect to academy subdomain
  if (!isAcademySubdomain && isTrainingRoute && hostname.includes('intimesolutions.com')) {
    const url = request.nextUrl.clone();
    url.host = `academy.${hostname}`;
    return NextResponse.redirect(url);
  }

  // If on academy subdomain and accessing marketing routes, allow it
  // (users can navigate back to main site)
  
  // Continue with Supabase auth
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

