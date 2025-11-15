"use client";
import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Users,
  Briefcase,
  Target,
  Trophy,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
interface DashboardStats {
  activeWorkflows: number;
  completedToday: number;
  bottlenecks: number;
  teamProductivity: number;
  activePods: number;
  todayPlacements: number;
}
interface ProductionItem {
  id: string;
  name: string;
  stage: string;
  owner: string;
  slaStatus: 'on_track' | 'at_risk' | 'overdue';
  completionPercentage: number;
}
export default function PlatformDashboard() {
  const { supabase, user } = useSupabase();
  const [stats, setStats] = useState<DashboardStats>({
    activeWorkflows: 0,
    completedToday: 0,
    bottlenecks: 0,
    teamProductivity: 0,
    activePods: 0,
    todayPlacements: 0,
  });
  const [productionLine, setProductionLine] = useState<ProductionItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      // Fetch active workflows
      const { count: activeWorkflows } = await supabase
        .from('workflow_instances')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      // Fetch completed today
      const { count: completedToday } = await supabase
        .from('workflow_instances')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', new Date().toISOString().split('T')[0]);
      // Fetch bottlenecks
      const { count: bottlenecks } = await supabase
        .from('bottleneck_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      // Fetch active pods
      const { count: activePods } = await supabase
        .from('pods')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      // Fetch production line items
      const { data: productionData } = await supabase
        .from('production_line_view')
        .select('*')
        .limit(10);
      setStats({
        activeWorkflows: activeWorkflows || 0,
        completedToday: completedToday || 0,
        bottlenecks: bottlenecks || 0,
        teamProductivity: 82,         activePods: activePods || 0,
        todayPlacements: 3,       });
      setProductionLine(productionData || []);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend,
    trendValue 
  }: {
    title: string;
    value: number | string;
    description: string;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div className={cn(
              "flex items-center text-xs",
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              {trend === 'up' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Platform Dashboard</h2>
        <p className="text-muted-foreground">
          Real-time view of your workflow operations
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Workflows"
          value={stats.activeWorkflows}
          description="Currently in progress"
          icon={Briefcase}
          trend="up"
          trendValue="12%"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          description="Workflows finished"
          icon={Target}
        />
        <StatCard
          title="Team Productivity"
          value={`${stats.teamProductivity}%`}
          description="Average score today"
          icon={TrendingUp}
          trend="up"
          trendValue="5%"
        />
        <StatCard
          title="Active Bottlenecks"
          value={stats.bottlenecks}
          description="Require attention"
          icon={AlertCircle}
        />
      </div>
      {/* Production Line */}
      <Card>
        <CardHeader>
          <CardTitle>Production Line</CardTitle>
          <CardDescription>
            Active workflows in your pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productionLine.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active workflows. Start a new workflow to see it here.
              </p>
            ) : (
              productionLine.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge
                        variant={
                          item.slaStatus === 'on_track'
                            ? 'default'
                            : item.slaStatus === 'at_risk'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {item.slaStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Stage: {item.stage} • Assigned to: {item.owner}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.completionPercentage}%</p>
                      <Progress value={item.completionPercentage} className="w-24 h-2" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {productionLine.length > 0 && (
            <div className="mt-4 text-center">
              <Link
                href="/platform/workflows"
                className="text-sm text-primary hover:underline"
              >
                View all workflows →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/platform/pods">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Manage Pods</span>
              </CardTitle>
              <CardDescription>
                {stats.activePods} active pods running
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/platform/workflows/new">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Start Workflow</span>
              </CardTitle>
              <CardDescription>
                Create a new job or candidate workflow
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/platform/gamification">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Leaderboard</span>
              </CardTitle>
              <CardDescription>
                View team rankings and achievements
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}
