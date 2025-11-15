/**
 * CRON JOB: Daily Learning Loop
 * Runs every day at 6 AM
 * 
 * Executes:
 * - Productivity pattern analysis
 * - Workflow optimization
 * - AI insight generation
 * - Auto-optimization application
 * - CEO daily digest
 */

import { NextRequest, NextResponse } from 'next/server';
import { runDailyLearningLoop } from '@/lib/analytics/learning-loop';
import { logger } from '@/lib/utils/logger';

export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel cron authentication)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    logger.info('[CRON] Starting daily learning loop...');
    const startTime = Date.now();

    const digest = await runDailyLearningLoop();

    const duration = Date.now() - startTime;
    logger.info(`[CRON] Learning loop completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      digest,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('[CRON] Learning loop failed:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

