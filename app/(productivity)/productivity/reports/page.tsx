import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
export default async function ProductivityReportsPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  const isAdmin = profile?.role === 'admin';
  const userFilter = user.id;
  const [{ data: screenshots }, { data: activities }] = await Promise.all([
    supabase
      .from('productivity_screenshots')
      .select('id, captured_at, screenshot_url')
      .eq('user_id', userFilter)
      .order('captured_at', { ascending: false })
      .limit(24),
    supabase
      .from('productivity_applications')
      .select('id, start_time, app_name, window_title, duration')
      .eq('user_id', userFilter)
      .order('start_time', { ascending: false })
      .limit(100),
  ]);
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
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Productivity Reports</h1>
        <p className="text-gray-600 mt-2">
          {isAdmin
            ? 'Review desktop tracker data captured for your team. Admins can switch users from Supabase directly for now.'
            : 'Your personal history of screenshots and activity captured by the desktop tracker.'}
        </p>
      </div>
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Screenshot Timeline</h2>
        {screenshotsWithUrls && screenshotsWithUrls.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {screenshotsWithUrls.map((shot) => (
              <figure
                key={shot.id}
                className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.display_url ?? ''}
                  alt="Screenshot"
                  className="h-48 w-full object-cover"
                />
                <figcaption className="p-4 text-sm text-gray-700 space-y-1">
                  <div className="text-xs text-gray-500">
                    {new Date(shot.captured_at).toLocaleString()}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            No screenshots captured yet. Make sure the desktop tracker is running and has screen
            recording permission.
          </div>
        )}
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        {activities && activities.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Application
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Window
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {new Date(activity.start_time).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {activity.app_name ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {activity.window_title ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">
                      {Math.floor((activity.duration ?? 0) / 60)} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            No activity logs yet today. Keep the tracker running to populate this feed.
          </div>
        )}
      </section>
    </div>
  );
}
