'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface PodMetrics {
  id: string;
  name: string;
  type: string;
  manager_name: string;
  placements_count: number;
  placements_target: number;
  interviews_count: number;
  interviews_target: number;
  revenue: number;
  health_score: number;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  created_at: string;
}

interface CrossSellMetrics {
  total_leads: number;
  bench_sales_leads: number;
  training_leads: number;
  ta_leads: number;
  conversion_rate: number;
  revenue_from_cross_sell: number;
}

export default function CEODashboard() {
  const [pods, setPods] = useState<PodMetrics[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [crossSell, setCrossSell] = useState<CrossSellMetrics | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPlacements, setTotalPlacements] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadDashboard();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('ceo-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_metrics' },
        () => loadDashboard()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bottleneck_alerts' },
        () => loadDashboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      // Load pod metrics with aggregated data
      const { data: podsData } = await supabase
        .from('pods' as any)
        .select(`
          id,
          name,
          type,
          target_placements_per_sprint,
          target_interviews_per_sprint,
          manager:user_profiles!pods_manager_id_fkey (
            first_name,
            last_name
          )
        `) as any;

      // Calculate metrics for each pod
      const podsWithMetrics = await Promise.all(
        (podsData || []).map(async (pod: any) => {
          // Get placements count (last 14 days)
          const { count: placementsCount } = await supabase
            .from('placements' as any)
            .select('*', { count: 'exact', head: true })
            .gte('start_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
            .eq('status', 'active') as any;

          // Get interviews count (last 14 days)
          const { count: interviewsCount } = await supabase
            .from('interviews' as any)
            .select('*', { count: 'exact', head: true })
            .gte('scheduled_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()) as any;

          // Get revenue (last 14 days)
          const { data: revenueData } = await supabase
            .from('daily_metrics' as any)
            .select('revenue_generated')
            .eq('pod_id', pod.id)
            .gte('metric_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) as any;

          const revenue = revenueData?.reduce((sum: number, m: any) => sum + (parseFloat(m.revenue_generated) || 0), 0) || 0;

          // Calculate health score
          const placementProgress = (placementsCount || 0) / pod.target_placements_per_sprint;
          const interviewProgress = (interviewsCount || 0) / pod.target_interviews_per_sprint;
          const healthScore = Math.round(((placementProgress + interviewProgress) / 2) * 100);

          return {
            id: pod.id,
            name: pod.name,
            type: pod.type,
            manager_name: pod.manager ? `${pod.manager.first_name} ${pod.manager.last_name}` : 'Unassigned',
            placements_count: placementsCount || 0,
            placements_target: pod.target_placements_per_sprint,
            interviews_count: interviewsCount || 0,
            interviews_target: pod.target_interviews_per_sprint,
            revenue,
            health_score: healthScore
          };
        })
      );

      setPods(podsWithMetrics);

      // Calculate totals
      const totalRev = podsWithMetrics.reduce((sum, p) => sum + p.revenue, 0);
      const totalPlace = podsWithMetrics.reduce((sum, p) => sum + p.placements_count, 0);
      setTotalRevenue(totalRev);
      setTotalPlacements(totalPlace);

      // Load critical alerts
      const { data: alertsData } = await supabase
        .from('bottleneck_alerts' as any)
        .select('id, alert_type, severity, title, description, created_at')
        .in('status', ['open', 'acknowledged'])
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5) as any;

      setAlerts(alertsData || []);

      // Load cross-sell metrics
      const { data: crossSellData } = await supabase
        .from('cross_sell_leads' as any)
        .select('lead_type, status, estimated_value') as any;

      if (crossSellData) {
        const totalLeads = crossSellData.length;
        const benchLeads = crossSellData.filter((l: any) => l.lead_type === 'bench_sales').length;
        const trainingLeads = crossSellData.filter((l: any) => l.lead_type === 'training').length;
        const taLeads = crossSellData.filter((l: any) => l.lead_type === 'talent_acquisition').length;
        const convertedLeads = crossSellData.filter((l: any) => l.status === 'converted').length;
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
        const crossSellRevenue = crossSellData
          .filter((l: any) => l.status === 'converted')
          .reduce((sum: number, l: any) => sum + (parseFloat(l.estimated_value) || 0), 0);

        setCrossSell({
          total_leads: totalLeads,
          bench_sales_leads: benchLeads,
          training_leads: trainingLeads,
          ta_leads: taLeads,
          conversion_rate: conversionRate,
          revenue_from_cross_sell: crossSellRevenue
        });
      }

      // Calculate pipeline value (open opportunities)
      const { data: opportunitiesData } = await supabase
        .from('opportunities' as any)
        .select('estimated_value')
        .in('stage', ['lead', 'qualified', 'proposal', 'negotiation']) as any;

      const pipelineVal = opportunitiesData?.reduce((sum: number, o: any) => sum + (parseFloat(o.estimated_value) || 0), 0) || 0;
      setPipelineValue(pipelineVal);

    } catch (error) {
      console.error('Error loading CEO dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return '✅ EXCELLENT';
    if (score >= 50) return '🟡 ON TRACK';
    return '🔴 NEEDS ATTENTION';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-trust-blue-600 to-innovation-orange-500 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🏢 InTime Command Center</h1>
        <p className="text-white/90">Real-time visibility across all operations</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">Monthly Revenue</div>
          <div className="text-3xl font-bold text-gray-900">${(totalRevenue / 1000).toFixed(1)}K</div>
          <div className="text-xs text-gray-500 mt-1">Target: $100K</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-1">Active Placements</div>
          <div className="text-3xl font-bold text-gray-900">{totalPlacements}</div>
          <div className="text-xs text-gray-500 mt-1">This sprint</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600 mb-1">Pipeline Value</div>
          <div className="text-3xl font-bold text-gray-900">${(pipelineValue / 1000).toFixed(0)}K</div>
          <div className="text-xs text-gray-500 mt-1">Open opportunities</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="text-sm text-gray-600 mb-1">Active Pods</div>
          <div className="text-3xl font-bold text-gray-900">{pods.length}</div>
          <div className="text-xs text-gray-500 mt-1">{pods.filter(p => p.health_score >= 80).length} performing well</div>
        </div>
      </div>

      {/* Pod Comparison */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">📊 Pod Performance (Current Sprint)</h2>
          <p className="text-sm text-gray-600">Click any pod to drill down</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pod</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placements</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interviews</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-2">🏢</div>
                    <p>No pods created yet</p>
                    <p className="text-sm text-gray-400 mt-1">Pods will appear here as they're created</p>
                  </td>
                </tr>
              ) : (
                pods.map((pod) => (
                  <tr key={pod.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          pod.type === 'recruiting' ? 'bg-blue-500' :
                          pod.type === 'bench_sales' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{pod.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{pod.type.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pod.manager_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {pod.placements_count}/{pod.placements_target}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pod.placements_count >= pod.placements_target ? '✅' : 
                         pod.placements_count >= pod.placements_target * 0.5 ? '🟡' : '🔴'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {pod.interviews_count}/{pod.interviews_target}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pod.interviews_count >= pod.interviews_target ? '✅' : 
                         pod.interviews_count >= pod.interviews_target * 0.5 ? '🟡' : '🔴'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${(pod.revenue / 1000).toFixed(1)}K
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getHealthColor(pod.health_score)}`}>
                        {pod.health_score}%
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {getHealthStatus(pod.health_score)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/pods/${pod.id}`}
                        className="text-trust-blue-600 hover:text-trust-blue-800 font-medium"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">🚨 Critical Alerts</h2>
          <p className="text-sm text-gray-600">Issues requiring your attention</p>
        </div>
        <div className="p-6">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-gray-600 font-medium">All systems running smoothly!</p>
              <p className="text-sm text-gray-500 mt-1">No critical alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                        <span className="text-xs font-semibold uppercase">
                          {alert.severity} - {alert.alert_type.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-semibold">{alert.title}</h3>
                      <p className="text-sm mt-1">{alert.description}</p>
                      <p className="text-xs mt-2 opacity-75">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="px-3 py-1 bg-white/50 hover:bg-white/80 rounded text-xs font-medium transition-colors">
                        View
                      </button>
                      <button className="px-3 py-1 bg-white/50 hover:bg-white/80 rounded text-xs font-medium transition-colors">
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cross-Pollination Metrics */}
      {crossSell && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 border border-purple-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔄 Cross-Pollination Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{crossSell.total_leads}</div>
              <div className="text-sm text-gray-600">Total Leads</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{crossSell.bench_sales_leads}</div>
              <div className="text-sm text-gray-600">Bench Sales</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{crossSell.training_leads}</div>
              <div className="text-sm text-gray-600">Training</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{crossSell.ta_leads}</div>
              <div className="text-sm text-gray-600">Talent Acq.</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{crossSell.conversion_rate.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Conversion</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700">
            <strong>Revenue from Cross-Sell:</strong> ${(crossSell.revenue_from_cross_sell / 1000).toFixed(1)}K 
            <span className="ml-2 text-gray-600">
              ({totalRevenue > 0 ? Math.round((crossSell.revenue_from_cross_sell / totalRevenue) * 100) : 0}% of total)
            </span>
          </div>
        </div>
      )}

      {/* Growth Trajectory */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Growth Trajectory</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Current Team Size</div>
            <div className="text-3xl font-bold text-gray-900">9 people</div>
            <div className="text-sm text-gray-500 mt-1">Across {pods.length} pods</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Projected (60 days)</div>
            <div className="text-3xl font-bold text-trust-blue-600">15-18 people</div>
            <div className="text-sm text-gray-500 mt-1">+6-9 new hires</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Revenue Projection</div>
            <div className="text-3xl font-bold text-success-green-600">$180K/mo</div>
            <div className="text-sm text-gray-500 mt-1">Based on current trajectory</div>
          </div>
        </div>
      </div>
    </div>
  );
}

