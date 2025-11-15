"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { logger } from "@/lib/utils/logger";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  today_metrics: {
    resumes_sourced?: number;
    calls_made?: number;
    submissions_made?: number;
  };
  target_met: boolean;
}

interface PodMetrics {
  placements_count: number;
  placements_target: number;
  interviews_count: number;
  interviews_target: number;
  submissions_count: number;
  revenue: number;
  health_score: number;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  entity_id: string;
  created_at: string;
}

export default function PodManagerDashboard() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [metrics, setMetrics] = useState<PodMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [podId, setPodId] = useState<string | null>(null);
  const [podName, setPodName] = useState('');
  const supabase = useMemo(() => createClient(), []);

  const loadDashboard = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Find pod where this user is manager
      const { data: podData } = await supabase
        .from("pods" as any)
        .select("id, name, type, target_placements_per_sprint, target_interviews_per_sprint")
        .eq("manager_id", user.id)
        .single() as any;

      if (!podData) {
        setLoading(false);
        return;
      }

      setPodId(podData.id);
      setPodName(podData.name);

      // Load team members
      const { data: membersData } = await supabase
        .from("pod_members" as any)
        .select(`
          id,
          user_id,
          role,
          user:user_profiles (
            first_name,
            last_name,
            email
          )
        `)
        .eq("pod_id", podData.id)
        .eq("is_active", true) as any;

      // Enrich with today's metrics
      const teamWithMetrics = await Promise.all(
        (membersData || []).map(async (member: any) => {
          const { data: metrics } = await supabase
            .from("daily_metrics" as any)
            .select("resumes_sourced, calls_made, submissions_made")
            .eq("user_id", member.user_id)
            .eq("metric_date", new Date().toISOString().split("T")[0])
            .single() as any;

          // Determine if target met based on role
          let targetMet = false;
          if (member.role === "sourcer" && metrics?.resumes_sourced >= 30) targetMet = true;
          if (member.role === "screener" && metrics?.calls_made >= 40) targetMet = true;
          if (member.role === "account_manager" && metrics?.submissions_made >= 5) targetMet = true;

          return {
            ...member,
            today_metrics: metrics || {},
            target_met: targetMet,
          };
        })
      );

      setTeam(teamWithMetrics);

      // Load pod metrics
      const { count: placementsCount } = await supabase
        .from("placements" as any)
        .select("*", { count: "exact", head: true })
        .gte("start_date", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .eq("status", "active") as any;

      const { count: interviewsCount } = await supabase
        .from("interviews" as any)
        .select("*", { count: "exact", head: true })
        .gte("scheduled_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()) as any;

      const { count: submissionsCount } = await supabase
        .from("applications" as any)
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted")
        .gte("submitted_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()) as any;

      const { data: revenueData } = await supabase
        .from("daily_metrics" as any)
        .select("revenue_generated")
        .eq("pod_id", podData.id)
        .gte("metric_date", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]) as any;

      const revenue = revenueData?.reduce((sum: number, m: any) => sum + (parseFloat(m.revenue_generated) || 0), 0) || 0;

      const placementProgress = (placementsCount || 0) / podData.target_placements_per_sprint;
      const interviewProgress = (interviewsCount || 0) / podData.target_interviews_per_sprint;
      const healthScore = Math.round(((placementProgress + interviewProgress) / 2) * 100);

      setMetrics({
        placements_count: placementsCount || 0,
        placements_target: podData.target_placements_per_sprint,
        interviews_count: interviewsCount || 0,
        interviews_target: podData.target_interviews_per_sprint,
        submissions_count: submissionsCount || 0,
        revenue,
        health_score: healthScore,
      });

      // Load alerts for this pod
      const { data: alertsData } = await supabase
        .from("bottleneck_alerts" as any)
        .select("id, alert_type, severity, title, description, entity_id, created_at")
        .eq("assigned_to_pod", podData.id)
        .in("status", ["open", "acknowledged"])
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5) as any;

      setAlerts(alertsData || []);
    } catch (error) {
      logger.error("Error loading pod manager dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadDashboard();

    // Real-time updates
    const channel = supabase
      .channel("pod-manager-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_metrics" },
        () => {
          void loadDashboard();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bottleneck_alerts" },
        () => {
          void loadDashboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboard, supabase]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      default: return '🔵';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'sourcer': return '🔍';
      case 'screener': return '📞';
      case 'account_manager': return '📤';
      default: return '👤';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'sourcer': return 'Sourcer';
      case 'screener': return 'Screener';
      case 'account_manager': return 'Account Manager';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pod dashboard...</p>
        </div>
      </div>
    );
  }

  if (!podId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pod Assigned</h3>
          <p className="text-gray-600">You are not currently managing a pod.</p>
          <p className="text-sm text-gray-500 mt-2">Contact admin to get assigned as a pod manager.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-1">🏢 {podName}</h1>
        <p className="text-white/90 text-sm">Pod Manager Dashboard - Real-time team oversight</p>
      </div>

      {/* Sprint Progress */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Sprint Progress (Day {Math.ceil((Date.now() - new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).getTime()) / (24 * 60 * 60 * 1000))}/14)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-sm uppercase font-medium text-green-700 mb-2">Placements</div>
            <div className="text-3xl font-bold text-gray-900">{metrics?.placements_count}/{metrics?.placements_target}</div>
            <div className="text-sm text-green-700 mt-1">
              {metrics && metrics.placements_count >= metrics.placements_target ? '✅ Target met!' : 
               metrics && metrics.placements_count >= metrics.placements_target * 0.5 ? '🟡 On track' :
               '🔴 Behind'}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-sm uppercase font-medium text-blue-700 mb-2">Interviews</div>
            <div className="text-3xl font-bold text-gray-900">{metrics?.interviews_count}/{metrics?.interviews_target}</div>
            <div className="text-sm text-blue-700 mt-1">
              {metrics && metrics.interviews_count >= metrics.interviews_target ? '✅ Target met!' : 
               metrics && metrics.interviews_count >= metrics.interviews_target * 0.5 ? '🟡 On track' :
               '🔴 Behind'}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="text-sm uppercase font-medium text-purple-700 mb-2">Submissions</div>
            <div className="text-3xl font-bold text-gray-900">{metrics?.submissions_count || 0}</div>
            <div className="text-sm text-purple-700 mt-1">This sprint</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="text-sm uppercase font-medium text-orange-700 mb-2">Revenue</div>
            <div className="text-3xl font-bold text-gray-900">${((metrics?.revenue || 0) / 1000).toFixed(1)}K</div>
            <div className="text-sm text-orange-700 mt-1">Sprint total</div>
          </div>
        </div>

        {/* Health Score */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Pod Health Score</span>
            <span className={`text-2xl font-bold ${
              (metrics?.health_score || 0) >= 80 ? 'text-success-green-600' :
              (metrics?.health_score || 0) >= 50 ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {metrics?.health_score || 0}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                (metrics?.health_score || 0) >= 80 ? 'bg-success-green-500' :
                (metrics?.health_score || 0) >= 50 ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              style={{ width: `${metrics?.health_score || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Team Velocity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">👥 Team Velocity (Today)</h2>
          <p className="text-sm text-gray-600">{team.length} active members</p>
        </div>
        <div className="p-6">
          {team.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-600">No team members assigned yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map((member) => (
                <div 
                  key={member.id}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    member.target_met
                      ? 'border-success-green-300 bg-success-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getRoleIcon(member.role)}</span>
                        <div className="text-xs uppercase font-semibold text-gray-500">
                          {getRoleLabel(member.role)}
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900">
                        {member.user.first_name} {member.user.last_name}
                      </h4>
                    </div>
                    {member.target_met && (
                      <span className="text-2xl">✅</span>
                    )}
                  </div>

                  {/* Role-specific metrics */}
                  <div className="space-y-2 text-sm">
                    {member.role === 'sourcer' && (
                      <div>
                        <span className="text-gray-600">Resumes sourced:</span>
                        <span className={`ml-2 font-bold ${
                          (member.today_metrics.resumes_sourced || 0) >= 30 ? 'text-success-green-600' :
                          (member.today_metrics.resumes_sourced || 0) >= 15 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {member.today_metrics.resumes_sourced || 0}/30
                        </span>
                      </div>
                    )}
                    {member.role === 'screener' && (
                      <div>
                        <span className="text-gray-600">Calls made:</span>
                        <span className={`ml-2 font-bold ${
                          (member.today_metrics.calls_made || 0) >= 40 ? 'text-success-green-600' :
                          (member.today_metrics.calls_made || 0) >= 20 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {member.today_metrics.calls_made || 0}/40
                        </span>
                      </div>
                    )}
                    {member.role === 'account_manager' && (
                      <div>
                        <span className="text-gray-600">Submissions:</span>
                        <span className={`ml-2 font-bold ${
                          (member.today_metrics.submissions_made || 0) >= 5 ? 'text-success-green-600' :
                          (member.today_metrics.submissions_made || 0) >= 3 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {member.today_metrics.submissions_made || 0}/5
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottlenecks & Alerts */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">🚨 Bottlenecks & Alerts</h2>
          <p className="text-sm text-gray-600">Issues requiring your attention</p>
        </div>
        <div className="p-6">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="font-semibold text-gray-900 mb-1">All Clear!</h3>
              <p className="text-sm text-gray-600">No bottlenecks detected. Keep up the great work!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border-2 rounded-xl p-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs uppercase font-semibold mb-1">
                        {alert.severity} - {alert.alert_type.replace('_', ' ')}
                      </div>
                      <h4 className="font-bold mb-1">{alert.title}</h4>
                      <p className="text-sm mb-3">{alert.description}</p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white/50 hover:bg-white/80 rounded-lg text-xs font-medium transition-colors">
                          View Details
                        </button>
                        <button className="px-3 py-1 bg-white/50 hover:bg-white/80 rounded-lg text-xs font-medium transition-colors">
                          Reassign
                        </button>
                        <button className="px-3 py-1 bg-white/50 hover:bg-white/80 rounded-lg text-xs font-medium transition-colors">
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

