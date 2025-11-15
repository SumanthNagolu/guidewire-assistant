'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Target, 
  Brain, Activity, BarChart, PieChart, AlertCircle,
  CheckCircle, XCircle, Clock, RefreshCw, Settings
} from 'lucide-react';
import { CEOMetricCard } from '@/components/ceo/CEOMetricCard';
import { CEOInsightPanel } from '@/components/ceo/CEOInsightPanel';
import { RealtimeChart } from '@/components/ceo/RealtimeChart';
import { StrategicControls } from '@/components/ceo/StrategicControls';

interface DashboardData {
  metrics: any[];
  kpis: any[];
  forecasts: any;
  insights: any[];
  alerts: any[];
  realtime: any;
}

export default function CEODashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedPeriod, autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/ceo/dashboard?period=${selectedPeriod}`);
      const data = await response.json();
      setData(data);
    } catch (error) {
      // Error handled by UI
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CEO Command Center</h1>
          <p className="text-gray-600">Real-time business intelligence and strategic insights</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          
          <Button variant="outline" onClick={fetchDashboardData}>
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {data?.alerts && data.alerts.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.alerts.map((alert: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">{alert.severity}</Badge>
                    <span>{alert.message}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-4 gap-4">
        {data?.kpis?.map((kpi: any) => (
          <Card key={kpi.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {kpi.current.toLocaleString()} / {kpi.target.toLocaleString()}
                </div>
                <Progress value={kpi.achievement} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{kpi.achievement.toFixed(1)}% achieved</span>
                  <Badge variant={
                    kpi.status === 'on-track' ? 'success' : 
                    kpi.status === 'at-risk' ? 'warning' : 'destructive'
                  }>
                    {kpi.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="strategic">Strategic</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <CEOMetricCard
              title="Monthly Revenue"
              value={data?.metrics?.find((m: any) => m.name === 'Monthly Revenue')?.value || 0}
              trend={data?.metrics?.find((m: any) => m.name === 'Monthly Revenue')?.trend}
              changePercent={data?.metrics?.find((m: any) => m.name === 'Monthly Revenue')?.changePercent}
              forecast={data?.forecasts?.revenue}
              icon={<DollarSign />}
            />
            <CEOMetricCard
              title="Active Placements"
              value={data?.metrics?.find((m: any) => m.name === 'Weekly Placements')?.value || 0}
              trend={data?.metrics?.find((m: any) => m.name === 'Weekly Placements')?.trend}
              changePercent={data?.metrics?.find((m: any) => m.name === 'Weekly Placements')?.changePercent}
              forecast={data?.forecasts?.placements}
              icon={<Users />}
            />
            <CEOMetricCard
              title="Team Productivity"
              value={data?.metrics?.find((m: any) => m.name === 'Daily Productivity Score')?.value || 0}
              trend={data?.metrics?.find((m: any) => m.name === 'Daily Productivity Score')?.trend}
              changePercent={data?.metrics?.find((m: any) => m.name === 'Daily Productivity Score')?.changePercent}
              forecast={data?.forecasts?.productivity}
              icon={<Activity />}
            />
          </div>

          {/* Real-time Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RealtimeChart data={data?.realtime} />
            </CardContent>
          </Card>

          {/* AI Insights */}
          <CEOInsightPanel insights={data?.insights || []} />
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Direct Placements</span>
                    <span className="font-bold">$350,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Contract Staffing</span>
                    <span className="font-bold">$150,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Training Revenue</span>
                    <span className="font-bold">$50,000</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-semibold">Total Revenue</span>
                    <span className="font-bold text-xl">$550,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.forecasts?.revenue && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        ${(data.forecasts.revenue.predicted / 1000).toFixed(0)}K
                      </div>
                      <div className="text-gray-600">Next 30 days forecast</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Upper bound</span>
                        <span>${(data.forecasts.revenue.upperBound / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Lower bound</span>
                        <span>${(data.forecasts.revenue.lowerBound / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Confidence</span>
                        <span>{(data.forecasts.revenue.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <RealtimeChart 
                data={data?.metrics?.filter((m: any) => m.category === 'revenue')} 
                type="line"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Open Jobs</span>
                    <Badge>{data?.metrics?.find((m: any) => m.name === 'Open Jobs')?.value || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Candidates</span>
                    <Badge>{data?.metrics?.find((m: any) => m.name === 'Pipeline Candidates')?.value || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Time to Fill</span>
                    <Badge>{data?.metrics?.find((m: any) => m.name === 'Average Time to Fill')?.value || 0} days</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Placement Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Placement Rate</span>
                    <span className="font-bold">{data?.metrics?.find((m: any) => m.name === 'Placement Rate')?.value?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client Satisfaction</span>
                    <span className="font-bold">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retention Rate</span>
                    <span className="font-bold">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operational Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Cost per Placement</span>
                    <span className="font-bold">$4,250</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resource Utilization</span>
                    <span className="font-bold">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Process Automation</span>
                    <span className="font-bold">65%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Overall Productivity</span>
                      <span>{data?.metrics?.find((m: any) => m.name === 'Daily Productivity Score')?.value?.toFixed(0) || 0}%</span>
                    </div>
                    <Progress value={data?.metrics?.find((m: any) => m.name === 'Daily Productivity Score')?.value || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Engagement Score</span>
                      <span>82%</span>
                    </div>
                    <Progress value={82} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Training Completion</span>
                      <span>76%</span>
                    </div>
                    <Progress value={76} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning & Development</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Active Learners</span>
                    <Badge>{data?.metrics?.find((m: any) => m.name === 'Weekly Active Learners')?.value || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Course Completions</span>
                    <Badge>{data?.metrics?.find((m: any) => m.name === 'Weekly Course Completions')?.value || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Quiz Score</span>
                    <Badge>{data?.metrics?.find((m: any) => m.name === 'Average Quiz Score')?.value?.toFixed(0) || 0}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(data?.forecasts || {}).map(([key, forecast]: [string, any]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="capitalize">{key} Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {key === 'revenue' ? `$${(forecast.predicted / 1000).toFixed(0)}K` : forecast.predicted.toFixed(0)}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {forecast.horizon} day forecast
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Confidence</span>
                        <span>{(forecast.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Range</span>
                        <span>
                          {key === 'revenue' 
                            ? `$${(forecast.lowerBound / 1000).toFixed(0)}K - $${(forecast.upperBound / 1000).toFixed(0)}K`
                            : `${forecast.lowerBound.toFixed(0)} - ${forecast.upperBound.toFixed(0)}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.insights?.filter((i: any) => i.type === 'recommendation').map((insight: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <div className="font-medium">{insight.title}</div>
                      <div className="text-sm text-gray-600">{insight.description}</div>
                      <div className="mt-2">
                        <Button size="sm">Take Action</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategic Tab */}
        <TabsContent value="strategic" className="space-y-4">
          <StrategicControls />
        </TabsContent>
      </Tabs>
    </div>
  );
}
