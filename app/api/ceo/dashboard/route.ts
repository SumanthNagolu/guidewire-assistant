import { NextRequest, NextResponse } from 'next/server';
import { businessMetricsService } from '@/lib/analytics/business-metrics';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import { createClient } from '@/lib/supabase/server';
import { cache } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || 'monthly';

  try {
    // Check cache first
    const cacheKey = `ceo:dashboard:${period}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Get dashboard data
    const dashboardData = await businessMetricsService.getDashboardMetrics();

    // Get real-time data
    const realtime = await getRealtimeData();

    // Generate AI insights
    const insights = await generateCEOInsights(dashboardData);

    // Get critical alerts
    const alerts = await getCriticalAlerts();

    const response = {
      metrics: dashboardData.metrics,
      kpis: dashboardData.kpis,
      forecasts: dashboardData.forecasts,
      insights,
      alerts,
      realtime,
      timestamp: new Date(),
    };

    // Cache for 1 minute
    await cache.set(cacheKey, response, 60);

    return NextResponse.json(response);

  } catch (error) {
    // Error logged internally
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function getRealtimeData() {
  const supabase = await createClient();
  
  // Get last 24 hours of activity
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const [placements, applications, sessions] = await Promise.all([
    supabase
      .from('placements')
      .select('created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true }),
    
    supabase
      .from('applications')
      .select('created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true }),
    
    supabase
      .from('productivity_sessions')
      .select('start_time')
      .gte('start_time', since.toISOString())
      .order('start_time', { ascending: true }),
  ]);

  // Group by hour
  const hourlyData: any[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = new Date(Date.now() - (24 - i) * 60 * 60 * 1000);
    const nextHour = new Date(hour.getTime() + 60 * 60 * 1000);
    
    hourlyData.push({
      time: hour.toISOString(),
      placements: placements.data?.filter((p: any) => 
        new Date(p.created_at) >= hour && new Date(p.created_at) < nextHour
      ).length || 0,
      applications: applications.data?.filter((a: any) => 
        new Date(a.created_at) >= hour && new Date(a.created_at) < nextHour
      ).length || 0,
      activeSessions: sessions.data?.filter((s: any) => 
        new Date(s.start_time) >= hour && new Date(s.start_time) < nextHour
      ).length || 0,
    });
  }

  return hourlyData;
}

async function generateCEOInsights(data: any) {
  const insights = [];

  // Revenue insights
  if (data.kpis.find((k: any) => k.id === 'revenue-kpi')?.status === 'off-track') {
    const insight = await aiOrchestrator.route({
      prompt: `Generate executive insight for revenue being off-track. Current: ${data.kpis.find((k: any) => k.id === 'revenue-kpi')?.current}, Target: ${data.kpis.find((k: any) => k.id === 'revenue-kpi')?.target}`,
      context: {
        useCase: 'ceo_insights',
        userId: 'ceo',
      },
    });

    insights.push({
      type: 'warning',
      category: 'revenue',
      title: 'Revenue Target at Risk',
      description: insight.content,
      priority: 'high',
    });
  }

  // Productivity insights
  const productivityScore = data.metrics.find((m: any) => m.name === 'Daily Productivity Score')?.value;
  if (productivityScore && productivityScore < 60) {
    insights.push({
      type: 'warning',
      category: 'productivity',
      title: 'Low Team Productivity',
      description: `Team productivity at ${productivityScore}% - below optimal threshold. Consider reviewing workload distribution and providing additional support.`,
      priority: 'medium',
    });
  }

  // Opportunity insights
  const placementRate = data.metrics.find((m: any) => m.name === 'Placement Rate')?.value;
  if (placementRate && placementRate > 20) {
    insights.push({
      type: 'opportunity',
      category: 'placement',
      title: 'High Placement Rate',
      description: `Placement rate at ${placementRate}% - excellent performance. Consider scaling operations to capitalize on this efficiency.`,
      priority: 'medium',
    });
  }

  // AI recommendations
  const recommendation = await aiOrchestrator.route({
    prompt: 'Based on current business metrics, provide one strategic recommendation for the CEO',
    context: {
      useCase: 'ceo_insights',
      userId: 'ceo',
      metrics: data.kpis,
    },
  });

  insights.push({
    type: 'recommendation',
    category: 'strategic',
    title: 'Strategic Recommendation',
    description: recommendation.content,
    priority: 'low',
  });

  return insights;
}

async function getCriticalAlerts() {
  const supabase = await createClient();
  
  const { data: alerts } = await supabase
    .from('system_alerts')
    .select('*')
    .eq('status', 'active')
    .eq('severity', 'critical')
    .order('created_at', { ascending: false })
    .limit(5);

  return alerts?.map((alert: any) => ({
    id: alert.id,
    severity: alert.severity,
    message: alert.alert_type,
    timestamp: alert.created_at,
    data: alert.data,
  })) || [];
}
