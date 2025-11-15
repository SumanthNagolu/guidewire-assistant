"use client";
import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  DollarSign,
} from 'lucide-react';
export default function AnalyticsPage() {
  const { supabase } = useSupabase();
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalPlacements: 0,
    placementGrowth: 0,
    avgTimeToFill: 0,
    timeToFillTrend: 0,
    submissionToInterviewRate: 0,
    interviewToOfferRate: 0,
    revenue: 0,
    revenueTrend: 0,
  });
  const [productionData, setProductionData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [podPerformance, setPodPerformance] = useState<any[]>([]);
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate fetching analytics data
      // In production, this would fetch real data from the database
      // Production line data (workflows over time)
      const productionLineData = [
        { date: 'Mon', active: 12, completed: 8, failed: 1 },
        { date: 'Tue', active: 15, completed: 10, failed: 2 },
        { date: 'Wed', active: 18, completed: 12, failed: 1 },
        { date: 'Thu', active: 14, completed: 15, failed: 0 },
        { date: 'Fri', active: 20, completed: 18, failed: 1 },
        { date: 'Sat', active: 8, completed: 5, failed: 0 },
        { date: 'Sun', active: 5, completed: 3, failed: 0 },
      ];
      setProductionData(productionLineData);
      // Performance trends
      const performanceTrends = [
        { month: 'Jan', placements: 12, submissions: 120, interviews: 45 },
        { month: 'Feb', placements: 15, submissions: 135, interviews: 52 },
        { month: 'Mar', placements: 18, submissions: 142, interviews: 58 },
        { month: 'Apr', placements: 22, submissions: 165, interviews: 68 },
        { month: 'May', placements: 20, submissions: 155, interviews: 62 },
        { month: 'Jun', placements: 25, submissions: 180, interviews: 75 },
      ];
      setPerformanceData(performanceTrends);
      // Source effectiveness
      const sourceEffectiveness = [
        { name: 'Internal DB', value: 35, color: '#3b82f6' },
        { name: 'LinkedIn', value: 28, color: '#8b5cf6' },
        { name: 'Dice', value: 15, color: '#10b981' },
        { name: 'Indeed', value: 12, color: '#f59e0b' },
        { name: 'Referrals', value: 10, color: '#ef4444' },
      ];
      setSourceData(sourceEffectiveness);
      // Pod performance comparison
      const podData = [
        { name: 'Alpha Pod', efficiency: 85, placements: 8, target: 10 },
        { name: 'Beta Pod', efficiency: 72, placements: 6, target: 8 },
        { name: 'Gamma Pod', efficiency: 90, placements: 10, target: 10 },
        { name: 'Delta Pod', efficiency: 68, placements: 5, target: 8 },
      ];
      setPodPerformance(podData);
      // Calculate metrics
      setMetrics({
        totalPlacements: 25,
        placementGrowth: 15.5,
        avgTimeToFill: 18,
        timeToFillTrend: -12,
        submissionToInterviewRate: 38,
        interviewToOfferRate: 42,
        revenue: 125000,
        revenueTrend: 22,
      });
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const MetricCard = ({ 
    title, 
    value, 
    trend, 
    trendValue, 
    icon: Icon, 
    format = 'number' 
  }: {
    title: string;
    value: number;
    trend?: 'up' | 'down';
    trendValue?: number;
    icon: any;
    format?: 'number' | 'currency' | 'percentage' | 'days';
  }) => {
    const formatValue = () => {
      switch (format) {
        case 'currency':
          return `$${value.toLocaleString()}`;
        case 'percentage':
          return `${value}%`;
        case 'days':
          return `${value} days`;
        default:
          return value.toLocaleString();
      }
    };
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue()}</div>
          {trend && trendValue !== undefined && (
            <div className="flex items-center text-xs mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(trendValue)}% from last {timeRange}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time production metrics and performance analytics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Placements"
          value={metrics.totalPlacements}
          trend="up"
          trendValue={metrics.placementGrowth}
          icon={CheckCircle}
        />
        <MetricCard
          title="Avg Time to Fill"
          value={metrics.avgTimeToFill}
          trend="down"
          trendValue={metrics.timeToFillTrend}
          icon={Clock}
          format="days"
        />
        <MetricCard
          title="Interview Rate"
          value={metrics.submissionToInterviewRate}
          trend="up"
          trendValue={8}
          icon={Users}
          format="percentage"
        />
        <MetricCard
          title="Revenue"
          value={metrics.revenue}
          trend="up"
          trendValue={metrics.revenueTrend}
          icon={DollarSign}
          format="currency"
        />
      </div>
      {/* Analytics Tabs */}
      <Tabs defaultValue="production" className="space-y-4">
        <TabsList>
          <TabsTrigger value="production">Production Line</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sources">Source Analysis</TabsTrigger>
          <TabsTrigger value="pods">Pod Comparison</TabsTrigger>
        </TabsList>
        {/* Production Line Tab */}
        <TabsContent value="production">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Production Line</CardTitle>
              <CardDescription>
                Real-time view of workflow throughput and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Completed"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="active" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Active"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="failed" 
                    stackId="1" 
                    stroke="#ef4444" 
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Failed"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Throughput Rate</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">87%</div>
                    <Progress value={87} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Avg Cycle Time</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.2 days</div>
                    <p className="text-xs text-muted-foreground mt-1">-18% from last week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Bottleneck Rate</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5%</div>
                    <p className="text-xs text-muted-foreground mt-1">3 active bottlenecks</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Key performance indicators over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="submissions"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Submissions"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="interviews"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Interviews"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="placements"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Placements"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="grid gap-4 md:grid-cols-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Submission Rate</p>
                  <p className="text-2xl font-bold">150/mo</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Interview Rate</p>
                  <p className="text-2xl font-bold">38%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Offer Rate</p>
                  <p className="text-2xl font-bold">42%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                  <p className="text-2xl font-bold">85%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Source Analysis Tab */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Source Analysis</CardTitle>
              <CardDescription>
                Effectiveness of different sourcing channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Source Effectiveness Metrics</h4>
                  {sourceData.map((source) => (
                    <div key={source.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{source.name}</span>
                        <span className="text-sm text-muted-foreground">{source.value}%</span>
                      </div>
                      <Progress value={source.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Best Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">Internal DB</p>
                    <p className="text-xs text-muted-foreground">35% of placements</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Fastest Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">Referrals</p>
                    <p className="text-xs text-muted-foreground">12 days avg</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Cost per Hire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">$2,450</p>
                    <p className="text-xs text-muted-foreground">-15% from last month</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Pod Comparison Tab */}
        <TabsContent value="pods">
          <Card>
            <CardHeader>
              <CardTitle>Pod Performance Comparison</CardTitle>
              <CardDescription>
                Compare performance metrics across different pods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={podPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency %" />
                  <Bar dataKey="placements" fill="#10b981" name="Placements" />
                  <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid gap-4 md:grid-cols-4 mt-6">
                {podPerformance.map((pod) => (
                  <Card key={pod.name}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{pod.name}</CardTitle>
                        {pod.efficiency >= 80 ? (
                          <Award className="h-4 w-4 text-yellow-500" />
                        ) : pod.efficiency >= 70 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{pod.efficiency}%</div>
                      <Progress value={pod.efficiency} className="mt-2" />
                      <div className="flex justify-between text-xs mt-2">
                        <span>Placements: {pod.placements}</span>
                        <span>Target: {pod.target}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
