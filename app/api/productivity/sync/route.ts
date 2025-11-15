import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
const toNumber = (value: number | null | undefined, precision = 2) => {
  if (value === null || value === undefined) return null;
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data, timestamp } = await request.json();
    // For testing: Accept requests with test-key or from authenticated users
    const authHeader = request.headers.get('authorization');
    let userId: string;
    if (authHeader?.includes('test-key')) {
      // Testing mode - use the admin user (admin@intimesolutions.com)
      const { data: adminProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('email', 'admin@intimesolutions.com')
        .single();
      if (!adminProfile) {
        // Fallback to first user if admin not found
        const { data: profiles } = await adminClient
          .from('user_profiles')
          .select('id')
          .limit(1)
          .single();
        if (!profiles) {
          return NextResponse.json({ error: 'No user found' }, { status: 404 });
        }
        userId = profiles.id;
      } else {
        userId = adminProfile.id;
      }
    } else {
      // Normal authentication flow
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }
    // Store activity data
    if (data.activity) {
      const result = await adminClient.from('productivity_sessions').insert({
        user_id: userId,
        start_time: timestamp,
        mouse_movements: Math.round(data.activity.mouseClicks || 0), // Now tracks clicks
        keystrokes: Math.round(data.activity.keystrokes || 0),
        active_time: Math.round(data.activity.activeTime || 0),
        idle_time: Math.round(data.activity.idleTime || 0)
      });
      if (result.error) {
        } else {
        }
    }
    // Store application usage
    if (data.applications && Array.isArray(data.applications)) {
      const appRecords = data.applications.map((app: any) => ({
        user_id: userId,
        app_name: app.appName,
        window_title: app.windowTitle,
        start_time: app.startTime,
        end_time: app.endTime,
        duration: app.duration
      }));
      const result = await adminClient.from('productivity_applications').insert(appRecords);
      if (result.error) {
        } else {
        }
    }
    if (data.attendance) {
      const attendance = data.attendance;
      const attendanceDate = attendance.date || timestamp?.split('T')[0];
      if (attendanceDate) {
        const attendancePayload = {
          user_id: userId,
          date: attendanceDate,
          clock_in: attendance.clockIn ? new Date(attendance.clockIn).toISOString() : null,
          clock_out: attendance.clockOut ? new Date(attendance.clockOut).toISOString() : null,
          first_activity: attendance.firstActivity ? new Date(attendance.firstActivity).toISOString() : null,
          last_activity: attendance.lastActivity ? new Date(attendance.lastActivity).toISOString() : null,
          total_hours: toNumber((attendance.totalActiveSeconds ?? 0) / 3600),
          active_hours: toNumber((attendance.totalActiveSeconds ?? 0) / 3600),
          break_hours: toNumber((attendance.totalBreakSeconds ?? 0) / 3600),
          overtime_hours: toNumber((attendance.overtimeSeconds ?? 0) / 3600),
          updated_at: new Date().toISOString(),
        };
        const { error: attendanceError } = await adminClient
          .from('productivity_attendance')
          .upsert(attendancePayload, { onConflict: 'user_id,date' });
        if (attendanceError) {
          } else {
          }
      }
    }
    if (data.outlook || data.teams) {
      const dateFromPayload = data.outlook?.timestamp || data.teams?.timestamp || timestamp;
      const communicationsDate = dateFromPayload ? dateFromPayload.split('T')[0] : null;
      if (communicationsDate) {
        const communicationsPayload = {
          user_id: userId,
          date: communicationsDate,
          emails_sent: data.outlook?.sentToday ?? null,
          emails_received: data.outlook?.receivedToday ?? null,
          meetings_attended: data.outlook?.meetingsToday ?? data.teams?.meetingsToday ?? null,
          teams_calls: data.teams?.callsToday ?? null,
          call_duration: data.teams ? Math.round((data.teams.totalCallSeconds ?? 0) / 60) : null,
          meeting_duration: data.teams ? Math.round((data.teams.totalMeetingSeconds ?? 0) / 60) : null,
          updated_at: new Date().toISOString(),
        };
        const { error: communicationsError } = await adminClient
          .from('productivity_communications')
          .upsert(communicationsPayload, { onConflict: 'user_id,date' });
        if (communicationsError) {
          } else {
          }
      }
    }
    return NextResponse.json({
      success: true,
      message: 'Data synced successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
