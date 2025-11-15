import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
const DIALPAD_API_KEY = process.env.DIALPAD_API_KEY!;
const DIALPAD_API_BASE = 'https://dialpad.com/api/v2';
// POST /api/integrations/dialpad/sync - Sync call analytics from Dialpad
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { user_id, date } = body;
    // Determine target user
    const targetUserId = user_id || user.id;
    // Check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();
    const isAdmin = profile?.role === 'admin';
    if (!isAdmin && targetUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Get user's Dialpad ID (from their email or stored mapping)
    const { data: targetProfile } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('id', targetUserId)
      .single();
    if (!targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Determine date range
    const targetDate = date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(`${targetDate}T00:00:00Z`).getTime() / 1000;
    const endOfDay = new Date(`${targetDate}T23:59:59Z`).getTime() / 1000;
    // Fetch calls from Dialpad API
    const callsResponse = await axios.get(`${DIALPAD_API_BASE}/calls`, {
      headers: {
        Authorization: `Bearer ${DIALPAD_API_KEY}`,
      },
      params: {
        user_email: targetProfile.email,
        start_time: startOfDay,
        end_time: endOfDay,
        limit: 1000,
      },
    });
    const calls = callsResponse.data.items || [];
    // Calculate metrics
    let totalCalls = calls.length;
    let inboundCalls = 0;
    let outboundCalls = 0;
    let answeredCalls = 0;
    let missedCalls = 0;
    let voicemailCalls = 0;
    let totalDuration = 0;
    let callDurations: number[] = [];
    const contactCounts: { [key: string]: number } = {};
    calls.forEach((call: any) => {
      const { direction, status, duration, from_number, to_number } = call;
      // Direction
      if (direction === 'inbound') {
        inboundCalls++;
        const contact = from_number;
        contactCounts[contact] = (contactCounts[contact] || 0) + 1;
      } else {
        outboundCalls++;
        const contact = to_number;
        contactCounts[contact] = (contactCounts[contact] || 0) + 1;
      }
      // Status
      if (status === 'answered' || status === 'completed') {
        answeredCalls++;
      } else if (status === 'missed') {
        missedCalls++;
      } else if (status === 'voicemail') {
        voicemailCalls++;
      }
      // Duration
      if (duration > 0) {
        const durationMinutes = duration / 60;
        totalDuration += durationMinutes;
        callDurations.push(durationMinutes);
      }
    });
    // Calculate averages
    const avgDuration = callDurations.length > 0
      ? callDurations.reduce((a, b) => a + b, 0) / callDurations.length
      : 0;
    const longestDuration = callDurations.length > 0
      ? Math.max(...callDurations)
      : 0;
    // Top contacts
    const topContacts = Object.entries(contactCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([contact, count]) => ({ contact, count }));
    // Store in database
    const { data: analyticsData, error: insertError } = await supabase
      .from('call_analytics')
      .upsert(
        {
          user_id: targetUserId,
          date: targetDate,
          total_calls: totalCalls,
          inbound_calls: inboundCalls,
          outbound_calls: outboundCalls,
          answered_calls: answeredCalls,
          missed_calls: missedCalls,
          voicemail_calls: voicemailCalls,
          total_call_duration_minutes: Math.round(totalDuration),
          avg_call_duration_minutes: Math.round(avgDuration * 100) / 100,
          longest_call_duration_minutes: Math.round(longestDuration),
          top_contacts: topContacts,
          last_synced_at: new Date().toISOString(),
          sync_status: 'success',
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();
    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save call analytics' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      date: targetDate,
      analytics: analyticsData,
      message: 'Call analytics synced successfully',
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Dialpad authentication failed. Check API key.' },
        { status: 401 }
      );
    }
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
// GET /api/integrations/dialpad/sync - Get sync status
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
    // Get latest sync
    const { data: latestSync } = await supabase
      .from('call_analytics')
      .select('date, last_synced_at, sync_status')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    return NextResponse.json({
      connected: !!DIALPAD_API_KEY,
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
