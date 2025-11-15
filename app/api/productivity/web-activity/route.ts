import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const authHeader = request.headers.get('authorization');
    const payload = await request.json();
    const events = Array.isArray(payload?.events) ? payload.events : [];
    if (events.length === 0) {
      return NextResponse.json({ success: true, ingested: 0 });
    }
    let userId: string | null = null;
    if (payload?.userEmail) {
      const { data: profiles } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('email', payload.userEmail)
        .limit(1);
      if (profiles && profiles.length > 0) {
        userId = profiles[0].id;
      }
    }
    if (!userId) {
      if (authHeader?.includes('extension-key')) {
        const { data: anyUser } = await adminClient
          .from('user_profiles')
          .select('id')
          .order('created_at', { ascending: true })
          .limit(1);
        if (anyUser && anyUser.length > 0) {
          userId = anyUser[0].id;
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      }
    }
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const rows = events.map((event: any) => {
      const visitedAt = event.timestamp ? new Date(event.timestamp).toISOString() : new Date().toISOString();
      return {
        user_id: userId,
        url: event.url ?? null,
        domain: event.hostname ?? null,
        title: event.title ?? null,
        category: event.category ?? null,
        duration: event.activeMs ? Math.round(event.activeMs / 1000) : 0,
        scroll_time: event.scrollMs ? Math.round(event.scrollMs / 1000) : 0,
        scroll_events: event.scrollEvents ?? 0,
        max_scroll_depth: event.maxScrollDepth ?? 0,
        visited_at: visitedAt,
        created_at: new Date().toISOString(),
      };
    });
    const { error } = await adminClient
      .from('productivity_web_activity')
      .insert(rows);
    if (error) {
      return NextResponse.json({ error: 'Failed to record web activity' }, { status: 500 });
    }
    return NextResponse.json({ success: true, ingested: rows.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
