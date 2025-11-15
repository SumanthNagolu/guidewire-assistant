import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, MousePointer, Keyboard, Monitor, TrendingUp, Coffee, Mail, PhoneCall, Globe } from 'lucide-react';
const formatRelativeTime = (timestamp: Date | null, now: number) => {
  if (!timestamp) return 'No data';
  const diffMs = now - timestamp.getTime();
  if (diffMs < 60_000) return 'Just now';
  if (diffMs < 3_600_000) return `${Math.round(diffMs / 60000)} min ago`;
  return `${Math.round(diffMs / 3600000)} hr ago`;
};
const derivePresenceStatus = (minutesSince: number | null): 'Active' | 'Away' | 'Offline' => {
  if (minutesSince === null) return 'Offline';
  if (minutesSince <= 5) return 'Active';
  if (minutesSince <= 15) return 'Away';
  return 'Offline';
};
const presenceBadgeClass = (status: 'Active' | 'Away' | 'Offline') => {
  if (status === 'Active') return 'bg-green-100 text-green-700 border border-green-200';
  if (status === 'Away') return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  return 'bg-gray-200 text-gray-700 border border-gray-300';
};
const formatMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
};
export default async function ProductivityInsightsPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <div className="p-8">Please log in to view insights</div>;
  }
  const userId = user.id;
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, first_name, last_name')
    .eq('id', userId)
    .single();
  const isAdmin = profile?.role === 'admin';
  // Fetch today's productivity data
  const today = new Date().toISOString().split('T')[0];
  const { data: sessions } = await supabase
    .from('productivity_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', `${today}T00:00:00`)
    .order('start_time', { ascending: false });
  const { data: applications } = await supabase
    .from('productivity_applications')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', `${today}T00:00:00`);
  const { data: screenshots } = await supabase
    .from('productivity_screenshots')
    .select('*')
    .eq('user_id', userId)
    .gte('captured_at', `${today}T00:00:00`)
    .order('captured_at', { ascending: false });
  const screenshotsWithUrls = await Promise.all(
    (screenshots ?? []).map(async (shot) => {
      if (shot.screenshot_url?.startsWith('http')) {
        return { ...shot, display_url: shot.screenshot_url };
      }
      if (!shot.screenshot_url) {
        return { ...shot, display_url: null };
      }
      const { data: signed } = await adminClient
        .storage
        .from('productivity-screenshots')
        .createSignedUrl(shot.screenshot_url, 60 * 60);
      return {
        ...shot,
        display_url: signed?.signedUrl ?? null,
      };
    })
  );
  const now = Date.now();
  const latestSession = sessions?.[0] ?? null;
  const lastSnapshotTime = latestSession ? new Date(latestSession.start_time) : null;
  const minutesSinceLastSnapshot = lastSnapshotTime ? Math.round((now - lastSnapshotTime.getTime()) / 60000) : null;
  const presenceStatus = derivePresenceStatus(minutesSinceLastSnapshot);
  const statusBadge = presenceBadgeClass(presenceStatus);
  const currentApplication = applications && applications.length > 0 ? applications[0] : null;
  const currentApplicationDuration = currentApplication
    ? Math.max(0, Math.round((currentApplication.duration ?? 0) / 60))
    : null;
  const lastScreenshotEntry = screenshotsWithUrls && screenshotsWithUrls.length > 0 ? screenshotsWithUrls[0] : null;
  type TeamMemberStatus = {
    id: string;
    name: string;
    status: 'Active' | 'Away' | 'Offline';
    lastActive: Date | null;
    currentApp?: string | null;
    currentWindow?: string | null;
    screenshotUrl?: string | null;
  };
  let teamStatus: TeamMemberStatus[] = [];
  if (isAdmin) {
    const { data: teamMembers } = await adminClient
      .from('user_profiles')
      .select('id, first_name, last_name, email, role')
      .in('role', ['admin', 'employee', 'recruiter', 'sales', 'operations'])
      .order('first_name', { ascending: true });
    const filteredMembers = (teamMembers ?? []).filter((member) => member.id !== userId);
    teamStatus = await Promise.all(
      filteredMembers.map(async (member) => {
        const [sessionRes, appRes, screenshotRes] = await Promise.all([
          adminClient
            .from('productivity_sessions')
            .select('start_time, active_time, idle_time')
            .eq('user_id', member.id)
            .order('start_time', { ascending: false })
            .limit(1),
          adminClient
            .from('productivity_applications')
            .select('app_name, window_title, start_time, duration')
            .eq('user_id', member.id)
            .order('start_time', { ascending: false })
            .limit(1),
          adminClient
            .from('productivity_screenshots')
            .select('screenshot_url, captured_at')
            .eq('user_id', member.id)
            .order('captured_at', { ascending: false })
            .limit(1),
        ]);
        const session = sessionRes.data?.[0] ?? null;
        const app = appRes.data?.[0] ?? null;
        const screenshot = screenshotRes.data?.[0] ?? null;
        const lastActive = session ? new Date(session.start_time) : null;
        const minutesSince = lastActive ? Math.round((now - lastActive.getTime()) / 60000) : null;
        const status = derivePresenceStatus(minutesSince);
        let screenshotUrl: string | null = null;
        if (screenshot?.screenshot_url) {
          if (screenshot.screenshot_url.startsWith('http')) {
            screenshotUrl = screenshot.screenshot_url;
          } else {
            const { data: signed } = await adminClient
              .storage
              .from('productivity-screenshots')
              .createSignedUrl(screenshot.screenshot_url, 60 * 60);
            screenshotUrl = signed?.signedUrl ?? null;
          }
        }
        const name = [member.first_name, member.last_name].filter(Boolean).join(' ') || member.email;
        return {
          id: member.id,
          name,
          status,
          lastActive,
          currentApp: app?.app_name ?? null,
          currentWindow: app?.window_title ?? null,
          screenshotUrl,
        };
      })
    );
  }
  // Calculate metrics
  const totalKeystrokes = sessions?.reduce((sum, s) => sum + (s.keystrokes || 0), 0) || 0;
  const totalMouseMoves = sessions?.reduce((sum, s) => sum + (s.mouse_movements || 0), 0) || 0;
  const totalActiveTime = sessions?.reduce((sum, s) => sum + (s.active_time || 0), 0) || 0;
  const totalIdleTime = sessions?.reduce((sum, s) => sum + (s.idle_time || 0), 0) || 0;
  const activeHours = Math.floor(totalActiveTime / 3600);
  const activeMinutes = Math.floor((totalActiveTime % 3600) / 60);
  // Get top applications
  const appUsage: Record<string, number> = {};
  applications?.forEach(app => {
    if (!appUsage[app.app_name]) {
      appUsage[app.app_name] = 0;
    }
    appUsage[app.app_name] += app.duration || 0;
  });
  const topApps = totalActiveTime > 0
    ? Object.entries(appUsage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, duration]) => ({
          name,
          duration: Math.floor(duration / 60),
          percentage: Math.round((duration / totalActiveTime) * 100)
        }))
    : [];
  const { data: attendanceRows } = await supabase
    .from('productivity_attendance')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .limit(1);
  const attendance = attendanceRows?.[0] ?? null;
  const { data: communicationsRows } = await supabase
    .from('productivity_communications')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .limit(1);
  const communications = communicationsRows?.[0] ?? null;
  const { data: webActivityRows } = await supabase
    .from('productivity_web_activity')
    .select('duration, scroll_time, category')
    .eq('user_id', userId)
    .gte('visited_at', `${today}T00:00:00`);
  const breakMinutes = attendance ? Math.round((attendance.break_hours ?? 0) * 60) : 0;
  const overtimeMinutes = attendance ? Math.round((attendance.overtime_hours ?? 0) * 60) : 0;
  const emailsSent = communications?.emails_sent ?? 0;
  const emailsReceived = communications?.emails_received ?? 0;
  const teamsCalls = communications?.teams_calls ?? 0;
  const teamsCallMinutes = communications?.call_duration ?? 0;
  const socialScrollSeconds = (webActivityRows ?? []).reduce((total, row) => {
    if (row.category === 'social') {
      return total + (row.scroll_time ?? 0);
    }
    return total;
  }, 0);
  const socialScrollMinutes = Math.round(socialScrollSeconds / 60);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Productivity Insights</h1>
          <p className="text-gray-600">Today's activity overview - {new Date().toLocaleDateString()}</p>
        </div>
        {/* Live Status */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Live Status</CardTitle>
            <CardDescription>Latest signal from the desktop agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Presence</p>
                <span className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${statusBadge}`}>
                  <span className="inline-block h-2 w-2 rounded-full bg-current" />
                  {presenceStatus}
                </span>
                <p className="text-xs text-gray-500 mt-2">
                  Last sync {formatRelativeTime(lastSnapshotTime, now)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Current Application</p>
                <p className="text-sm font-semibold text-gray-900 mt-2">
                  {currentApplication?.app_name ?? '—'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentApplication?.window_title ?? 'No active window detected'}
                </p>
                {currentApplicationDuration !== null && (
                  <p className="text-xs text-gray-500 mt-1">
                    {currentApplicationDuration} min focused
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Last Activity</p>
                <p className="text-sm font-semibold text-gray-900 mt-2">
                  {formatRelativeTime(lastSnapshotTime, now)}
                </p>
                <p className="text-xs text-gray-500">
                  {(latestSession?.active_time ?? 0) > 0
                    ? `${Math.floor((latestSession?.active_time ?? 0) / 60)} min active today`
                    : 'No active time yet'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Last Screenshot</p>
                <p className="text-sm font-semibold text-gray-900 mt-2">
                  {formatRelativeTime(lastScreenshotEntry ? new Date(lastScreenshotEntry.captured_at) : null, now)}
                </p>
                <p className="text-xs text-gray-500">
                  {lastScreenshotEntry ? new Date(lastScreenshotEntry.captured_at).toLocaleTimeString() : 'Awaiting capture'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {isAdmin && teamStatus.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Team Monitor</CardTitle>
              <CardDescription>Snapshot of each tracked teammate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-2 text-left">Teammate</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Last Active</th>
                      <th className="px-4 py-2 text-left">Current App</th>
                      <th className="px-4 py-2 text-left">Screenshot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                    {teamStatus.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-2 font-medium text-gray-900">{member.name}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${presenceBadgeClass(member.status)}`}>
                            <span className="inline-block h-2 w-2 rounded-full bg-current" />
                            {member.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {formatRelativeTime(member.lastActive, now)}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{member.currentApp ?? '—'}</span>
                            <span className="text-xs text-gray-500 truncate">{member.currentWindow ?? ''}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {member.screenshotUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.screenshotUrl}
                              alt={`${member.name} latest screenshot`}
                              className="h-12 w-20 rounded border border-gray-200 object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">No capture</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Time</CardTitle>
              <Clock className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {activeHours}h {activeMinutes}m
              </div>
              <p className="text-xs text-gray-500 mt-1">Total productive time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Break Time</CardTitle>
              <Coffee className="w-5 h-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatMinutes(breakMinutes)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Away from keyboard</p>
              {overtimeMinutes > 0 && (
                <p className="text-xs text-red-500 mt-1">{formatMinutes(overtimeMinutes)} overtime</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Emails Sent</CardTitle>
              <Mail className="w-5 h-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {emailsSent.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">{emailsReceived} received</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Teams Calls</CardTitle>
              <PhoneCall className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {teamsCalls}
              </div>
              <p className="text-xs text-gray-500 mt-1">{teamsCallMinutes} min of calls</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Keystrokes</CardTitle>
              <Keyboard className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalKeystrokes.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total key presses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Mouse Activity</CardTitle>
              <MousePointer className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalMouseMoves.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Mouse movements</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Screenshots</CardTitle>
              <Monitor className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {screenshotsWithUrls?.length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Captured today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Social Scroll</CardTitle>
              <Globe className="w-5 h-5 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatMinutes(socialScrollMinutes)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Time spent on social feeds</p>
            </CardContent>
          </Card>
        </div>
        {/* Top Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Top Applications
              </CardTitle>
              <CardDescription>Most used applications today</CardDescription>
            </CardHeader>
            <CardContent>
              {topApps.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No application data yet</p>
                  <p className="text-sm mt-2">Start the desktop agent to track activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topApps.map((app, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{app.name}</span>
                          <span className="text-sm text-gray-600">{app.duration} min</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${app.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Recent Screenshots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Recent Screenshots
              </CardTitle>
              <CardDescription>Latest activity screenshots</CardDescription>
            </CardHeader>
            <CardContent>
              {!screenshotsWithUrls || screenshotsWithUrls.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No screenshots yet</p>
                  <p className="text-sm mt-2">Screenshots will appear here when captured</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {screenshotsWithUrls.slice(0, 4).map((screenshot, idx) => (
                    <div key={idx} className="relative group cursor-pointer">
                      <img
                        src={screenshot.display_url ?? ''}
                        alt={`Screenshot ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs">
                          {new Date(screenshot.captured_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Getting Started */}
        {(!sessions || sessions.length === 0) && (
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Get Started with Productivity Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Download the Agent</h4>
                    <p className="text-sm text-gray-600">Install the desktop monitoring agent on your computer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Configure Settings</h4>
                    <p className="text-sm text-gray-600">Set your preferences for screenshots and sync intervals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Start Tracking</h4>
                    <p className="text-sm text-gray-600">Your productivity data will appear here automatically</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
