'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Clock, LogIn, LogOut, Activity, Monitor, Globe, 
  BarChart3, RefreshCw, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AIWorkSummary from './AIWorkSummary';
import ScreenshotGallery from './ScreenshotGallery';
import ApplicationUsage from './ApplicationUsage';
import ContextSummaries from './ContextSummaries';

interface EmployeeDashboardProps {
  currentUserId: string;
}

export default function EmployeeDashboard({ currentUserId }: EmployeeDashboardProps) {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user') || currentUserId;
  const [userData, setUserData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('today');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    if (userId) {
      loadUserData();
      
      if (autoRefresh) {
        const interval = setInterval(loadUserData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
      }
    }
  }, [userId, timeRange, autoRefresh]);
  
  async function loadUserData() {
    setIsLoading(true);
    
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Load presence data
      const { data: presence } = await supabase
        .from('productivity_presence')
        .select('*')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();
      
      // Load AI analyses for time range
      const timeFilter = getTimeFilter(timeRange);
      const { data: analyses } = await supabase
        .from('productivity_ai_analysis')
        .select('*')
        .eq('user_id', userId)
        .gte('analyzed_at', timeFilter.start)
        .lte('analyzed_at', timeFilter.end)
        .order('analyzed_at', { ascending: false });
      
      // Load work summary
      const { data: summary } = await supabase
        .from('productivity_work_summaries')
        .select('*')
        .eq('user_id', userId)
        .eq('time_window', timeRange)
        .eq('summary_date', new Date().toISOString().split('T')[0])
        .maybeSingle();
      
      // Load screenshots
      const { data: screenshots } = await supabase
        .from('productivity_screenshots')
        .select('*')
        .eq('user_id', userId)
        .gte('captured_at', timeFilter.start)
        .order('captured_at', { ascending: false })
        .limit(20);
      
      // Load applications
      const { data: applications } = await supabase
        .from('productivity_applications')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', timeFilter.start);
      
      setUserData({
        profile,
        presence,
        analyses,
        summary,
        screenshots,
        applications
      });
    } catch (error) {
          } finally {
      setIsLoading(false);
    }
  }
  
  function getTimeFilter(range: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case '30min':
        return {
          start: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          end: now.toISOString()
        };
      case '1hr':
        return {
          start: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
          end: now.toISOString()
        };
      case '2hr':
        return {
          start: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          end: now.toISOString()
        };
      case '4hr':
        return {
          start: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
          end: now.toISOString()
        };
      case 'today':
        return {
          start: today.toISOString(),
          end: now.toISOString()
        };
      case '1week':
        return {
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: now.toISOString()
        };
      case '1month':
        return {
          start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: now.toISOString()
        };
      default:
        return { start: today.toISOString(), end: now.toISOString() };
    }
  }
  
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-center max-w-md">
          <Sparkles className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select an Employee</h2>
          <p className="text-gray-600">Choose a team member from the sidebar to view their AI-powered productivity insights</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing productivity data...</p>
        </div>
      </div>
    );
  }
  
  const { profile, presence, analyses, summary, screenshots, applications } = userData || {};
  
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {profile?.first_name} {profile?.last_name}
          </h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">
              {profile?.industry_role?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Employee'}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{profile?.email}</span>
          </div>
        </div>
        
        <Button
          variant={autoRefresh ? "default" : "outline"}
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", autoRefresh && "animate-spin")} />
          Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
        </Button>
      </div>
      
      {/* Time Range Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Time Range:</span>
        <div className="flex gap-1">
          {['30min', '1hr', '2hr', '4hr', 'today', '1week', '1month'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === 'today' ? 'Today' : range === '1week' ? '1 Week' : range === '1month' ? '1 Month' : range}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Presence Card */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <LogIn className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-600 font-medium">Login Time</p>
                <p className="text-xl font-bold text-gray-900">
                  {presence?.first_seen_at 
                    ? new Date(presence.first_seen_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      hour12: true 
                    })
                    : '—'}
                </p>
                <p className="text-xs text-gray-500">First screenshot of day</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-600 font-medium">Idle Time</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatMinutesToTime(
                    presence?.work_pattern?.idle_periods?.reduce((sum: number, p: any) => sum + (p.minutes || 0), 0) || 0
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {presence?.current_status === 'idle'
                    ? '⚠️ Currently idle'
                    : presence?.last_seen_at && (Date.now() - new Date(presence.last_seen_at).getTime()) > 120000
                    ? '⚠️ No activity > 2min'
                    : 'Active'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-600 font-medium">Active Time</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatMinutesToTime(presence?.total_active_minutes || 0)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-600 font-medium">Status</p>
                <p className={cn(
                  "text-xl font-bold",
                  presence?.current_status === 'active' ? 'text-green-600' :
                  presence?.current_status === 'idle' ? 'text-yellow-600' :
                  'text-gray-500'
                )}>
                  {presence?.current_status?.toUpperCase() || 'OFFLINE'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="summaries" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summaries">AI Summaries</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summaries" className="space-y-4">
          <ContextSummaries userId={userId} />
        </TabsContent>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Work Summary */}
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Sparkles className="w-5 h-5" />
                  AI Work Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AIWorkSummary 
                  summary={summary}
                  analyses={analyses}
                  timeRange={timeRange}
                  userRole={profile?.industry_role}
                />
              </CardContent>
            </Card>
            
            {/* Recent Screenshots Preview */}
            <Card className="shadow-lg border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Monitor className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ScreenshotGallery 
                  screenshots={screenshots?.slice(0, 4)}
                  analyses={analyses}
                  userId={userId}
                  compact={true}
                />
              </CardContent>
            </Card>
            
            {/* Top Applications */}
            <Card className="shadow-lg border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <BarChart3 className="w-5 h-5" />
                  Top Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ApplicationUsage 
                  applications={applications}
                  analyses={analyses}
                  limit={5}
                />
              </CardContent>
            </Card>
            
            {/* Activity Breakdown */}
            <Card className="shadow-lg border-orange-100">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Activity className="w-5 h-5" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {summary?.category_breakdown ? (
                  <div className="space-y-3">
                    {Object.entries(summary.category_breakdown as Record<string, number>)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([category, minutes]) => (
                        <div key={category}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium capitalize">
                              {category.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-600">
                              {Math.round(minutes as number)} min
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (minutes as number / (summary.total_productive_minutes || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No activity data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="screenshots">
          <Card>
            <CardHeader>
              <CardTitle>Screenshot Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScreenshotGallery 
                screenshots={screenshots}
                analyses={analyses}
                userId={userId}
                fullView={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Application Usage Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationUsage 
                applications={applications}
                analyses={analyses}
                detailed={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Advanced analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

