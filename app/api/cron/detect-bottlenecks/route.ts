import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// GET /api/cron/detect-bottlenecks - Run bottleneck detection (runs hourly)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Call the bottleneck detection API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/productivity/bottlenecks`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      }
    );
    const data = await response.json();
    return NextResponse.json({
      success: data.success,
      bottlenecks_detected: data.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to detect bottlenecks', details: error.message },
      { status: 500 }
    );
  }
}
