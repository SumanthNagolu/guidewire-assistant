import { createClient } from '@/lib/supabase/server';
import { predictionEngine } from '@/lib/ml/prediction-engine';
import { cache } from '@/lib/redis';
import { loggers } from '@/lib/logger';
import { eventBus } from '@/lib/events/event-bus';

// Business metric types
export interface BusinessMetric {
  id: string;
  name: string;
  category: MetricCategory;
  value: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  period: MetricPeriod;
  timestamp: Date;
  forecast?: MetricForecast;
}

export type MetricCategory = 
  | 'revenue'
  | 'placement'
  | 'productivity'
  | 'learning'
  | 'engagement'
  | 'quality'
  | 'cost'
  | 'pipeline';

export type MetricPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface MetricForecast {
  predicted: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  horizon: number; // days
}

export interface KPI {
  id: string;
  name: string;
  formula: string;
  target: number;
  current: number;
  achievement: number; // percentage
  status: 'on-track' | 'at-risk' | 'off-track';
}

// Business Metrics Service
export class BusinessMetricsService {
  private static instance: BusinessMetricsService;

  private constructor() {
    this.initializeMetrics();
  }

  static getInstance(): BusinessMetricsService {
    if (!BusinessMetricsService.instance) {
      BusinessMetricsService.instance = new BusinessMetricsService();
    }
    return BusinessMetricsService.instance;
  }

  // Initialize metrics collection
  private async initializeMetrics() {
    // Set up periodic collection
    setInterval(() => this.collectMetrics(), 60000); // Every minute
    setInterval(() => this.generateForecasts(), 3600000); // Every hour
    setInterval(() => this.calculateKPIs(), 900000); // Every 15 minutes
  }

  // Collect all business metrics
  private async collectMetrics() {
    try {
      await Promise.all([
        this.collectRevenueMetrics(),
        this.collectPlacementMetrics(),
        this.collectProductivityMetrics(),
        this.collectLearningMetrics(),
        this.collectEngagementMetrics(),
        this.collectPipelineMetrics(),
      ]);

      await eventBus.emit('metrics:collected', {
        timestamp: new Date(),
      });

    } catch (error) {
      loggers.system.error('Metrics collection failed', error);
    }
  }

  // Revenue metrics
  private async collectRevenueMetrics() {
    const supabase = await createClient();

    // Get current period revenue
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data: placements } = await supabase
      .from('placements')
      .select('bill_rate')
      .gte('created_at', startOfMonth.toISOString())
      .eq('status', 'active');

    const monthlyRevenue = placements?.reduce((sum, p) => sum + (p.bill_rate || 0), 0) || 0;

    // Get previous month for comparison
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const { data: prevPlacements } = await supabase
      .from('placements')
      .select('bill_rate')
      .gte('created_at', prevMonth.toISOString())
      .lte('created_at', prevMonthEnd.toISOString())
      .eq('status', 'active');

    const prevRevenue = prevPlacements?.reduce((sum, p) => sum + (p.bill_rate || 0), 0) || 0;

    const changePercent = prevRevenue > 0 ? ((monthlyRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Store metric
    await this.storeMetric({
      name: 'Monthly Revenue',
      category: 'revenue',
      value: monthlyRevenue,
      trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'stable',
      changePercent,
      period: 'monthly',
      timestamp: now,
    });

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = monthlyRevenue; // Simplified
    await this.storeMetric({
      name: 'MRR',
      category: 'revenue',
      value: mrr,
      trend: 'stable',
      changePercent: 0,
      period: 'monthly',
      timestamp: now,
    });

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12;
    await this.storeMetric({
      name: 'ARR',
      category: 'revenue',
      value: arr,
      trend: 'stable',
      changePercent: 0,
      period: 'yearly',
      timestamp: now,
    });
  }

  // Placement metrics
  private async collectPlacementMetrics() {
    const supabase = await createClient();
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Weekly placements
    const { count: weeklyPlacements } = await supabase
      .from('placements')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfWeek.toISOString());

    await this.storeMetric({
      name: 'Weekly Placements',
      category: 'placement',
      value: weeklyPlacements || 0,
      trend: 'stable',
      changePercent: 0,
      period: 'weekly',
      timestamp: new Date(),
    });

    // Placement rate
    const { count: totalApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfWeek.toISOString());

    const placementRate = totalApplications ? (weeklyPlacements! / totalApplications) * 100 : 0;

    await this.storeMetric({
      name: 'Placement Rate',
      category: 'placement',
      value: placementRate,
      trend: placementRate > 15 ? 'up' : 'down',
      changePercent: 0,
      period: 'weekly',
      timestamp: new Date(),
    });

    // Time to fill
    const { data: recentPlacements } = await supabase
      .from('placements')
      .select('created_at, application_id')
      .gte('created_at', startOfWeek.toISOString())
      .limit(10);

    if (recentPlacements && recentPlacements.length > 0) {
      const timeToFillDays: number[] = [];
      
      for (const placement of recentPlacements) {
        const { data: application } = await supabase
          .from('applications')
          .select('created_at')
          .eq('id', placement.application_id)
          .single();

        if (application) {
          const days = Math.floor(
            (new Date(placement.created_at).getTime() - new Date(application.created_at).getTime()) 
            / (1000 * 60 * 60 * 24)
          );
          timeToFillDays.push(days);
        }
      }

      const avgTimeToFill = timeToFillDays.reduce((a, b) => a + b, 0) / timeToFillDays.length;

      await this.storeMetric({
        name: 'Average Time to Fill',
        category: 'placement',
        value: avgTimeToFill,
        trend: avgTimeToFill < 30 ? 'up' : 'down',
        changePercent: 0,
        period: 'weekly',
        timestamp: new Date(),
      });
    }
  }

