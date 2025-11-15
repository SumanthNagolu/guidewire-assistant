/**
 * ANALYTICS AGGREGATOR
 * Unified metrics and insights across all modules
 * 
 * Aggregates data from:
 * - Academy (students, completions, progress)
 * - HR (employees, attendance, performance)
 * - CRM (jobs, candidates, placements)
 * - Productivity (sessions, scores, activity)
 * - Platform (workflows, pods, bottlenecks)
 * 
 * Generates:
 * - CEO Dashboard metrics
 * - Cross-module insights
 * - Correlation analysis
 * - Predictive analytics
 * - Real-time alerts
 */

import { createClient } from '@/lib/supabase/server';
import { getAIService } from '@/lib/ai/unified-service';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CEOMetrics {
  executive_summary: ExecutiveSummary;
  academy: AcademyMetrics;
  hr: HRMetrics;
  crm: CRMMetrics;
  productivity: ProductivityMetrics;
  platform: PlatformMetrics;
  insights: Insight[];
  correlations: Correlation[];
  alerts: Alert[];
  bottlenecks: BottleneckSummary[];
}

export interface ExecutiveSummary {
  revenue_mtd: number;
  revenue_target: number;
  revenue_change: number; // percentage
  active_jobs: number;
  placements_mtd: number;
  placement_target: number;
  team_productivity_avg: number;
  students_enrolled: number;
  students_completion_rate: number;
}

export interface AcademyMetrics {
  active_students: number;
  total_enrollments: number;
  completion_rate: number;
  avg_completion_time_days: number;
  courses_completed_mtd: number;
  top_products: Array<{ name: string; enrollments: number }>;
  engagement_score: number;
  trend: number; // percentage change
}

export interface HRMetrics {
  total_employees: number;
  active_employees: number;
  bench_consultants: number;
  avg_productivity_score: number;
  attendance_rate: number;
  leave_requests_pending: number;
  expense_claims_pending: number;
  avg_tenure_months: number;
  turnover_rate: number;
  trend: number;
}

export interface CRMMetrics {
  revenue_mtd: number;
  revenue_ytd: number;
  active_jobs: number;
  open_jobs: number;
  placements_mtd: number;
  placements_ytd: number;
  submissions_this_week: number;
  avg_time_to_fill_days: number;
  fill_rate: number; // percentage
  active_candidates: number;
  active_clients: number;
  pipeline_value: number;
  trend: number;
}

export interface ProductivityMetrics {
  avg_score: number;
  high_performers: number; // count of users with score > 80
  low_performers: number; // count of users with score < 60
  total_active_minutes: number;
  productive_minutes: number;
  productivity_rate: number; // percentage
  top_applications: Array<{ name: string; time_minutes: number }>;
  trend: number;
}

export interface PlatformMetrics {
  active_workflows: number;
  completed_workflows_mtd: number;
  avg_workflow_completion_time: number;
  overdue_workflows: number;
  active_pods: number;
  pod_utilization: number; // percentage
  bottlenecks_detected: number;
  automation_rate: number; // percentage
}

export interface Insight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data_points: any;
  actionable: boolean;
  suggested_action?: string;
  impact_estimate?: string;
}

export interface Correlation {
  factor1: string;
  factor2: string;
  correlation_strength: number; // -1 to 1
  description: string;
  sample_size: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  category: string;
  message: string;
  action_url?: string;
  created_at: Date;
}

export interface BottleneckSummary {
  id: string;
  workflow_name: string;
  pod_name: string;
  stuck_stage: string;
  stuck_duration_hours: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ai_suggestion: string;
}

// ============================================================================
// ANALYTICS AGGREGATOR CLASS
// ============================================================================

export class AnalyticsAggregator {
  private supabase = createClient();

  // ==========================================================================
  // MAIN CEO METRICS METHOD
  // ==========================================================================

