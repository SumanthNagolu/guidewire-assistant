import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!;
// POST /api/integrations/outlook/sync - Sync email analytics
export async function POST(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;
    // Verify authentication (admin or specific user)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { user_id, date } = body;
    // Determine target user
    const targetUserId = user_id || user.id;
    // Check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const isAdmin = profile?.role === 'admin';
    if (!isAdmin && targetUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Get integration tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('integration_tokens')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('integration_type', 'outlook')
      .eq('is_active', true)
      .single();
    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Outlook not connected. Please authenticate first.' },
        { status: 404 }
      );
    }
    // Check if token is expired and refresh if needed
    let accessToken = tokenData.access_token;
    const expiresAt = new Date(tokenData.token_expires_at);
    if (expiresAt <= new Date()) {
      // Token expired, refresh it
      try {
        const refreshResponse = await axios.post(
          'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: tokenData.refresh_token,
            grant_type: 'refresh_token',
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        accessToken = refreshResponse.data.access_token;
        const newRefreshToken = refreshResponse.data.refresh_token;
        const expiresIn = refreshResponse.data.expires_in;
        const newExpiresAt = new Date();
        newExpiresAt.setSeconds(newExpiresAt.getSeconds() + expiresIn);
        // Update tokens
        await supabase
          .from('integration_tokens')
          .update({
            access_token: accessToken,
            refresh_token: newRefreshToken,
            token_expires_at: newExpiresAt.toISOString(),
          })
          .eq('user_id', targetUserId)
          .eq('integration_type', 'outlook');
      } catch (refreshError: any) {
        return NextResponse.json(
          { error: 'Token refresh failed. Please reconnect Outlook.' },
          { status: 401 }
        );
      }
    }
    // Determine date range
    const targetDate = date || new Date().toISOString().split('T')[0];
    const startOfDay = `${targetDate}T00:00:00Z`;
    const endOfDay = `${targetDate}T23:59:59Z`;
    // Fetch email data from Microsoft Graph
    const emailsSentResponse = await axios.get(
      'https://graph.microsoft.com/v1.0/me/mailFolders/SentItems/messages',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          $count: true,
          $filter: `sentDateTime ge ${startOfDay} and sentDateTime le ${endOfDay}`,
          $select: 'id,subject,sentDateTime',
        },
      }
    );
    const emailsReceivedResponse = await axios.get(
      'https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          $count: true,
          $filter: `receivedDateTime ge ${startOfDay} and receivedDateTime le ${endOfDay}`,
          $select: 'id,subject,receivedDateTime,isRead',
        },
      }
    );
    // Fetch calendar events
    const calendarResponse = await axios.get(
      'https://graph.microsoft.com/v1.0/me/calendarView',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          startDateTime: startOfDay,
          endDateTime: endOfDay,
          $select: 'id,subject,start,end,isOrganizer,responseStatus',
        },
      }
    );
    // Calculate metrics
    const emailsSent = emailsSentResponse.data['@odata.count'] || emailsSentResponse.data.value.length;
    const emailsReceived = emailsReceivedResponse.data['@odata.count'] || emailsReceivedResponse.data.value.length;
    const emailsRead = emailsReceivedResponse.data.value.filter((e: any) => e.isRead).length;
    const meetings = calendarResponse.data.value || [];
    const meetingsScheduled = meetings.filter((m: any) => m.isOrganizer).length;
    const meetingsAttended = meetings.filter(
      (m: any) => m.responseStatus?.response === 'accepted'
    ).length;
    const totalMeetingMinutes = meetings.reduce((sum: number, meeting: any) => {
      const start = new Date(meeting.start.dateTime);
      const end = new Date(meeting.end.dateTime);
      return sum + (end.getTime() - start.getTime()) / 60000;
    }, 0);
    // Calculate calendar utilization (meetings / 8-hour workday)
    const calendarUtilization = Math.min(100, (totalMeetingMinutes / 480) * 100);
    // Calculate average response time (simplified - would need more complex logic)
    const avgResponseTimeHours = 4; // Placeholder - requires analyzing conversation threads
    // Store in database
    const { data: analyticsData, error: insertError } = await supabase
      .from('email_analytics')
      .upsert(
        {
          user_id: targetUserId,
          date: targetDate,
          emails_sent: emailsSent,
          emails_received: emailsReceived,
          emails_read: emailsRead,
          meetings_scheduled: meetingsScheduled,
          meetings_attended: meetingsAttended,
          total_meeting_duration_minutes: Math.round(totalMeetingMinutes),
          calendar_utilization_percent: Math.round(calendarUtilization * 100) / 100,
          avg_response_time_hours: avgResponseTimeHours,
          last_synced_at: new Date().toISOString(),
          sync_status: 'success',
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();
    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save email analytics' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      date: targetDate,
      analytics: analyticsData,
      message: 'Email analytics synced successfully',
    });
  } catch (error: any) {
    // Update sync status to failed
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed. Please reconnect Outlook.' },
        { status: 401 }
      );
    }
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
// GET /api/integrations/outlook/sync - Get sync status
export async function GET(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;
    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get integration status
    const { data: tokenData } = await supabase
      .from('integration_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', 'outlook')
      .single();
    if (!tokenData) {
      return NextResponse.json({
        connected: false,
        message: 'Outlook not connected',
      });
    }
    // Get latest sync
    const { data: latestSync } = await supabase
      .from('email_analytics')
      .select('date, last_synced_at, sync_status')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    return NextResponse.json({
      connected: true,
      is_active: tokenData.is_active,
      integration_email: tokenData.integration_metadata?.email,
      last_sync: latestSync
        ? {
            date: latestSync.date,
            synced_at: latestSync.last_synced_at,
            status: latestSync.sync_status,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 });
  }
}
// DELETE /api/integrations/outlook/sync - Disconnect Outlook
export async function DELETE(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;
    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Deactivate integration
    const { error } = await supabase
      .from('integration_tokens')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('integration_type', 'outlook');
    if (error) {
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: 'Outlook disconnected successfully',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
