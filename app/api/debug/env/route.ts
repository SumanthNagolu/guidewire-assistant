/**
 * Environment Variables Debug Endpoint
 * 
 * SECURITY NOTE: This endpoint should be REMOVED or PROTECTED in production!
 * Use only for debugging deployment issues.
 * 
 * Returns sanitized info about critical environment variables
 */

import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check auth (optional - uncomment to require admin access)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized - login required' },
        { status: 401 }
      );
    }

    // Check critical environment variables (DO NOT expose actual values!)
    const envStatus = {
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        prefix: process.env.OPENAI_API_KEY
          ? `${process.env.OPENAI_API_KEY.substring(0, 7)}...`
          : 'NOT SET',
      },
      anthropic: {
        configured: !!process.env.ANTHROPIC_API_KEY,
        prefix: process.env.ANTHROPIC_API_KEY
          ? `${process.env.ANTHROPIC_API_KEY.substring(0, 7)}...`
          : 'NOT SET',
      },
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      node: {
        version: process.version,
        env: process.env.NODE_ENV,
      },
    };

    return Response.json({
      success: true,
      environment: envStatus,
      timestamp: new Date().toISOString(),
      warning: 'REMOVE THIS ENDPOINT IN PRODUCTION!',
    });
  } catch (error) {
    console.error('[Debug API] Error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

