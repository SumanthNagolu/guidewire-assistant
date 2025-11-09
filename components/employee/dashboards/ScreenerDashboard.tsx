'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface CallQueueItem {
  id: string;
  candidate_id: string;
  candidate: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    skills: string[];
    current_company?: string;
  };
  job_id: string;
  job: {
    title: string;
    client: {
      company_name: string;
    };
  };
  source: string;
  priority: string;
}

interface DailyMetrics {
  calls_made: number;
  calls_qualified: number;
  cross_sell_leads_tagged: number;
  candidates_submitted_to_am: number;
}

interface CrossSellLead {
  id: string;
  lead_type: string;
  candidate_name: string;
  notes: string;
  created_at: string;
}

export default function ScreenerDashboard() {
  const [callQueue, setCallQueue] = useState<CallQueueItem[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [crossSellLeads, setCrossSellLeads] = useState<CrossSellLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<CallQueueItem | null>(null);
  const [callOutcome, setCallOutcome] = useState<{
    outcome: string;
    rating: number;
    notes: string;
    crossSellTags: string[];
  }>({
    outcome: '',
    rating: 0,
    notes: '',
    crossSellTags: []
  });
  const supabase = createClient();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get active JD assignments for this screener
      const { data: assignments } = await supabase
        .from('jd_assignments' as any)
        .select('job_id')
        .eq('screener_id', user.id)
        .in('status', ['screening', 'sourcing']) as any;

      const jobIds = assignments?.map((a: any) => a.job_id) || [];

      // Load call queue (candidates attached to these JDs)
      if (jobIds.length > 0) {
        const { data: applications } = await supabase
          .from('applications' as any)
          .select(`
            id,
            candidate_id,
            job_id,
            candidate:candidates (
              first_name,
              last_name,
              phone,
              email,
              skills,
              current_company
            ),
            job:jobs (
              title,
              client:clients (
                company_name
              )
            )
          `)
          .in('job_id', jobIds)
          .eq('status', 'applied')
          .order('created_at', { ascending: true })
          .limit(20) as any;

        setCallQueue(applications || []);
      }

      // Load today's metrics
      const { data: metricsData } = await supabase
        .from('daily_metrics' as any)
        .select('calls_made, calls_qualified, cross_sell_leads_tagged, candidates_submitted_to_am')
        .eq('user_id', user.id)
        .eq('metric_date', new Date().toISOString().split('T')[0])
        .single() as any;

      setMetrics(metricsData || {
        calls_made: 0,
        calls_qualified: 0,
        cross_sell_leads_tagged: 0,
        candidates_submitted_to_am: 0
      });

      // Load today's cross-sell leads
      const { data: leadsData } = await supabase
        .from('cross_sell_leads' as any)
        .select(`
          id,
          lead_type,
          discovery_notes,
          created_at,
          candidate:candidates (
            first_name,
            last_name
          )
        `)
        .eq('discovered_by', user.id)
        .gte('discovered_at', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(5) as any;

      setCrossSellLeads(leadsData?.map((l: any) => ({
        id: l.id,
        lead_type: l.lead_type,
        candidate_name: `${l.candidate.first_name} ${l.candidate.last_name}`,
        notes: l.discovery_notes,
        created_at: l.created_at
      })) || []);

    } catch (error) {
      console.error('Error loading screener dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNow = (item: CallQueueItem) => {
    setActiveCall(item);
    // Open dialer (in production, this would integrate with Dialpad)
    window.open(`tel:${item.candidate.phone}`, '_blank');
  };

  const handleCallComplete = async () => {
    if (!activeCall) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create call log
      await supabase.from('call_logs' as any).insert({
        user_id: user.id,
        candidate_id: activeCall.candidate_id,
        job_id: activeCall.job_id,
        phone_number: activeCall.candidate.phone,
        direction: 'outbound',
        outcome: callOutcome.outcome,
        notes: callOutcome.notes,
        candidate_rating: callOutcome.rating,
        cross_sell_leads_generated: callOutcome.crossSellTags.length,
        called_at: new Date().toISOString()
      }) as any;

      // Update application status if qualified
      if (callOutcome.outcome === 'qualified') {
        await supabase
          .from('applications' as any)
          .update({ status: 'screening' })
          .eq('id', activeCall.id) as any;
      }

      // Create cross-sell leads
      for (const leadType of callOutcome.crossSellTags) {
        await supabase.from('cross_sell_leads' as any).insert({
          candidate_id: activeCall.candidate_id,
          lead_type: leadType,
          discovered_by: user.id,
          source_activity_type: 'call',
          discovery_notes: callOutcome.notes,
          status: 'new'
        }) as any;
      }

      // Update daily metrics
      const today = new Date().toISOString().split('T')[0];
      const { data: existingMetric } = await supabase
        .from('daily_metrics' as any)
        .select('calls_made, calls_qualified, cross_sell_leads_tagged')
        .eq('user_id', user.id)
        .eq('metric_date', today)
        .single() as any;

      const updates: any = {
        calls_made: (existingMetric?.calls_made || 0) + 1,
        updated_at: new Date().toISOString()
      };

      if (callOutcome.outcome === 'qualified') {
        updates.calls_qualified = (existingMetric?.calls_qualified || 0) + 1;
      }

      if (callOutcome.crossSellTags.length > 0) {
        updates.cross_sell_leads_tagged = (existingMetric?.cross_sell_leads_tagged || 0) + callOutcome.crossSellTags.length;
      }

      if (existingMetric) {
        await supabase
          .from('daily_metrics' as any)
          .update(updates)
          .eq('user_id', user.id)
          .eq('metric_date', today) as any;
      } else {
        await supabase
          .from('daily_metrics' as any)
          .insert({
            user_id: user.id,
            metric_date: today,
            ...updates
          }) as any;
      }

      // Reset and reload
      setActiveCall(null);
      setCallOutcome({
        outcome: '',
        rating: 0,
        notes: '',
        crossSellTags: []
      });
      loadDashboard();

    } catch (error) {
      console.error('Error completing call:', error);
    }
  };

  const getLeadTypeColor = (type: string) => {
    switch (type) {
      case 'bench_sales': return 'bg-green-100 text-green-800 border-green-200';
      case 'training': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'talent_acquisition': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLeadTypeLabel = (type: string) => {
    switch (type) {
      case 'bench_sales': return '💼 Bench Sales';
      case 'training': return '📚 Training';
      case 'talent_acquisition': return '👥 Talent Acq.';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your call queue...</p>
        </div>
      </div>
    );
  }

  const targetCalls = 40;
  const qualificationRate = metrics && metrics.calls_made > 0 
    ? Math.round((metrics.calls_qualified / metrics.calls_made) * 100) 
    : 0;
  const progressPercentage = metrics ? Math.round((metrics.calls_made / targetCalls) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-success-green-600 to-success-green-500 text-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-1">📞 Screener Dashboard</h1>
        <p className="text-white/90 text-sm">Qualify candidates and generate cross-sell leads</p>
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-10 h-10 bg-success-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📞</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {metrics?.calls_made || 0}/{targetCalls}
          </div>
          <div className="text-xs uppercase font-medium text-gray-500 tracking-wide mb-3">
            Calls Made
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  progressPercentage >= 80 ? 'bg-success-green-500' :
                  progressPercentage >= 50 ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-600">
              {progressPercentage}% of daily target
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {metrics?.calls_qualified || 0}
          </div>
          <div className="text-xs uppercase font-medium text-gray-500 tracking-wide mb-3">
            Qualified
          </div>
          <div className="text-sm text-gray-600">
            {qualificationRate}% qualification rate
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {metrics?.cross_sell_leads_tagged || 0}
          </div>
          <div className="text-xs uppercase font-medium text-gray-500 tracking-wide mb-3">
            Cross-Sell Leads
          </div>
          <div className="text-sm text-gray-600">
            Multi-arm opportunity
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📤</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {metrics?.candidates_submitted_to_am || 0}
          </div>
          <div className="text-xs uppercase font-medium text-gray-500 tracking-wide mb-3">
            Submitted to AM
          </div>
          <div className="text-sm text-gray-600">
            Ready for final review
          </div>
        </div>
      </div>

      {/* Call Queue */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">📋 Call Queue</h2>
              <p className="text-sm text-gray-600">{callQueue.length} candidates waiting</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-600">Live Queue</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {callQueue.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Queue Empty!</h3>
              <p className="text-gray-600">All candidates have been contacted.</p>
              <p className="text-sm text-gray-500 mt-2">New candidates will appear here as they're sourced.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {callQueue.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="bg-gray-50 border-2 border-gray-200 hover:border-success-green-400 hover:shadow-md transition-all rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {item.candidate.first_name} {item.candidate.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.job?.title} • {item.job?.client?.company_name}
                      </p>
                      {item.candidate.current_company && (
                        <p className="text-xs text-gray-500 mt-1">
                          Currently at: {item.candidate.current_company}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => handleCallNow(item)}
                        className="px-6 py-3 bg-success-green-600 text-white rounded-lg hover:bg-success-green-700 transition-colors font-bold shadow-md hover:shadow-lg"
                      >
                        📞 CALL NOW
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>📞 {item.candidate.phone}</span>
                    <span>✉️ {item.candidate.email}</span>
                  </div>

                  {item.candidate.skills && item.candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.candidate.skills.slice(0, 5).map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {callQueue.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    +{callQueue.length - 5} more candidates in queue
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Call Outcome Modal */}
      {activeCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-success-green-600 to-success-green-500 text-white p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold">Call Outcome</h3>
              <p className="text-sm text-white/90">
                {activeCall.candidate.first_name} {activeCall.candidate.last_name}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Outcome Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Call Outcome *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'qualified', label: '✅ Qualified', color: 'success-green' },
                    { value: 'not_interested', label: '❌ Not Interested', color: 'gray' },
                    { value: 'no_answer', label: '📞 No Answer', color: 'yellow' },
                    { value: 'voicemail', label: '📧 Voicemail', color: 'blue' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCallOutcome({ ...callOutcome, outcome: option.value })}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        callOutcome.outcome === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating (if qualified) */}
              {callOutcome.outcome === 'qualified' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Candidate Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setCallOutcome({ ...callOutcome, rating: star })}
                        className="text-3xl transition-transform hover:scale-110"
                      >
                        {star <= callOutcome.rating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross-Sell Opportunities */}
              {callOutcome.outcome === 'qualified' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Cross-Sell Opportunities
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'bench_sales', label: '💼 Available for Bench Sales', desc: 'Immediately available for contract work' },
                      { value: 'training', label: '📚 Needs Training', desc: 'Good skills but lacks specific expertise' },
                      { value: 'talent_acquisition', label: '👥 Has Network', desc: 'Can refer other candidates' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-success-green-300 cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={callOutcome.crossSellTags.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCallOutcome({
                                ...callOutcome,
                                crossSellTags: [...callOutcome.crossSellTags, option.value]
                              });
                            } else {
                              setCallOutcome({
                                ...callOutcome,
                                crossSellTags: callOutcome.crossSellTags.filter(t => t !== option.value)
                              });
                            }
                          }}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-600">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Call Notes
                </label>
                <textarea
                  value={callOutcome.notes}
                  onChange={(e) => setCallOutcome({ ...callOutcome, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-success-green-500 focus:border-transparent"
                  placeholder="Communication quality, technical skills, availability, compensation expectations..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCallComplete}
                  disabled={!callOutcome.outcome}
                  className="flex-1 px-6 py-3 bg-success-green-600 text-white rounded-lg hover:bg-success-green-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save & Next
                </button>
                <button
                  onClick={() => {
                    setActiveCall(null);
                    setCallOutcome({
                      outcome: '',
                      rating: 0,
                      notes: '',
                      crossSellTags: []
                    });
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Cross-Sell Wins */}
      {crossSellLeads.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg border border-purple-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Today's Cross-Sell Wins</h2>
          <div className="space-y-3">
            {crossSellLeads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLeadTypeColor(lead.lead_type)}`}>
                        {getLeadTypeLabel(lead.lead_type)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900">{lead.candidate_name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{lead.notes}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

