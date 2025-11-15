import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!;
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/api/integrations/outlook/auth/callback';
// GET /api/integrations/outlook/auth/callback - Handle OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // user_id
    const error = searchParams.get('error');
    if (error) {
      return NextResponse.redirect(
        new URL(`/productivity?error=oauth_failed&message=${error}`, request.url)
      );
    }
    if (!code || !state) {
      return NextResponse.json({ error: 'Invalid callback parameters' }, { status: 400 });
    }
    const userId = state;
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);
    // Get user's email from Microsoft Graph
    const userInfoResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const integrationUserId = userInfoResponse.data.id;
    const email = userInfoResponse.data.mail || userInfoResponse.data.userPrincipalName;
    // Store tokens in database
    const supabase = (await createClient()) as any;
    const { error: insertError } = await supabase.from('integration_tokens').upsert(
      {
        user_id: userId,
        integration_type: 'outlook',
        access_token,
        refresh_token,
        token_expires_at: expiresAt.toISOString(),
        is_active: true,
        scopes: ['Mail.Read', 'Calendars.Read'],
        integration_user_id: integrationUserId,
        integration_metadata: {
          email,
          connected_at: new Date().toISOString(),
        },
      },
      { onConflict: 'user_id,integration_type' }
    );
    if (insertError) {
      return NextResponse.redirect(
        new URL('/productivity?error=token_save_failed', request.url)
      );
    }
    // Redirect to success page
    return NextResponse.redirect(
      new URL('/productivity?success=outlook_connected', request.url)
    );
  } catch (error: any) {
    return NextResponse.redirect(
      new URL('/productivity?error=oauth_callback_failed', request.url)
    );
  }
}