  // Productivity metrics
  private async collectProductivityMetrics() {
    const supabase = await createClient();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Get today's productivity scores
    const { data: scores } = await supabase
      .from('productivity_scores')
      .select('overall_score')
      .eq('date', today);

    if (scores && scores.length > 0) {
      const avgScore = scores.reduce((sum, s) => sum + s.overall_score, 0) / scores.length;

      await this.storeMetric({
        name: 'Daily Productivity Score',
        category: 'productivity',
        value: avgScore,
        trend: avgScore > 70 ? 'up' : avgScore < 50 ? 'down' : 'stable',
        changePercent: 0,
        period: 'daily',
        timestamp: now,
      });
    }

    // Active users today
    const { count: activeUsers } = await supabase
      .from('productivity_sessions')
      .select('user_id', { count: 'exact', head: true })
      .gte('start_time', today);

    await this.storeMetric({
      name: 'Daily Active Users',
      category: 'productivity',
      value: activeUsers || 0,
      trend: 'stable',
      changePercent: 0,
      period: 'daily',
      timestamp: now,
    });
  }

  // Learning metrics
  private async collectLearningMetrics() {
    const supabase = await createClient();
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Course completions
    const { count: completions } = await supabase
      .from('topic_completions')
      .select('*', { count: 'exact', head: true })
      .gte('completed_at', startOfWeek.toISOString())
      .not('completed_at', 'is', null);

    await this.storeMetric({
      name: 'Weekly Course Completions',
      category: 'learning',
      value: completions || 0,
      trend: 'stable',
      changePercent: 0,
      period: 'weekly',
      timestamp: new Date(),
    });

    // Average quiz scores
    const { data: quizAttempts } = await supabase
      .from('quiz_attempts')
      .select('score')
      .gte('created_at', startOfWeek.toISOString())
      .not('score', 'is', null);

    if (quizAttempts && quizAttempts.length > 0) {
      const avgScore = quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length;

      await this.storeMetric({
        name: 'Average Quiz Score',
        category: 'learning',
        value: avgScore,
        trend: avgScore > 80 ? 'up' : avgScore < 60 ? 'down' : 'stable',
        changePercent: 0,
        period: 'weekly',
        timestamp: new Date(),
      });
    }

    // Active learners
    const { count: activeLearners } = await supabase
      .from('topic_completions')
      .select('user_id', { count: 'exact', head: true })
      .gte('started_at', startOfWeek.toISOString());

    await this.storeMetric({
      name: 'Weekly Active Learners',
      category: 'learning',
      value: activeLearners || 0,
      trend: 'stable',
      changePercent: 0,
      period: 'weekly',
      timestamp: new Date(),
    });
  }

  // Engagement metrics
  private async collectEngagementMetrics() {
    const supabase = await createClient();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // AI interactions
    const { count: aiInteractions } = await supabase
      .from('ai_messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    await this.storeMetric({
      name: 'Daily AI Interactions',
      category: 'engagement',
      value: aiInteractions || 0,
      trend: 'stable',
      changePercent: 0,
      period: 'daily',
      timestamp: now,
    });

    // User retention (simplified)
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    const { count: activeLastWeek } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const retentionRate = totalUsers ? (activeLastWeek! / totalUsers) * 100 : 0;