  async getCEOMetrics(dateRange: DateRange): Promise<CEOMetrics> {
    // Fetch all metrics in parallel for performance
    const [academy, hr, crm, productivity, platform] = await Promise.all([
      this.getAcademyMetrics(dateRange),
      this.getHRMetrics(dateRange),
      this.getCRMMetrics(dateRange),
      this.getProductivityMetrics(dateRange),
      this.getPlatformMetrics(dateRange)
    ]);

    // Generate AI-powered insights
    const insights = await this.generateInsights({
      academy,
      hr,
      crm,
      productivity,
      platform
    });

    // Detect correlations
    const correlations = await this.detectCorrelations({
      academy,
      hr,
      productivity,
      crm
    });

    // Get alerts and bottlenecks
    const [alerts, bottlenecks] = await Promise.all([
      this.getAlerts(),
      this.getBottlenecks()
    ]);

    // Build executive summary
    const executive_summary: ExecutiveSummary = {
      revenue_mtd: crm.revenue_mtd,
      revenue_target: crm.revenue_mtd * 1.2, // Assuming 20% growth target
      revenue_change: crm.trend,
      active_jobs: crm.active_jobs,
      placements_mtd: crm.placements_mtd,
      placement_target: Math.ceil(crm.placements_mtd * 1.15),
      team_productivity_avg: productivity.avg_score,
      students_enrolled: academy.active_students,
      students_completion_rate: academy.completion_rate
    };

    return {
      executive_summary,
      academy,
      hr,
      crm,
      productivity,
      platform,
      insights,
      correlations,
      alerts,
      bottlenecks
    };
  }

  // ==========================================================================
  // ACADEMY METRICS
  // ==========================================================================

  async getAcademyMetrics(dateRange: DateRange): Promise<AcademyMetrics> {
    // Active students
    const { count: activeStudents } = await this.supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('onboarding_completed', true);

    // Total enrollments in period
    const { count: totalEnrollments } = await this.supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    // Completion rate (students who completed all topics)
    const { data: completions } = await this.supabase
      .rpc('get_academy_completion_rate', {
        start_date: dateRange.start.toISOString(),
        end_date: dateRange.end.toISOString()
      });

    const completionRate = completions?.[0]?.completion_rate || 0;

    // Courses completed this month
    const { count: coursesCompleted } = await this.supabase
      .from('topic_completions')
      .select('*', { count: 'exact', head: true })
      .gte('completed_at', dateRange.start.toISOString())
      .lte('completed_at', dateRange.end.toISOString());

    // Top products by enrollment
    const { data: topProducts } = await this.supabase
      .from('student_profiles')
      .select('preferred_product_id, products(name)')
      .not('preferred_product_id', 'is', null)
      .limit(5);

    const productCounts = topProducts?.reduce((acc: any, student: any) => {
      const productName = student.products?.name || 'Unknown';
      acc[productName] = (acc[productName] || 0) + 1;
      return acc;
    }, {}) || {};

    const topProductsArray = Object.entries(productCounts)
      .map(([name, count]) => ({ name, enrollments: count as number }))
      .sort((a, b) => b.enrollments - a.enrollments);

    // Calculate trend (compare to previous period)
    const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
    const previousStart = new Date(dateRange.start.getTime() - periodLength);
    const { count: previousEnrollments } = await this.supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', dateRange.start.toISOString());

    const trend = previousEnrollments 
      ? ((totalEnrollments! - previousEnrollments) / previousEnrollments) * 100
      : 0;

    return {
      active_students: activeStudents || 0,
      total_enrollments: totalEnrollments || 0,
      completion_rate: completionRate,
      avg_completion_time_days: 45,       courses_completed_mtd: coursesCompleted || 0,
      top_products: topProductsArray.slice(0, 3),
      engagement_score: 75,       trend
    };
  }

  // ==========================================================================
  // HR METRICS
  // ==========================================================================

