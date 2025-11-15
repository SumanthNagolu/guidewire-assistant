'use client';

import React, { useMemo, useState } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Briefcase,
  Users,
  DollarSign,
  Eye,
  Download,
  MousePointerClick,
  GraduationCap,
  FileText,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnalyticsDashboardProps {
  jobsData: any[];
  candidatesData: any[];
  placementsData: any[];
  blogData: any[];
  resourcesData: any[];
  bannersData: any[];
  coursesData: any[];
  revenueData: any[];
}

export default function AnalyticsDashboard({
  jobsData,
  candidatesData,
  placementsData,
  blogData,
  resourcesData,
  bannersData,
  coursesData,
  revenueData
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('30');

  // Recruitment Metrics
  const recruitmentMetrics = useMemo(() => {
    const totalJobs = jobsData.length;
    const openJobs = jobsData.filter(j => j.status === 'open').length;
    const filledJobs = jobsData.filter(j => j.status === 'filled').length;
    const totalOpenings = jobsData.reduce((sum, j) => sum + (j.openings || 0), 0);
    const totalFilled = jobsData.reduce((sum, j) => sum + (j.filled || 0), 0);
    const fillRate = totalOpenings > 0 ? (totalFilled / totalOpenings) * 100 : 0;
    
    const avgTimeToFill = jobsData
      .filter(j => j.posted_date && j.filled_date)
      .reduce((sum, j, _, arr) => {
        const days = Math.floor(
          (new Date(j.filled_date).getTime() - new Date(j.posted_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days / arr.length;
      }, 0);

    return {
      totalJobs,
      openJobs,
      filledJobs,
      totalOpenings,
      totalFilled,
      fillRate,
      avgTimeToFill: Math.round(avgTimeToFill)
    };
  }, [jobsData]);

  // Talent Metrics
  const talentMetrics = useMemo(() => {
    const totalCandidates = candidatesData.length;
    const available = candidatesData.filter(c => c.availability_status === 'available').length;
    const placed = candidatesData.filter(c => c.availability_status === 'placed').length;
    const avgRate = candidatesData
      .filter(c => c.desired_rate_min)
      .reduce((sum, c) => sum + (c.desired_rate_min || 0), 0) / 
      candidatesData.filter(c => c.desired_rate_min).length || 0;
    const topRated = candidatesData.filter(c => c.rating && c.rating >= 4).length;
    const placementRate = totalCandidates > 0 ? (placed / totalCandidates) * 100 : 0;

    return {
      totalCandidates,
      available,
      placed,
      avgRate,
      topRated,
      placementRate
    };
  }, [candidatesData]);

  // Revenue Metrics
  const revenueMetrics = useMemo(() => {
    const totalRevenue = placementsData.reduce((sum, p) => sum + (p.margin || 0), 0);
    const activePlacements = placementsData.filter(p => p.status === 'active').length;
    const avgMargin = placementsData.length > 0 
      ? placementsData.reduce((sum, p) => sum + (p.margin || 0), 0) / placementsData.length
      : 0;
    
    // Calculate MRR (Monthly Recurring Revenue) from active placements
    const mrr = placementsData
      .filter(p => p.status === 'active')
      .reduce((sum, p) => {
        const monthlyMargin = (p.bill_rate - p.pay_rate) * 160; // Assume 160 hours/month
        return sum + monthlyMargin;
      }, 0);

    return {
      totalRevenue,
      activePlacements,
      avgMargin,
      mrr
    };
  }, [placementsData]);

  // Content Metrics
  const contentMetrics = useMemo(() => {
    const totalBlogViews = blogData.reduce((sum, b) => sum + (b.view_count || 0), 0);
    const publishedBlogs = blogData.filter(b => b.status === 'published').length;
    const totalResourceDownloads = resourcesData.reduce((sum, r) => sum + (r.download_count || 0), 0);
    const totalResourceViews = resourcesData.reduce((sum, r) => sum + (r.view_count || 0), 0);
    const resourceConversionRate = totalResourceViews > 0 
      ? (totalResourceDownloads / totalResourceViews) * 100 
      : 0;
    const publishedResources = resourcesData.filter(r => r.status === 'published').length;

    return {
      totalBlogViews,
      publishedBlogs,
      totalResourceDownloads,
      totalResourceViews,
      resourceConversionRate,
      publishedResources
    };
  }, [blogData, resourcesData]);

  // Marketing Metrics
  const marketingMetrics = useMemo(() => {
    const totalImpressions = bannersData.reduce((sum, b) => sum + (b.impression_count || 0), 0);
    const totalClicks = bannersData.reduce((sum, b) => sum + (b.click_count || 0), 0);
    const avgCtr = bannersData.length > 0
      ? bannersData.reduce((sum, b) => sum + (b.ctr || 0), 0) / bannersData.length
      : 0;
    const activeBanners = bannersData.filter(b => b.status === 'active').length;

    return {
      totalImpressions,
      totalClicks,
      avgCtr,
      activeBanners
    };
  }, [bannersData]);

  // Academy Metrics
  const academyMetrics = useMemo(() => {
    const totalCourses = coursesData.length;
    const activeCourses = coursesData.filter(c => c.status === 'active').length;
    const totalLearningHours = coursesData.reduce((sum, c) => sum + (c.estimated_hours || 0), 0);

    return {
      totalCourses,
      activeCourses,
      totalLearningHours
    };
  }, [coursesData]);

  // Metric Card Component
  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeLabel, 
    iconColor = 'text-gray-600',
    trend 
  }: {
    title: string;
    value: string | number;
    icon: any;
    change?: number;
    changeLabel?: string;
    iconColor?: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
            <p className={`text-xs ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {change > 0 ? '+' : ''}{change}% {changeLabel}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for Different Analytics Sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="academy">Academy</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={`$${Math.round(revenueMetrics.totalRevenue).toLocaleString()}`}
              icon={DollarSign}
              change={12.5}
              changeLabel="vs last month"
              iconColor="text-green-600"
              trend="up"
            />
            <MetricCard
              title="Active Placements"
              value={revenueMetrics.activePlacements}
              icon={Briefcase}
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Available Talent"
              value={talentMetrics.available}
              icon={Users}
              iconColor="text-purple-600"
            />
            <MetricCard
              title="Open Jobs"
              value={recruitmentMetrics.openJobs}
              icon={Target}
              iconColor="text-orange-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Blog Page Views"
              value={contentMetrics.totalBlogViews.toLocaleString()}
              icon={Eye}
              iconColor="text-pink-600"
            />
            <MetricCard
              title="Resource Downloads"
              value={contentMetrics.totalResourceDownloads.toLocaleString()}
              icon={Download}
              iconColor="text-teal-600"
            />
            <MetricCard
              title="Active Courses"
              value={academyMetrics.activeCourses}
              icon={GraduationCap}
              iconColor="text-indigo-600"
            />
          </div>

          {/* Quick Insights */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Fill Rate</span>
                    <span className="font-semibold">{recruitmentMetrics.fillRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={recruitmentMetrics.fillRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Placement Rate</span>
                    <span className="font-semibold">{talentMetrics.placementRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={talentMetrics.placementRate} className="h-2" />
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Time to Fill</span>
                    <span className="font-semibold">{recruitmentMetrics.avgTimeToFill} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Published Blogs</p>
                    <p className="text-2xl font-bold">{contentMetrics.publishedBlogs}</p>
                  </div>
                  <FileText className="w-8 h-8 text-pink-600" />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Resource Conv. Rate</p>
                    <p className="text-2xl font-bold">{contentMetrics.resourceConversionRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Banner Avg CTR</p>
                    <p className="text-2xl font-bold">{marketingMetrics.avgCtr.toFixed(2)}%</p>
                  </div>
                  <MousePointerClick className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recruitment Tab */}
        <TabsContent value="recruitment" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              title="Total Jobs"
              value={recruitmentMetrics.totalJobs}
              icon={Briefcase}
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Open Positions"
              value={recruitmentMetrics.openJobs}
              icon={Target}
              iconColor="text-orange-600"
            />
            <MetricCard
              title="Filled Positions"
              value={recruitmentMetrics.filledJobs}
              icon={Briefcase}
              iconColor="text-green-600"
            />
            <MetricCard
              title="Fill Rate"
              value={`${recruitmentMetrics.fillRate.toFixed(1)}%`}
              icon={TrendingUp}
              iconColor="text-purple-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Total Candidates"
              value={talentMetrics.totalCandidates}
              icon={Users}
              iconColor="text-indigo-600"
            />
            <MetricCard
              title="Available Now"
              value={talentMetrics.available}
              icon={Users}
              iconColor="text-green-600"
            />
            <MetricCard
              title="Currently Placed"
              value={talentMetrics.placed}
              icon={Briefcase}
              iconColor="text-blue-600"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recruitment Pipeline Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Openings to Filled Ratio</span>
                  <span className="text-sm text-gray-600">
                    {recruitmentMetrics.totalFilled} / {recruitmentMetrics.totalOpenings}
                  </span>
                </div>
                <Progress value={recruitmentMetrics.fillRate} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Avg Time to Fill</p>
                  <p className="text-xl font-bold">{recruitmentMetrics.avgTimeToFill} days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Placement Rate</p>
                  <p className="text-xl font-bold">{talentMetrics.placementRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={`$${Math.round(revenueMetrics.totalRevenue).toLocaleString()}`}
              icon={DollarSign}
              iconColor="text-green-600"
              change={15.3}
              changeLabel="vs last month"
              trend="up"
            />
            <MetricCard
              title="MRR"
              value={`$${Math.round(revenueMetrics.mrr).toLocaleString()}`}
              icon={TrendingUp}
              iconColor="text-purple-600"
            />
            <MetricCard
              title="Active Placements"
              value={revenueMetrics.activePlacements}
              icon={Activity}
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Avg Margin"
              value={`$${Math.round(revenueMetrics.avgMargin).toLocaleString()}`}
              icon={BarChart3}
              iconColor="text-orange-600"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Monthly revenue trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm font-medium text-green-900">Monthly Recurring Revenue</p>
                    <p className="text-xs text-green-700">From active placements</p>
                  </div>
                  <p className="text-xl font-bold text-green-900">
                    ${Math.round(revenueMetrics.mrr).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Average Placement Value</p>
                    <p className="text-xs text-blue-700">Per active placement</p>
                  </div>
                  <p className="text-xl font-bold text-blue-900">
                    ${Math.round(revenueMetrics.avgMargin).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              title="Total Blog Views"
              value={contentMetrics.totalBlogViews.toLocaleString()}
              icon={Eye}
              iconColor="text-pink-600"
            />
            <MetricCard
              title="Published Blogs"
              value={contentMetrics.publishedBlogs}
              icon={FileText}
              iconColor="text-purple-600"
            />
            <MetricCard
              title="Resource Downloads"
              value={contentMetrics.totalResourceDownloads.toLocaleString()}
              icon={Download}
              iconColor="text-teal-600"
            />
            <MetricCard
              title="Conversion Rate"
              value={`${contentMetrics.resourceConversionRate.toFixed(1)}%`}
              icon={TrendingUp}
              iconColor="text-green-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Blog Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Published</span>
                  <span className="font-semibold">{contentMetrics.publishedBlogs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Views</span>
                  <span className="font-semibold">{contentMetrics.totalBlogViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Views per Post</span>
                  <span className="font-semibold">
                    {contentMetrics.publishedBlogs > 0 
                      ? Math.round(contentMetrics.totalBlogViews / contentMetrics.publishedBlogs).toLocaleString()
                      : 0
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Published Resources</span>
                  <span className="font-semibold">{contentMetrics.publishedResources}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Downloads</span>
                  <span className="font-semibold">{contentMetrics.totalResourceDownloads.toLocaleString()}</span>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="font-semibold">{contentMetrics.resourceConversionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={contentMetrics.resourceConversionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Banner Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Impressions</p>
                  <p className="text-2xl font-bold">{marketingMetrics.totalImpressions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Clicks</p>
                  <p className="text-2xl font-bold">{marketingMetrics.totalClicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Average CTR</p>
                  <p className="text-2xl font-bold">{marketingMetrics.avgCtr.toFixed(2)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academy Tab */}
        <TabsContent value="academy" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Total Courses"
              value={academyMetrics.totalCourses}
              icon={GraduationCap}
              iconColor="text-indigo-600"
            />
            <MetricCard
              title="Active Courses"
              value={academyMetrics.activeCourses}
              icon={Activity}
              iconColor="text-green-600"
            />
            <MetricCard
              title="Total Learning Hours"
              value={academyMetrics.totalLearningHours}
              icon={Clock}
              iconColor="text-purple-600"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Learning Engagement</CardTitle>
              <CardDescription>
                Academy performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Courses</span>
                  <Badge variant="default">{academyMetrics.activeCourses}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Learning Hours</span>
                  <span className="font-semibold">{academyMetrics.totalLearningHours}h</span>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Course Activation Rate</span>
                    <span className="font-semibold">
                      {academyMetrics.totalCourses > 0 
                        ? ((academyMetrics.activeCourses / academyMetrics.totalCourses) * 100).toFixed(1)
                        : 0
                      }%
                    </span>
                  </div>
                  <Progress 
                    value={academyMetrics.totalCourses > 0 
                      ? (academyMetrics.activeCourses / academyMetrics.totalCourses) * 100 
                      : 0
                    } 
                    className="h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


