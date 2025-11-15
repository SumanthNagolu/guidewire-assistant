import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// Microsoft Graph API OAuth configuration
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!;
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/api/integrations/outlook/auth/callback';
const SCOPES = 'Mail.Read Calendars.Read offline_access';
// GET /api/integrations/outlook/auth - Initiate OAuth flow
export async function GET(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;
    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.redirect(new URL('/employee/login', request.url));
    }
    // Build Microsoft authorization URL
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      response_mode: 'query',
      scope: SCOPES,
      state: user.id, // Pass user ID as state for callback
    });
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
    return NextResponse.redirect(authUrl);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initiate OAuth flow' }, { status: 500 });
  }
}