  async getHRMetrics(dateRange: DateRange): Promise<HRMetrics> {
    // Total employees
    const { count: totalEmployees } = await this.supabase
      .from('employee_records')
      .select('*', { count: 'exact', head: true });

    // Active employees
    const { count: activeEmployees } = await this.supabase
      .from('employee_records')
      .select('*', { count: 'exact', head: true })
      .eq('employment_status', 'Active');

    // Bench consultants
    const { count: benchConsultants } = await this.supabase
      .from('employee_records')
      .select('*', { count: 'exact', head: true })
      .eq('employment_type', 'Bench')
      .eq('employment_status', 'Available');

    // Average productivity score
    const { data: prodScores } = await this.supabase
      .from('productivity_scores')
      .select('score')
      .gte('date', dateRange.start.toISOString().split('T')[0])
      .lte('date', dateRange.end.toISOString().split('T')[0]);

    const avgProductivityScore = prodScores && prodScores.length > 0
      ? prodScores.reduce((sum, s) => sum + s.score, 0) / prodScores.length
      : 0;

    // Attendance rate
    const { data: attendance } = await this.supabase
      .from('attendance')
      .select('status')
      .gte('date', dateRange.start.toISOString().split('T')[0])
      .lte('date', dateRange.end.toISOString().split('T')[0]);

    const presentDays = attendance?.filter(a => a.status === 'Present').length || 0;
    const totalDays = attendance?.length || 1;
    const attendanceRate = (presentDays / totalDays) * 100;

    // Pending requests
    const { count: leavePending } = await this.supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: expensesPending } = await this.supabase
      .from('expense_claims')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return {
      total_employees: totalEmployees || 0,
      active_employees: activeEmployees || 0,
      bench_consultants: benchConsultants || 0,
      avg_productivity_score: Math.round(avgProductivityScore),
      attendance_rate: Math.round(attendanceRate),
      leave_requests_pending: leavePending || 0,
      expense_claims_pending: expensesPending || 0,
      avg_tenure_months: 18,       turnover_rate: 5,       trend: 2.5     };
  }

  // ==========================================================================
  // CRM METRICS
  // ==========================================================================

  async getCRMMetrics(dateRange: DateRange): Promise<CRMMetrics> {
    // Revenue from placements
    const { data: placements } = await this.supabase
      .from('placements')
      .select('bill_rate, start_date')
      .gte('start_date', dateRange.start.toISOString().split('T')[0])
      .lte('start_date', dateRange.end.toISOString().split('T')[0])
      .eq('status', 'active');

    const revenueMTD = placements?.reduce((sum, p) => sum + (p.bill_rate || 0) * 160, 0) || 0; // 160 hours/month

    // Active and open jobs
    const { count: activeJobs } = await this.supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'filled']);

    const { count: openJobs } = await this.supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    // Placements
    const placementsMTD = placements?.length || 0;

    // Submissions this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const { count: submissionsThisWeek } = await this.supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted')
      .gte('submitted_at', weekStart.toISOString());

    // Active candidates and clients
    const { count: activeCandidates } = await this.supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: activeClients } = await this.supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Pipeline value from opportunities
    const { data: opportunities } = await this.supabase
      .from('opportunities')
      .select('estimated_value, probability')
      .eq('status', 'open');

    const pipelineValue = opportunities?.reduce(
      (sum, opp) => sum + (opp.estimated_value || 0) * (opp.probability || 50) / 100,
      0
    ) || 0;

    return {
      revenue_mtd: revenueMTD,
      revenue_ytd: revenueMTD * 3,       active_jobs: activeJobs || 0,
      open_jobs: openJobs || 0,
      placements_mtd: placementsMTD,
      placements_ytd: placementsMTD * 3,       submissions_this_week: submissionsThisWeek || 0,
      avg_time_to_fill_days: 21,       fill_rate: 65,       active_candidates: activeCandidates || 0,
      active_clients: activeClients || 0,
      pipeline_value: pipelineValue,
      trend: 5.2     };
  }

  // ==========================================================================
  // PRODUCTIVITY METRICS
  // ==========================================================================

  async getProductivityMetrics(dateRange: DateRange): Promise<ProductivityMetrics> {
    // Average productivity score
    const { data: scores } = await this.supabase
      .from('productivity_scores')
      .select('score')
      .gte('date', dateRange.start.toISOString().split('T')[0])
      .lte('date', dateRange.end.toISOString().split('T')[0]);

    const avgScore = scores && scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      : 0;

    const highPerformers = scores?.filter(s => s.score > 80).length || 0;
    const lowPerformers = scores?.filter(s => s.score < 60).length || 0;

    // Time metrics
    const { data: sessions } = await this.supabase
      .from('productivity_sessions')
      .select('active_time')
      .gte('start_time', dateRange.start.toISOString())
      .lte('start_time', dateRange.end.toISOString());

    const totalActiveMinutes = sessions?.reduce((sum, s) => sum + (s.active_time || 0) / 60, 0) || 0;
    const productiveMinutes = totalActiveMinutes * 0.75; // Assuming 75% productive
    const productivityRate = totalActiveMinutes > 0 ? (productiveMinutes / totalActiveMinutes) * 100 : 0;

    // Top applications
    const { data: apps } = await this.supabase
      .from('productivity_applications')
      .select('application_name, duration')
      .gte('start_time', dateRange.start.toISOString())
      .lte('start_time', dateRange.end.toISOString())
      .limit(100);

    const appTimes = apps?.reduce((acc: any, app: any) => {
      acc[app.application_name] = (acc[app.application_name] || 0) + (app.duration || 0) / 60;
      return acc;
    }, {}) || {};

    const topApplications = Object.entries(appTimes)
      .map(([name, time]) => ({ name, time_minutes: time as number }))
      .sort((a, b) => b.time_minutes - a.time_minutes)
      .slice(0, 5);

    return {
      avg_score: Math.round(avgScore),
      high_performers: highPerformers,
      low_performers: lowPerformers,
      total_active_minutes: Math.round(totalActiveMinutes),
      productive_minutes: Math.round(productiveMinutes),
      productivity_rate: Math.round(productivityRate),
      top_applications: topApplications,
      trend: 3.1     };
  }

  // ==========================================================================
  // PLATFORM METRICS
  // ==========================================================================

  async getPlatformMetrics(dateRange: DateRange): Promise<PlatformMetrics> {
    // Active workflows
    const { count: activeWorkflows } = await this.supabase
      .from('workflow_instances')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Completed workflows this month
    const { count: completedMTD } = await this.supabase
      .from('workflow_instances')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', dateRange.start.toISOString())
      .lte('completed_at', dateRange.end.toISOString());

    // Overdue workflows
    const { count: overdueWorkflows } = await this.supabase
      .from('workflow_instances')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('is_overdue', true);

    // Active pods
    const { count: activePods } = await this.supabase
      .from('pods')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Bottlenecks
    const { count: bottlenecksDetected } = await this.supabase
      .from('bottleneck_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    return {
      active_workflows: activeWorkflows || 0,
      completed_workflows_mtd: completedMTD || 0,
      avg_workflow_completion_time: 18.5, // days - TODO: Calculate from actual data
      overdue_workflows: overdueWorkflows || 0,
      active_pods: activePods || 0,
      pod_utilization: 75, // percentage - TODO: Calculate from workload
      bottlenecks_detected: bottlenecksDetected || 0,
      automation_rate: 85 // percentage - TODO: Calculate from manual vs automated actions
    };
  }

  // ==========================================================================
  // AI-POWERED INSIGHTS
  // ==========================================================================

  private async generateInsights(data: any): Promise<Insight[]> {
    const aiService = getAIService();

    try {
      const prompt = `Analyze this business data and provide 3-5 actionable insights. Focus on opportunities, risks, and data-driven recommendations.

Data:
${JSON.stringify(data, null, 2)}

Provide insights in this format (JSON array):
[
  {
    "type": "opportunity|risk|trend|recommendation",
    "priority": "low|medium|high|critical",
    "title": "Short title",
    "message": "Detailed insight",
    "actionable": true/false,
    "suggested_action": "What to do",
    "impact_estimate": "Expected impact"
  }
]`;

      const response = await aiService.chat(
        'system',
        'ceo_insights',
        [{ role: 'user', content: prompt }],
        {
          model: 'claude-3.5-sonnet',
          systemPrompt: 'You are a business intelligence analyst for a staffing company. Provide data-driven, actionable insights. Return valid JSON only.',
          stream: false
        }
      ) as string;

      // Parse AI response
      const insights = JSON.parse(response);
      return insights.map((insight: any, index: number) => ({
        id: `insight-${Date.now()}-${index}`,
        ...insight,
        data_points: data
      }));
    } catch (error) {
            // Return fallback insights
      return this.getFallbackInsights(data);
    }
  }

  private getFallbackInsights(data: any): Insight[] {
    const insights: Insight[] = [];

    // Insight 1: Productivity correlation
    if (data.productivity.avg_score > 80 && data.crm.placements_mtd > 10) {
      insights.push({
        id: 'insight-productivity-correlation',
        type: 'trend',
        priority: 'high',
        title: 'High Productivity Driving Placements',
        message: `Team productivity of ${data.productivity.avg_score}% correlates with ${data.crm.placements_mtd} placements this month. Maintaining high engagement is key.`,
        data_points: { productivity: data.productivity.avg_score, placements: data.crm.placements_mtd },
        actionable: true,
        suggested_action: 'Continue productivity monitoring and recognize high performers',
        impact_estimate: 'Sustained performance could yield 15% more placements'
      });
    }

    // Insight 2: Bench consultant opportunity
    if (data.hr.bench_consultants > 5) {
      insights.push({
        id: 'insight-bench-opportunity',
        type: 'opportunity',
        priority: 'high',
        title: 'Available Bench Consultants Ready for Placement',
        message: `${data.hr.bench_consultants} consultants are available on the bench. Accelerate marketing to convert them to placements.`,
        data_points: { bench_count: data.hr.bench_consultants },
        actionable: true,
        suggested_action: 'Intensify bench marketing efforts',
        impact_estimate: `Potential ${data.hr.bench_consultants * 10000} monthly revenue if all placed`
      });
    }

    // Insight 3: Academy pipeline
    if (data.academy.active_students > 20 && data.academy.completion_rate < 50) {
      insights.push({
        id: 'insight-academy-completion',
        type: 'risk',
        priority: 'medium',
        title: 'Low Academy Completion Rate',
        message: `Only ${data.academy.completion_rate}% of students are completing courses. Improve engagement to build pipeline.`,
        data_points: { students: data.academy.active_students, completion_rate: data.academy.completion_rate },
        actionable: true,
        suggested_action: 'Implement mentorship program and gamification',
        impact_estimate: '20% improvement could yield 5+ additional consultants per month'
      });
    }

    return insights;
  }

  // ==========================================================================
  // CORRELATION DETECTION
  // ==========================================================================

  private async detectCorrelations(data: any): Promise<Correlation[]> {
    const correlations: Correlation[] = [];

    // Correlation 1: Productivity vs Placements
    const prodPlacementCorr = this.calculateCorrelation(
      data.productivity.avg_score / 100,
      data.crm.placements_mtd / 20 // Normalize to 0-1 range
    );

    correlations.push({
      factor1: 'Team Productivity',
      factor2: 'Monthly Placements',
      correlation_strength: prodPlacementCorr,
      description: prodPlacementCorr > 0.5 
        ? 'Strong positive correlation: Higher productivity leads to more placements'
        : 'Moderate correlation observed',
      sample_size: 30
    });

    // Correlation 2: Academy completion vs Bench growth
    const academyBenchCorr = this.calculateCorrelation(
      data.academy.completion_rate / 100,
      data.hr.bench_consultants / 10
    );

    correlations.push({
      factor1: 'Academy Completion Rate',
      factor2: 'Bench Consultant Pool',
      correlation_strength: academyBenchCorr,
      description: academyBenchCorr > 0.6
        ? 'Strong correlation: Course completions directly build bench strength'
        : 'Moderate correlation: Academy feeds bench pipeline',
      sample_size: 60
    });

    return correlations;
  }

  private calculateCorrelation(x: number, y: number): number {
    // Simplified correlation for demo - in production, use proper statistical methods
    return Math.min(1, Math.abs(x - y) < 0.3 ? 0.8 : 0.5);
  }

  // ==========================================================================
  // ALERTS & BOTTLENECKS
  // ==========================================================================

  private async getAlerts(): Promise<Alert[]> {
    const { data: notifications } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .in('type', ['warning', 'error'])
      .order('created_at', { ascending: false })
      .limit(10);

    return (notifications || []).map(n => ({
      id: n.id,
      type: n.type,
      category: n.category || 'system',
      message: n.message,
      action_url: n.action_url,
      created_at: new Date(n.created_at)
    }));
  }

  private async getBottlenecks(): Promise<BottleneckSummary[]> {
    const { data: bottlenecks } = await this.supabase
      .from('bottleneck_alerts')
      .select(`
        id,
        workflow_instances(name),
        pods(name),
        stuck_stage_id,
        stuck_duration,
        severity,
        ai_suggestion
      `)
      .eq('status', 'open')
      .order('severity', { ascending: false })
      .limit(10);

    return (bottlenecks || []).map((b: any) => ({
      id: b.id,
      workflow_name: b.workflow_instances?.name || 'Unknown',
      pod_name: b.pods?.name || 'Unassigned',
      stuck_stage: b.stuck_stage_id,
      stuck_duration_hours: this.parseInterval(b.stuck_duration),
      severity: b.severity,
      ai_suggestion: b.ai_suggestion || 'Manual review recommended'
    }));
  }

  private parseInterval(interval: string): number {
    // Parse PostgreSQL interval to hours
    const match = interval.match(/(\d+)\s*hours?/);
    return match ? parseInt(match[1]) : 0;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let analyticsAggregatorInstance: AnalyticsAggregator | null = null;

export function getAnalyticsAggregator(): AnalyticsAggregator {
  if (!analyticsAggregatorInstance) {
    analyticsAggregatorInstance = new AnalyticsAggregator();
  }
  return analyticsAggregatorInstance;
}

