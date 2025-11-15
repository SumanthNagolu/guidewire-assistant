/**
 * CRON JOB: Hourly Bottleneck Detection
 * Runs every hour
 * 
 * Detects stuck workflows and creates alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowEngine } from '@/lib/workflows/engine';
import { logger } from '@/lib/utils/logger';

export const runtime = 'edge';
export const maxDuration = 60; // 1 minute

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    logger.info('[CRON] Running bottleneck detection...');
    const workflowEngine = getWorkflowEngine();

    const bottlenecks = await workflowEngine.detectBottlenecks();

    logger.info(`[CRON] Found ${bottlenecks.length} bottlenecks`);

    return NextResponse.json({
      success: true,
      bottlenecks_count: bottlenecks.length,
      bottlenecks: bottlenecks,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('[CRON] Bottleneck detection failed:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

