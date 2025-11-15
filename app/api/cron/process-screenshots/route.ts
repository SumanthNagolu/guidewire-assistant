import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
/**
 * Cron endpoint to trigger batch processing for all users
 * Run this every 5 minutes via Vercel Cron or external scheduler
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (if using Vercel Cron)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const adminClient = createAdminClient();
  try {
    // Get all users with pending screenshots
    const { data: users } = await adminClient
      .from('productivity_screenshots')
      .select('user_id')
      .eq('processing_status', 'pending')
      .gte('captured_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
      .limit(10); // Process max 10 users at a time
    if (!users || users.length === 0) {
      return NextResponse.json({ 
        message: 'No pending screenshots',
        processed: 0 
      });
    }
    // Get unique user IDs
    const uniqueUserIds = [...new Set(users.map(u => u.user_id))];
    // Process each user's screenshots
    const results = await Promise.all(
      uniqueUserIds.map(async userId => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/productivity/batch-process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });
          const result = await response.json();
          return { userId, ...result };
        } catch (error) {
          return { userId, error: error.message };
        }
      })
    );
    const successCount = results.filter(r => r.success).length;
    return NextResponse.json({
      success: true,
      usersProcessed: uniqueUserIds.length,
      successful: successCount,
      results
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Cron job failed', details: error.message },
      { status: 500 }
    );
  }
}
