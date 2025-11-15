"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { logger } from "@/lib/utils/logger";

interface JDAssignment {
  id: string;
  job_id: string;
  status: string;
  priority: string;
  target_resumes: number;
  resumes_sourced: number;
  assigned_at: string;
  sourcing_started_at: string;
  job: {
    title: string;
    client: {
      company_name: string;
    };
  };
}

interface DailyMetrics {
  jds_assigned: number;
  resumes_sourced: number;
  avg_time_per_jd: string;
}

export default function SourcerDashboard() {
  const [assignments, setAssignments] = useState<JDAssignment[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const loadDashboard = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load active JD assignments for this sourcer
      const { data: assignmentsData } = await supabase
        .from("jd_assignments" as any)
        .select(`
          id,
          job_id,
          status,
          priority,
          target_resumes,
          resumes_sourced,
          assigned_at,
          sourcing_started_at,
          job:jobs (
            title,
            client:clients (
              company_name
            )
          )
        `)
        .eq("sourcer_id", user.id)
        .in("status", ["assigned", "sourcing"])
        .order("priority", { ascending: false })
        .order("assigned_at", { ascending: true }) as any;

      // Load today's metrics
      const { data: metricsData } = await supabase
        .from("daily_metrics" as any)
        .select("jds_assigned, resumes_sourced, avg_time_per_jd")
        .eq("user_id", user.id)
        .eq("metric_date", new Date().toISOString().split("T")[0])
        .single() as any;

      setAssignments(assignmentsData || []);
      setMetrics(metricsData);
    } catch (error) {
      logger.error("Error loading sourcer dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadDashboard();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel("sourcer-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jd_assignments" },
        () => {
          void loadDashboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboard, supabase]);

  const getTimeSpent = (assignedAt: string) => {
    const start = new Date(assignedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}:${diffMins.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (sourced: number, target: number, timeSpent: string) => {
    const [hours] = timeSpent.split(':').map(Number);
    const progress = (sourced / target) * 100;
    
    if (hours >= 2 && progress < 33) return 'text-red-600 bg-red-50';
    if (progress < 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getProgressStatus = (sourced: number, target: number, timeSpent: string) => {
    const [hours] = timeSpent.split(':').map(Number);
    const progress = (sourced / target) * 100;
    
    if (hours >= 2 && progress < 33) return '🔴 STUCK';
    if (progress < 50) return '🟡 IN PROGRESS';
    if (progress >= 100) return '✅ COMPLETE';
    return '🟢 ON TRACK';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalTarget = assignments.reduce((sum, a) => sum + a.target_resumes, 0);
  const totalSourced = assignments.reduce((sum, a) => sum + a.resumes_sourced, 0);
  const progressPercentage = totalTarget > 0 ? Math.round((totalSourced / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sourcer Dashboard</h1>
        <p className="text-gray-600 mt-1">Find and tag candidates for active job requirements</p>
      </div>

      {/* Today's Targets */}
      <div className="bg-gradient-to-r from-trust-blue-500 to-trust-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">🎯 TODAY'S TARGETS</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{assignments.length}/{metrics?.jds_assigned || assignments.length}</div>
            <div className="text-sm opacity-90">Active JDs</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{totalSourced}/{totalTarget}</div>
            <div className="text-sm opacity-90">Resumes ({progressPercentage}%)</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {metrics?.avg_time_per_jd ? 
                `${Math.round(parseInt(metrics.avg_time_per_jd) / 60)} min` : 
                'N/A'
              }
            </div>
            <div className="text-sm opacity-90">Avg Time/JD</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {progressPercentage >= 80 ? '✅ EXCELLENT' : 
               progressPercentage >= 50 ? '🟡 ON TRACK' : 
               '🔴 NEEDS FOCUS'}
            </div>
            <div className="text-sm opacity-90">Status</div>
          </div>
        </div>
      </div>

      {/* Active JDs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">📋 ACTIVE JDS</h2>
          <p className="text-sm text-gray-600">Drag to reorder priority (coming soon)</p>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No active JDs assigned to you right now.</p>
            <p className="text-sm text-gray-500 mt-2">Check back soon or contact your pod manager.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const timeSpent = getTimeSpent(assignment.sourcing_started_at || assignment.assigned_at);
              const progressColor = getProgressColor(assignment.resumes_sourced, assignment.target_resumes, timeSpent);
              const status = getProgressStatus(assignment.resumes_sourced, assignment.target_resumes, timeSpent);
              const progressPct = Math.round((assignment.resumes_sourced / assignment.target_resumes) * 100);

              return (
                <div key={assignment.id} className="bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-trust-blue-400 transition-colors">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${progressColor}`}>
                            {status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            assignment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            assignment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.priority.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          JD #{assignment.job_id.substring(0, 8)} - {assignment.job?.title || 'Untitled Job'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Client: {assignment.job?.client?.company_name || 'Unknown Client'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{assignment.resumes_sourced}/{assignment.target_resumes}</div>
                        <div className="text-xs text-gray-500">Time: {timeSpent}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            progressPct >= 80 ? 'bg-green-500' :
                            progressPct >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(progressPct, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{progressPct}% complete</span>
                        {assignment.target_resumes - assignment.resumes_sourced > 0 && (
                          <span>{assignment.target_resumes - assignment.resumes_sourced} more needed</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/employee/candidates?jd=${assignment.job_id}`}
                        className="btn-primary text-sm"
                      >
                        🔍 Search Internal DB
                      </Link>
                      <Link
                        href={`/employee/candidates/new?jd=${assignment.job_id}`}
                        className="btn-secondary text-sm"
                      >
                        💾 Upload Resume
                      </Link>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        📧 Email Blast
                      </button>
                      <Link
                        href={`/employee/jobs/${assignment.job_id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        👁️ View JD
                      </Link>
                    </div>

                    {/* Alert if stuck */}
                    {status === '🔴 STUCK' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-red-600">⚠️</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-900">This JD needs attention!</p>
                            <p className="text-xs text-red-700 mt-1">
                              Over 2 hours with less than 33% progress. Consider:
                            </p>
                            <ul className="text-xs text-red-700 mt-1 list-disc list-inside">
                              <li>Searching different job boards</li>
                              <li>Adjusting search criteria</li>
                              <li>Asking pod manager for help</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 QUICK CANDIDATE SEARCH</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by skills, name, location..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
          <Link
            href="/employee/candidates"
            className="btn-primary whitespace-nowrap"
          >
            Advanced Search
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Internal database: 4,523 candidates
        </p>
      </div>
    </div>
  );
}