    await this.storeMetric({
      name: 'Weekly Retention Rate',
      category: 'engagement',
      value: retentionRate,
      trend: retentionRate > 80 ? 'up' : retentionRate < 60 ? 'down' : 'stable',
      changePercent: 0,
      period: 'weekly',
      timestamp: now,
    });
  }

  // Pipeline metrics
  private async collectPipelineMetrics() {
    const supabase = await createClient();
    const now = new Date();

    // Open jobs
    const { count: openJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    await this.storeMetric({
      name: 'Open Jobs',
      category: 'pipeline',
      value: openJobs || 0,
      trend: 'stable',
      changePercent: 0,
      period: 'daily',
      timestamp: now,
    });

    // Candidates in pipeline
    const { count: pipelineCandidates } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .in('status', ['new', 'screening', 'interviewing']);

    await this.storeMetric({
      name: 'Pipeline Candidates',
      category: 'pipeline',
      value: pipelineCandidates || 0,
      trend: 'stable',
      changePercent: 0,
      period: 'daily',
      timestamp: now,
    });

    // Pipeline velocity
    const { data: recentApplications } = await supabase
      .from('applications')
      .select('created_at, status')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .in('status', ['placed', 'rejected']);

    if (recentApplications && recentApplications.length > 0) {
      const avgDays = 15; // Placeholder - would calculate actual average

      await this.storeMetric({
        name: 'Pipeline Velocity (days)',
        category: 'pipeline',
        value: avgDays,
        trend: avgDays < 20 ? 'up' : 'down',
        changePercent: 0,
        period: 'monthly',
        timestamp: now,
      });
    }
  }

  // Store metric
  private async storeMetric(metric: Omit<BusinessMetric, 'id'>) {
    const supabase = await createClient();

    const { error } = await supabase
      .from('business_metrics')
      .insert({
        name: metric.name,
        category: metric.category,
        value: metric.value,
        trend: metric.trend,
        change_percent: metric.changePercent,
        period: metric.period,
        created_at: metric.timestamp.toISOString(),
      });

    if (error) {
      loggers.system.error('Failed to store metric', { metric, error });
    }

    // Cache latest value
    await cache.set(
      `metric:${metric.category}:${metric.name}`,
      metric,
      300 // 5 minutes
    );
  }

  // Generate forecasts
  private async generateForecasts() {
    try {
      // Revenue forecast
      const revenueForecast = await this.forecastRevenue();
      
      // Placement forecast
      const placementForecast = await this.forecastPlacements();
      
      // Productivity forecast
      const productivityForecast = await this.forecastProductivity();

      await eventBus.emit('forecasts:generated', {
        revenue: revenueForecast,
        placements: placementForecast,
        productivity: productivityForecast,
        timestamp: new Date(),
      });

    } catch (error) {
      loggers.system.error('Forecast generation failed', error);
    }
  }

  // Forecast revenue
  private async forecastRevenue(): Promise<MetricForecast> {
    const supabase = await createClient();

    // Get historical revenue data
    const { data: historicalData } = await supabase
      .from('business_metrics')
      .select('value, created_at')
      .eq('name', 'Monthly Revenue')
      .order('created_at', { ascending: false })
      .limit(12);

    if (!historicalData || historicalData.length < 3) {
      return {
        predicted: 0,
        confidence: 0,
        upperBound: 0,
        lowerBound: 0,
        horizon: 30,
      };
    }

    // Use ML model for prediction
    const prediction = await predictionEngine.predict({
      modelType: 'revenue_prediction',
      input: {
        historical_revenue: historicalData.map(d => d.value),
        seasonality: new Date().getMonth(),
        market_conditions: 0.7, // Placeholder
      },
      options: {
        confidence: true,
      },
    });

    return {
      predicted: prediction.prediction,
      confidence: prediction.confidence || 0.8,
      upperBound: prediction.prediction * 1.2,
      lowerBound: prediction.prediction * 0.8,
      horizon: 30,
    };
  }

  // Forecast placements
  private async forecastPlacements(): Promise<MetricForecast> {
    const prediction = await predictionEngine.predict({
      modelType: 'placement_success',
      input: {
        pipeline_size: 50, // Placeholder
        average_skill_match: 0.75,
        market_demand: 0.8,
      },
      options: {
        confidence: true,
      },
    });

    return {
      predicted: prediction.prediction * 50, // Convert rate to count
      confidence: prediction.confidence || 0.75,
      upperBound: prediction.prediction * 60,
      lowerBound: prediction.prediction * 40,
      horizon: 7,
    };
  }

  // Forecast productivity
  private async forecastProductivity(): Promise<MetricForecast> {
    const prediction = await predictionEngine.predict({
      modelType: 'productivity_forecast',
      input: {
        historical_productivity: [70, 72, 68, 75, 73, 71, 74],
        day_of_week: new Date().getDay(),
        meetings_count: 5,
        task_load: 20,
        team_size: 10,
      },
      options: {
        confidence: true,
      },
    });

    return {
      predicted: prediction.prediction,
      confidence: prediction.confidence || 0.85,
      upperBound: Math.min(prediction.prediction * 1.1, 100),
      lowerBound: prediction.prediction * 0.9,
      horizon: 1,
    };
  }

  // Calculate KPIs
  private async calculateKPIs() {
    const kpis: KPI[] = [
      await this.calculateRevenueKPI(),
      await this.calculatePlacementKPI(),
      await this.calculateProductivityKPI(),
      await this.calculateQualityKPI(),
    ];

    // Store KPIs
    for (const kpi of kpis) {
      await this.storeKPI(kpi);
    }
  }

  // Calculate revenue KPI
  private async calculateRevenueKPI(): Promise<KPI> {
    const currentRevenue = await this.getMetricValue('revenue', 'Monthly Revenue');
    const target = 500000; // $500K monthly target

    return {
      id: 'revenue-kpi',
      name: 'Monthly Revenue Target',
      formula: 'Sum of all placement bill rates',
      target,
      current: currentRevenue,
      achievement: (currentRevenue / target) * 100,
      status: currentRevenue >= target ? 'on-track' : 
              currentRevenue >= target * 0.8 ? 'at-risk' : 'off-track',
    };
  }

  // Calculate placement KPI
  private async calculatePlacementKPI(): Promise<KPI> {
    const placements = await this.getMetricValue('placement', 'Weekly Placements');
    const target = 20; // 20 placements per week

    return {
      id: 'placement-kpi',
      name: 'Weekly Placement Target',
      formula: 'Count of successful placements',
      target,
      current: placements,
      achievement: (placements / target) * 100,
      status: placements >= target ? 'on-track' : 
              placements >= target * 0.7 ? 'at-risk' : 'off-track',
    };
  }

  // Calculate productivity KPI
  private async calculateProductivityKPI(): Promise<KPI> {
    const productivity = await this.getMetricValue('productivity', 'Daily Productivity Score');
    const target = 75; // 75% productivity target

    return {
      id: 'productivity-kpi',
      name: 'Team Productivity Target',
      formula: 'Average productivity score across all employees',
      target,
      current: productivity,
      achievement: (productivity / target) * 100,
      status: productivity >= target ? 'on-track' : 
              productivity >= target * 0.8 ? 'at-risk' : 'off-track',
    };
  }

  // Calculate quality KPI
  private async calculateQualityKPI(): Promise<KPI> {
    const placementRate = await this.getMetricValue('placement', 'Placement Rate');
    const target = 20; // 20% placement rate

    return {
      id: 'quality-kpi',
      name: 'Placement Quality Target',
      formula: 'Placements / Total Applications * 100',
      target,
      current: placementRate,
      achievement: (placementRate / target) * 100,
      status: placementRate >= target ? 'on-track' : 
              placementRate >= target * 0.75 ? 'at-risk' : 'off-track',
    };
  }

  // Get metric value
  private async getMetricValue(category: string, name: string): Promise<number> {
    const cached = await cache.get<BusinessMetric>(`metric:${category}:${name}`);
    if (cached) return cached.value;

    const supabase = await createClient();
    const { data } = await supabase
      .from('business_metrics')
      .select('value')
      .eq('category', category)
      .eq('name', name)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data?.value || 0;
  }

  // Store KPI
  private async storeKPI(kpi: KPI) {
    const supabase = await createClient();

    await supabase
      .from('kpis')
      .upsert({
        id: kpi.id,
        name: kpi.name,
        formula: kpi.formula,
        target: kpi.target,
        current: kpi.current,
        achievement: kpi.achievement,
        status: kpi.status,
        updated_at: new Date().toISOString(),
      });

    // Cache KPI
    await cache.set(`kpi:${kpi.id}`, kpi, 300); // 5 minutes
  }

  // Get dashboard metrics
  async getDashboardMetrics(): Promise<{
    metrics: BusinessMetric[];
    kpis: KPI[];
    forecasts: Record<string, MetricForecast>;
  }> {
    const supabase = await createClient();

    // Get latest metrics
    const { data: metrics } = await supabase
      .from('business_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // Get KPIs
    const { data: kpis } = await supabase
      .from('kpis')
      .select('*');

    // Get forecasts
    const forecasts = {
      revenue: await this.forecastRevenue(),
      placements: await this.forecastPlacements(),
      productivity: await this.forecastProductivity(),
    };

    return {
      metrics: metrics?.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        value: m.value,
        trend: m.trend,
        changePercent: m.change_percent,
        period: m.period,
        timestamp: new Date(m.created_at),
      })) || [],
      kpis: kpis?.map(k => ({
        id: k.id,
        name: k.name,
        formula: k.formula,
        target: k.target,
        current: k.current,
        achievement: k.achievement,
        status: k.status,
      })) || [],
      forecasts,
    };
  }

  // Get metric trends
  async getMetricTrends(
    category: MetricCategory,
    period: MetricPeriod,
    lookback: number = 30
  ): Promise<any[]> {
    const supabase = await createClient();

    const { data } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('category', category)
      .eq('period', period)
      .gte('created_at', new Date(Date.now() - lookback * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    return data || [];
  }
}

// Export singleton
export const businessMetricsService = BusinessMetricsService.getInstance();
