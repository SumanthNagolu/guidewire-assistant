/**
 * CEO DASHBOARD
 * Unified command center aggregating all systems
 * 
 * Displays:
 * - Executive KPIs (revenue, jobs, placements, productivity, students)
 * - AI-powered insights and recommendations
 * - Bottleneck alerts
 * - Department deep-dives
 * - Real-time production line visualization
 * - Predictive analytics
 * 
 * Real-time updates via Supabase Realtime
 */

import { startOfMonth } from 'date-fns';
import { Sparkles, AlertCircle, TrendingUp, Users, Briefcase, GraduationCap, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getAnalyticsAggregator } from '@/lib/analytics/aggregator';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// MAIN CEO DASHBOARD PAGE
// ============================================================================

export default async function CEODashboard() {
  const aggregator = getAnalyticsAggregator();

  // Fetch comprehensive metrics
  const metrics = await aggregator.getCEOMetrics({
    start: startOfMonth(new Date()),
    end: new Date()
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            Unified intelligence across all operations
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Month to Date</p>
          <p className="text-lg font-semibold">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard
          title="Revenue (MTD)"
          value={formatCurrency(metrics.executive_summary.revenue_mtd)}
          change={metrics.executive_summary.revenue_change}
          target={formatCurrency(metrics.executive_summary.revenue_target)}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={metrics.executive_summary.revenue_change}
        />
        
        <KPICard
          title="Active Jobs"
          value={metrics.executive_summary.active_jobs.toString()}
          subtitle={`${metrics.crm.submissions_this_week} submissions this week`}
          icon={<Briefcase className="w-5 h-5" />}
        />
        
        <KPICard
          title="Placements (MTD)"
          value={metrics.executive_summary.placements_mtd.toString()}
          target={`Target: ${metrics.executive_summary.placement_target}`}
          icon={<Users className="w-5 h-5" />}
          change={metrics.crm.trend}
        />
        
        <KPICard
          title="Team Productivity"
          value={`${metrics.executive_summary.team_productivity_avg}%`}
          subtitle={`${metrics.productivity.high_performers} high performers`}
          icon={<Activity className="w-5 h-5" />}
          change={metrics.productivity.trend}
        />
        
        <KPICard
          title="Students Enrolled"
          value={metrics.executive_summary.students_enrolled.toString()}
          subtitle={`${metrics.executive_summary.students_completion_rate}% completion`}
          icon={<GraduationCap className="w-5 h-5" />}
          change={metrics.academy.trend}
        />
      </div>

      {/* AI Insights Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Insights & Recommendations
          </CardTitle>
          <CardDescription>
            Data-driven insights generated from cross-module analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.insights.length > 0 ? (
              metrics.insights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Generating insights... Check back soon.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottleneck Alerts */}
      {metrics.bottlenecks && metrics.bottlenecks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="w-5 h-5" />
              Active Bottlenecks ({metrics.bottlenecks.length})
            </CardTitle>
            <CardDescription className="text-orange-600">
              Workflows requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.bottlenecks.map(bottleneck => (
                <BottleneckAlert key={bottleneck.id} bottleneck={bottleneck} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Department Deep Dives */}
      <Card>
        <CardHeader>
          <CardTitle>Department Analytics</CardTitle>
          <CardDescription>
            Detailed metrics by function
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="academy">Academy</TabsTrigger>
              <TabsTrigger value="recruiting">Recruiting</TabsTrigger>
              <TabsTrigger value="bench">Bench Sales</TabsTrigger>
              <TabsTrigger value="hr">Team</TabsTrigger>
              <TabsTrigger value="productivity">Productivity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <OverviewMetrics metrics={metrics} />
            </TabsContent>

            <TabsContent value="academy" className="space-y-4 mt-4">
              <AcademyDeepDive data={metrics.academy} />
            </TabsContent>

            <TabsContent value="recruiting" className="space-y-4 mt-4">
              <RecruitingDeepDive data={metrics.crm} />
            </TabsContent>

            <TabsContent value="bench" className="space-y-4 mt-4">
              <BenchSalesDeepDive data={metrics.hr} />
            </TabsContent>

            <TabsContent value="hr" className="space-y-4 mt-4">
              <HRDeepDive data={metrics.hr} />
            </TabsContent>

            <TabsContent value="productivity" className="space-y-4 mt-4">
              <ProductivityDeepDive data={metrics.productivity} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Real-Time Production Line */}
      <Card>
        <CardHeader>
          <CardTitle>Live Production Line</CardTitle>
          <CardDescription>
            Real-time workflow visualization across all pods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductionLineVisualization
            activeWorkflows={metrics.platform.active_workflows}
            completedMTD={metrics.platform.completed_workflows_mtd}
            overdueWorkflows={metrics.platform.overdue_workflows}
            realtime={true}
          />
        </CardContent>
      </Card>

      {/* Correlations & Predictive Analytics */}
      {metrics.correlations && metrics.correlations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Predictive Analytics</CardTitle>
            <CardDescription>
              Statistical correlations and forecasts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.correlations.map((corr, idx) => (
                <CorrelationCard key={idx} correlation={corr} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  target?: string;
  change?: number;
  trend?: number;
  icon?: React.ReactNode;
}

function KPICard({ title, value, subtitle, target, change, trend, icon }: KPICardProps) {
  const trendColor = (trend || change || 0) >= 0 ? 'text-green-600' : 'text-red-600';
  const trendValue = trend || change || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {target && (
          <p className="text-xs text-muted-foreground mt-1">{target}</p>
        )}
        {trendValue !== 0 && (
          <p className={`text-xs mt-1 ${trendColor}`}>
            {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface InsightCardProps {
  insight: any;
}

function InsightCard({ insight }: InsightCardProps) {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const typeIcons = {
    opportunity: '🎯',
    risk: '⚠️',
    trend: '📈',
    recommendation: '💡'
  };

  return (
    <Alert>
      <AlertTitle className="flex items-center gap-2">
        <span>{typeIcons[insight.type] || '📊'}</span>
        {insight.title}
        <Badge className={priorityColors[insight.priority] || priorityColors.medium}>
          {insight.priority}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p>{insight.message}</p>
        {insight.suggested_action && (
          <p className="mt-2 text-sm font-medium">
            💡 Action: {insight.suggested_action}
          </p>
        )}
        {insight.impact_estimate && (
          <p className="mt-1 text-sm text-muted-foreground">
            Impact: {insight.impact_estimate}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface BottleneckAlertProps {
  bottleneck: any;
}

function BottleneckAlert({ bottleneck }: BottleneckAlertProps) {
  const severityColors = {
    low: 'border-blue-200 bg-blue-50',
    medium: 'border-yellow-200 bg-yellow-50',
    high: 'border-orange-200 bg-orange-50',
    critical: 'border-red-200 bg-red-50'
  };

  return (
    <div className={`p-4 rounded-lg border ${severityColors[bottleneck.severity]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold">{bottleneck.workflow_name}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Pod: {bottleneck.pod_name} • Stage: {bottleneck.stuck_stage}
          </p>
          <p className="text-sm mt-2">
            ⏱️ Stuck for {Math.round(bottleneck.stuck_duration_hours)} hours
          </p>
          {bottleneck.ai_suggestion && (
            <div className="mt-3 p-3 bg-white/50 rounded border">
              <p className="text-sm font-medium">AI Suggestion:</p>
              <p className="text-sm mt-1">{bottleneck.ai_suggestion}</p>
            </div>
          )}
        </div>
        <Badge variant={bottleneck.severity === 'critical' ? 'destructive' : 'secondary'}>
          {bottleneck.severity}
        </Badge>
      </div>
    </div>
  );
}

interface CorrelationCardProps {
  correlation: any;
}

function CorrelationCard({ correlation }: CorrelationCardProps) {
  const strength = Math.abs(correlation.correlation_strength);
  const strengthLabel = 
    strength > 0.7 ? 'Strong' :
    strength > 0.5 ? 'Moderate' :
    'Weak';

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold">
            {correlation.factor1} ↔ {correlation.factor2}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {correlation.description}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Sample size: {correlation.sample_size} data points
          </p>
        </div>
        <div className="text-right">
          <Badge>{strengthLabel}</Badge>
          <p className="text-sm mt-1">{(correlation.correlation_strength * 100).toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
}

function OverviewMetrics({ metrics }: { metrics: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Month to Date</span>
              <span className="font-semibold">{formatCurrency(metrics.crm.revenue_mtd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Year to Date</span>
              <span className="font-semibold">{formatCurrency(metrics.crm.revenue_ytd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pipeline Value</span>
              <span className="font-semibold">{formatCurrency(metrics.crm.pipeline_value)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Employees</span>
              <span className="font-semibold">{metrics.hr.total_employees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active</span>
              <span className="font-semibold">{metrics.hr.active_employees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bench Consultants</span>
              <span className="font-semibold">{metrics.hr.bench_consultants}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AcademyDeepDive({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <MetricBox label="Active Students" value={data.active_students} />
        <MetricBox label="Completion Rate" value={`${data.completion_rate}%`} />
        <MetricBox label="Avg Completion Time" value={`${data.avg_completion_time_days} days`} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.top_products?.map((product: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm">{product.name}</span>
                <Badge>{product.enrollments} students</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RecruitingDeepDive({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <MetricBox label="Active Jobs" value={data.active_jobs} />
        <MetricBox label="Placements (MTD)" value={data.placements_mtd} />
        <MetricBox label="Avg Time to Fill" value={`${data.avg_time_to_fill_days} days`} />
        <MetricBox label="Fill Rate" value={`${data.fill_rate}%`} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <MetricBox label="Active Candidates" value={data.active_candidates} />
        <MetricBox label="Active Clients" value={data.active_clients} />
      </div>
    </div>
  );
}

function BenchSalesDeepDive({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <MetricBox label="Available Consultants" value={data.bench_consultants} />
        <MetricBox label="Avg Productivity" value={`${data.avg_productivity_score}%`} />
        <MetricBox label="Attendance Rate" value={`${data.attendance_rate}%`} />
      </div>
      
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Bench Optimization</AlertTitle>
        <AlertDescription>
          {data.bench_consultants} consultants ready for placement.
          Target: Convert 80% within 30 days.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function HRDeepDive({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <MetricBox label="Total Employees" value={data.total_employees} />
        <MetricBox label="Attendance Rate" value={`${data.attendance_rate}%`} />
        <MetricBox label="Avg Productivity" value={`${data.avg_productivity_score}%`} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Leave Requests</span>
                <Badge>{data.leave_requests_pending}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Expense Claims</span>
                <Badge>{data.expense_claims_pending}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Team Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Avg Tenure</span>
                <span className="font-semibold">{data.avg_tenure_months} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Turnover Rate</span>
                <span className="font-semibold">{data.turnover_rate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductivityDeepDive({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <MetricBox label="Avg Score" value={`${data.avg_score}%`} />
        <MetricBox label="High Performers" value={data.high_performers} />
        <MetricBox label="Low Performers" value={data.low_performers} />
        <MetricBox label="Productivity Rate" value={`${data.productivity_rate}%`} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.top_applications?.map((app: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm">{app.name}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(app.time_minutes)} min
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductionLineVisualization({
  activeWorkflows,
  completedMTD,
  overdueWorkflows,
  realtime
}: {
  activeWorkflows: number;
  completedMTD: number;
  overdueWorkflows: number;
  realtime: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{activeWorkflows}</p>
          <p className="text-sm text-blue-600">Active Workflows</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{completedMTD}</p>
          <p className="text-sm text-green-600">Completed (MTD)</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
          <p className="text-2xl font-bold text-orange-700">{overdueWorkflows}</p>
          <p className="text-sm text-orange-600">Overdue</p>
        </div>
      </div>
      
      {realtime && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Real-time updates active</span>
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

// ============================================================================
// UTILITIES
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

