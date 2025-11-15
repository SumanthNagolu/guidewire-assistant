/**
 * CRON JOB: Weekly Workflow Optimization
 * Runs every Sunday at 6 AM
 * 
 * Analyzes workflow performance and applies optimizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { optimizeWorkflows } from '@/lib/automation/workflow-optimizer';
import { logger } from '@/lib/utils/logger';

export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    logger.info('[CRON] Starting weekly workflow optimization...');
    const startTime = Date.now();

    const result = await optimizeWorkflows();

    const duration = Date.now() - startTime;
    logger.info(`[CRON] Optimization completed in ${duration}ms`);
    logger.info(`[CRON] Analyzed: ${result.analyzed}, Applied: ${result.applied}, Queued: ${result.queued}`);

    return NextResponse.json({
      success: true,
      result,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('[CRON] Workflow optimization failed:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

