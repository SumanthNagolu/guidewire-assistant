/**
 * HEALTH CHECK ENDPOINT
 * Used by uptime monitoring and load balancers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Check database connectivity
    const supabase = createClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    const dbResponseTime = Date.now() - startTime;

    if (error) {
      return NextResponse.json({
        status: 'unhealthy',
        error: 'Database connection failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    // All checks passed
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      response_time_ms: dbResponseTime,
      timestamp: new Date().toISOString(),
      version: '2.0'
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

