import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
/**
 * Context window management API
 * GET: Retrieve context summaries for a user
 * POST: Manually update context summaries
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const windowType = searchParams.get('window'); // Optional: '15min', '30min', etc.
    const limit = parseInt(searchParams.get('limit') || '10');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    const supabase = await createClient();
    // Build query
    let query = supabase
      .from('context_summaries')
      .select(`
        id,
        window_type,
        window_start,
        window_end,
        summary_text,
        activities,
        idle_minutes,
        active_minutes,
        context_preserved,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('window_end', { ascending: false });
    // Filter by window type if specified
    if (windowType) {
      query = query.eq('window_type', windowType);
    }
    // Apply limit
    query = query.limit(limit);
    const { data: summaries, error } = await query;
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 });
    }
    // Group by window type for easier consumption
    const groupedSummaries = summaries?.reduce((acc: any, summary: any) => {
      if (!acc[summary.window_type]) {
        acc[summary.window_type] = [];
      }
      acc[summary.window_type].push(summary);
      return acc;
    }, {}) || {};
    return NextResponse.json({
      success: true,
      summaries: windowType ? summaries : groupedSummaries,
      count: summaries?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve context summaries', details: error.message },
      { status: 500 }
    );
  }
}
/**
 * Get latest summary for each window type
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    const adminClient = createAdminClient();
    switch (action) {
      case 'getLatest':
        // Get the most recent summary for each window type
        const { data: latestSummaries } = await adminClient
          .rpc('get_all_contexts', { p_user_id: userId });
        return NextResponse.json({
          success: true,
          summaries: latestSummaries || []
        });
      case 'getTimeRange':
        // Get summaries within a specific time range
        const { startTime, endTime } = await request.json();
        if (!startTime || !endTime) {
          return NextResponse.json({ 
            error: 'startTime and endTime are required for getTimeRange' 
          }, { status: 400 });
        }
        const { data: rangeSummaries, error: rangeError } = await adminClient
          .from('context_summaries')
          .select('*')
          .eq('user_id', userId)
          .gte('window_start', startTime)
          .lte('window_end', endTime)
          .order('window_end', { ascending: false });
        if (rangeError) {
          return NextResponse.json({ 
            error: 'Failed to fetch time range summaries' 
          }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          summaries: rangeSummaries || []
        });
      case 'generateMissing':
        // Trigger generation of missing context windows
        const { data: screenshots } = await adminClient
          .from('productivity_screenshots')
          .select('captured_at')
          .eq('user_id', userId)
          .eq('processed', true)
          .order('captured_at', { ascending: false })
          .limit(100);
        if (!screenshots || screenshots.length === 0) {
          return NextResponse.json({
            success: true,
            message: 'No processed screenshots to generate summaries from'
          });
        }
        // Check which windows are missing
        const now = new Date();
        const windowTypes = ['15min', '30min', '1hr', '2hr', '4hr', '1day', '1week', '1month', '1year'];
        const missingWindows = [];
        for (const windowType of windowTypes) {
          const { data: existing } = await adminClient
            .from('context_summaries')
            .select('id')
            .eq('user_id', userId)
            .eq('window_type', windowType)
            .gte('window_end', new Date(now.getTime() - getWindowMilliseconds(windowType)))
            .limit(1);
          if (!existing || existing.length === 0) {
            missingWindows.push(windowType);
          }
        }
        return NextResponse.json({
          success: true,
          missingWindows,
          message: `Found ${missingWindows.length} missing context windows`
        });
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: getLatest, getTimeRange, or generateMissing' 
        }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Context operation failed', details: error.message },
      { status: 500 }
    );
  }
}
/**
 * Helper function to get window size in milliseconds
 */
function getWindowMilliseconds(windowType: string): number {
  const windowMap: Record<string, number> = {
    '15min': 15 * 60 * 1000,
    '30min': 30 * 60 * 1000,
    '1hr': 60 * 60 * 1000,
    '2hr': 2 * 60 * 60 * 1000,
    '4hr': 4 * 60 * 60 * 1000,
    '1day': 24 * 60 * 60 * 1000,
    '1week': 7 * 24 * 60 * 60 * 1000,
    '1month': 30 * 24 * 60 * 60 * 1000,
    '1year': 365 * 24 * 60 * 60 * 1000
  };
  return windowMap[windowType] || 15 * 60 * 1000;
}
