/**
 * UNIFIED PLATFORM DASHBOARD
 * The central command center showing all integrated systems
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  Activity,
  Target,
  Brain,
  Award,
  Clock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardMetrics {
  academy: {
    activeStudents: number;
    completions30d: number;
    avgTimePerTopic: number;
    popularTopics: string[];
  };
  hr: {
    totalEmployees: number;
    activeEmployees: number;
    newHires30d: number;
    departments: number;
  };
  productivity: {
    avgProductivityScore: number;
    totalTrackedHours: number;
    productivityTrend: string;
  };
  crm: {
    totalCandidates: number;
    activeJobs: number;
    placements30d: number;
    placementRate: number;
  };
  workflow: {
    activeWorkflows: number;
    completedWorkflows: number;
    avgCompletionTime: number;
    bottlenecks: string[];
  };
  revenue: {
    monthlyRevenue: number;
    avgMargin: number;
    revenuePerPlacement: number;
    projectedAnnual: number;
  };
}

export default function UnifiedDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const supabase = createClient();
  
  useEffect(() => {
    loadDashboard();
    subscribeToRealtime();
  }, []);
  
  async function loadDashboard() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get user profile with roles
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*, user_roles(role_id, roles(code, name))')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);
      
      // Load dashboard metrics from CEO endpoint
      const response = await fetch('/api/ceo/dashboard');
      const data = await response.json();
      
      setMetrics(data.metrics);
      setInsights(data.insights);
    } catch (error) {
      // Error handled by UI
    } finally {
      setLoading(false);
    }
  }
  
  function subscribeToRealtime() {
    // Subscribe to system events for live updates
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_events' },
        (payload) => {
          // Real-time event received
          // Refresh relevant metrics based on event type
          if (payload.new?.event_type) {
            loadDashboard();
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }
  
  const roles = userProfile?.user_roles?.map((ur: any) => ur.roles?.code) || [];
  const isAdmin = roles.includes('admin') || roles.includes('ceo');
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Unified Platform Dashboard</h1>
          <p className="text-gray-600">All systems integrated as one organism</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Logged in as</p>
          <p className="font-semibold">{userProfile?.email}</p>
          <p className="text-sm text-blue-600">
            {userProfile?.user_roles?.map((ur: any) => ur.roles?.name).join(', ')}
          </p>
        </div>
      </div>
      
      {/* AI Insights Banner */}
      {insights && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start gap-4">
            <Brain className="h-6 w-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">AI Strategic Insights</h3>
              <p className="text-gray-700 whitespace-pre-line">{insights}</p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Academy Metrics */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <span className="text-xs text-gray-500">Academy</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{metrics?.academy.activeStudents || 0}</p>
            <p className="text-sm text-gray-600">Active Students</p>
            <p className="text-xs text-green-600">
              +{metrics?.academy.completions30d || 0} completions (30d)
            </p>
          </div>
        </Card>
        
        {/* HR Metrics */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-green-600" />
            <span className="text-xs text-gray-500">HR</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{metrics?.hr.activeEmployees || 0}</p>
            <p className="text-sm text-gray-600">Active Employees</p>
            <p className="text-xs text-green-600">
              +{metrics?.hr.newHires30d || 0} new hires (30d)
            </p>
          </div>
        </Card>
        
        {/* Productivity Metrics */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-gray-500">Productivity</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{metrics?.productivity.avgProductivityScore || 0}%</p>
            <p className="text-sm text-gray-600">Avg Score</p>
            <p className="text-xs text-purple-600">
              {metrics?.productivity.productivityTrend || 'stable'} trend
            </p>
          </div>
        </Card>
        
        {/* CRM Metrics */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="h-5 w-5 text-orange-600" />
            <span className="text-xs text-gray-500">CRM</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{metrics?.crm.placements30d || 0}</p>
            <p className="text-sm text-gray-600">Placements (30d)</p>
            <p className="text-xs text-orange-600">
              {metrics?.crm.placementRate?.toFixed(1) || 0}% success rate
            </p>
          </div>
        </Card>
        
        {/* Workflow Metrics */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-red-600" />
            <span className="text-xs text-gray-500">Workflows</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{metrics?.workflow.activeWorkflows || 0}</p>
            <p className="text-sm text-gray-600">Active Workflows</p>
            <p className="text-xs text-red-600">
              {metrics?.workflow.avgCompletionTime?.toFixed(1) || 0}h avg time
            </p>
          </div>
        </Card>
        
        {/* Revenue Metrics (Admin only) */}
        {isAdmin && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-green-700" />
              <span className="text-xs text-green-700">Revenue</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-700">
                ${(metrics?.revenue.monthlyRevenue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-green-600">Monthly Revenue</p>
              <p className="text-xs text-green-600">
                ${metrics?.revenue.avgMargin?.toFixed(2) || 0}/hr margin
              </p>
            </div>
          </Card>
        )}
      </div>
      
      {/* Integration Flows */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Live Integration Flows</h2>
        <Tabs defaultValue="pipelines" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
            <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pipelines" className="space-y-4">
            <PipelineFlow
              title="Academy → HR Pipeline"
              description="Students completing training are automatically queued for placement"
              steps={[
                { name: 'Academy Completion', status: 'active', count: 12 },
                { name: 'Skills Assessment', status: 'active', count: 8 },
                { name: 'Job Matching', status: 'active', count: 5 },
                { name: 'Client Interview', status: 'pending', count: 3 },
                { name: 'Placement', status: 'pending', count: 0 }
              ]}
            />
            
            <PipelineFlow
              title="CRM → Academy Pipeline"
              description="New candidates are enrolled in relevant training programs"
              steps={[
                { name: 'Candidate Sourced', status: 'active', count: 25 },
                { name: 'Skills Gap Analysis', status: 'active', count: 20 },
                { name: 'Academy Enrollment', status: 'active', count: 18 },
                { name: 'Training Progress', status: 'active', count: 15 },
                { name: 'Certification', status: 'pending', count: 5 }
              ]}
            />
            
            <PipelineFlow
              title="HR → Productivity Pipeline"
              description="New hires are set up with productivity tracking"
              steps={[
                { name: 'Employee Onboarded', status: 'completed', count: 0 },
                { name: 'Tools Provisioned', status: 'completed', count: 0 },
                { name: 'Goals Set', status: 'completed', count: 0 },
                { name: 'Tracking Active', status: 'active', count: 45 },
                { name: 'First Review', status: 'pending', count: 10 }
              ]}
            />
          </TabsContent>
          
          <TabsContent value="events" className="space-y-2">
            <EventStream />
          </TabsContent>
          
          <TabsContent value="bottlenecks" className="space-y-4">
            <div className="grid gap-4">
              {metrics?.workflow.bottlenecks?.map((bottleneck, i) => (
                <Card key={i} className="p-4 border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{bottleneck}</p>
                      <p className="text-sm text-gray-600">
                        Workflows stuck at this stage for &gt; 7 days
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Resolve →
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="predictions" className="space-y-4">
            <AIPredictions />
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            icon={<Users />}
            label="Add Employee"
            href="/hr/employees/new"
            color="blue"
          />
          <QuickAction
            icon={<Briefcase />}
            label="Create Job"
            href="/platform/jobs/new"
            color="green"
          />
          <QuickAction
            icon={<GraduationCap />}
            label="Enroll Student"
            href="/academy/enroll"
            color="purple"
          />
          <QuickAction
            icon={<Target />}
            label="Start Workflow"
            href="/platform/workflows/new"
            color="orange"
          />
        </div>
      </Card>
    </div>
  );
}

// Component: Pipeline Flow Visualization
function PipelineFlow({ title, description, steps }: any) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center gap-2 overflow-x-auto">
        {steps.map((step: any, i: number) => (
          <div key={i} className="flex items-center">
            <div className="text-center min-w-[100px]">
              <div className={`
                rounded-lg px-3 py-2 text-xs font-medium
                ${step.status === 'active' ? 'bg-blue-100 text-blue-700' : ''}
                ${step.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                ${step.status === 'pending' ? 'bg-gray-100 text-gray-600' : ''}
              `}>
                {step.name}
                {step.count > 0 && (
                  <span className="ml-1 font-bold">({step.count})</span>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-300" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// Component: Real-time Event Stream
function EventStream() {
  const [events, setEvents] = useState<any[]>([]);
  const supabase = createClient();
  
  useEffect(() => {
    // Load recent events
    loadEvents();
    
    // Subscribe to new events
    const channel = supabase
      .channel('event-stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'system_events' },
        (payload) => {
          setEvents(prev => [payload.new, ...prev].slice(0, 10));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  async function loadEvents() {
    const { data } = await supabase
      .from('system_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    setEvents(data || []);
  }
  
  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className={`
            w-2 h-2 rounded-full
            ${event.status === 'completed' ? 'bg-green-500' : ''}
            ${event.status === 'processing' ? 'bg-yellow-500 animate-pulse' : ''}
            ${event.status === 'pending' ? 'bg-gray-400' : ''}
            ${event.status === 'failed' ? 'bg-red-500' : ''}
          `} />
          <div className="flex-1">
            <p className="text-sm font-medium">{event.event_type}</p>
            <p className="text-xs text-gray-600">
              {event.source_module} → {event.target_modules?.join(', ')}
            </p>
          </div>
          <span className="text-xs text-gray-500">
            <Clock className="inline h-3 w-3 mr-1" />
            {new Date(event.created_at).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// Component: AI Predictions
function AIPredictions() {
  const predictions = [
    { metric: 'Placement Rate Next Month', value: '78%', change: '+5%', confidence: 0.85 },
    { metric: 'Employee Productivity', value: '82%', change: '+3%', confidence: 0.92 },
    { metric: 'Revenue Growth', value: '$125K', change: '+15%', confidence: 0.78 },
    { metric: 'Academy Completions', value: '45', change: '+12', confidence: 0.88 },
  ];
  
  return (
    <div className="grid gap-4">
      {predictions.map((pred, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{pred.metric}</p>
              <p className="text-2xl font-bold">{pred.value}</p>
              <p className="text-sm text-green-600">{pred.change} predicted</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Confidence</p>
              <div className="flex items-center gap-1">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${pred.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{(pred.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Component: Quick Action Button
function QuickAction({ icon, label, href, color }: any) {
  return (
    <a 
      href={href}
      className={`
        flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed
        hover:border-solid transition-all
        border-${color}-200 hover:border-${color}-400 hover:bg-${color}-50
      `}
    >
      <div className={`text-${color}-600`}>{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}
