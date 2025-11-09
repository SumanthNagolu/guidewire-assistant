'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface PendingSubmission {
  id: string;
  candidate_id: string;
  job_id: string;
  candidate: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    skills: string[];
    experience_years: number;
  };
  job: {
    title: string;
    client: {
      company_name: string;
      contacts: Array<{
        email: string;
        first_name: string;
      }>;
    };
  };
  screener_notes?: string;
  candidate_rating?: number;
  created_at: string;
}

interface DailyMetrics {
  submissions_received: number;
  submissions_made: number;
  interviews_scheduled: number;
  offers_received: number;
}

export default function AccountManagerDashboard() {
  const [pending, setPending] = useState<PendingSubmission[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadDashboard();
    
    // Real-time updates
    const channel = supabase
      .channel('am-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => loadDashboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load pending submissions (screened, not yet submitted to client)
      const { data: applicationsData } = await supabase
        .from('applications' as any)
        .select(`
          id,
          candidate_id,
          job_id,
          screener_notes,
          candidate_rating,
          created_at,
          candidate:candidates (
            first_name,
            last_name,
            email,
            phone,
            skills,
            experience_years
          ),
          job:jobs (
            title,
            client:clients (
              company_name
            )
          )
        `)
        .eq('status', 'screening')
        .order('candidate_rating', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(20) as any;

      setPending(applicationsData || []);

      // Load today's metrics
      const { data: metricsData } = await supabase
        .from('daily_metrics' as any)
        .select('submissions_received, submissions_made, interviews_scheduled, offers_received')
        .eq('user_id', user.id)
        .eq('metric_date', new Date().toISOString().split('T')[0])
        .single() as any;

      setMetrics(metricsData || {
        submissions_received: 0,
        submissions_made: 0,
        interviews_scheduled: 0,
        offers_received: 0
      });

    } catch (error) {
      console.error('Error loading AM dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleBulkSubmit = async () => {
    if (selected.size === 0 || submitting) return;

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update selected applications to 'submitted' status
      const selectedIds = Array.from(selected);
      await supabase
        .from('applications' as any)
        .update({ status: 'submitted', submitted_at: new Date().toISOString() })
        .in('id', selectedIds) as any;

      // Update metrics
      const today = new Date().toISOString().split('T')[0];
      const { data: existingMetric } = await supabase
        .from('daily_metrics' as any)
        .select('submissions_made')
        .eq('user_id', user.id)
        .eq('metric_date', today)
        .single() as any;

      if (existingMetric) {
        await supabase
          .from('daily_metrics' as any)
          .update({ 
            submissions_made: (existingMetric.submissions_made || 0) + selectedIds.length,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('metric_date', today) as any;
      } else {
        await supabase
          .from('daily_metrics' as any)
          .insert({
            user_id: user.id,
            metric_date: today,
            submissions_made: selectedIds.length
          }) as any;
      }

      // Clear selection and reload
      setSelected(new Set());
      loadDashboard();

    } catch (error) {
      console.error('Error submitting candidates:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-innovation-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your queue...</p>
        </div>
      </div>
    );
  }

  const targetSubmissions = 5;
  const submissionProgress = metrics ? Math.round((metrics.submissions_made / targetSubmissions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-innovation-orange-600 to-innovation-orange-500 text-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-1">📤 Account Manager Dashboard</h1>
        <p className="text-white/90 text-sm">Review screened candidates and submit to clients</p>
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📥</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {metrics?.submissions_received || 0}
          </div>
          <div className="text-xs uppercase font-medium text-gray-500 tracking-wide mb-3">
            From Screeners
          </div>
          <div className="text-sm text-gray-600">
            Pending your review
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-10 h-10 bg-innovation-orange-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📤</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {metrics?.submissions_made || 0}/{targetSubmissions}
          </div>
          <div className="text-xs uppercase font-medium text-gray-500 tracking-wide mb-3">
            Submitted to Clients
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  submissionProgress >= 100 ? 'bg-success-green-500' :
                  submissionProgress >= 50 ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(submissionProgress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-600">
              {submissionProgress}% of daily target
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {metrics?.interviews_scheduled || 0}
          </div>
          <div className="text-xs uppercase font-medium text-gray-500 tracking-wide mb-3">
            Interviews Scheduled
          </div>
          <div className="text-sm text-gray-600">
            Client responses
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-10 h-10 bg-success-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {metrics?.offers_received || 0}
          </div>
          <div className="text-xs uppercase font-medium text-gray-500 tracking-wide mb-3">
            Offers Received
          </div>
          <div className="text-sm text-gray-600">
            This sprint
          </div>
        </div>
      </div>

      {/* Pending Submissions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">📋 Pending Submissions</h2>
              <p className="text-sm text-gray-600">{pending.length} candidates ready for review</p>
            </div>
            {selected.size > 0 && (
              <button
                onClick={handleBulkSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-innovation-orange-600 text-white rounded-lg hover:bg-innovation-orange-700 transition-colors font-bold shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : `Submit ${selected.size} to Client`}
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {pending.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No pending submissions at the moment.</p>
              <p className="text-sm text-gray-500 mt-2">Screened candidates will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((item) => (
                <div 
                  key={item.id}
                  className={`border-2 rounded-xl p-5 transition-all ${
                    selected.has(item.id)
                      ? 'border-innovation-orange-500 bg-innovation-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-innovation-orange-600 focus:ring-innovation-orange-500"
                    />

                    {/* Candidate Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {item.candidate.first_name} {item.candidate.last_name}
                            </h3>
                            {item.candidate_rating && (
                              <div className="flex gap-1">
                                {Array.from({ length: item.candidate_rating }).map((_, i) => (
                                  <span key={i} className="text-amber-400">⭐</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {item.job?.title} • {item.job?.client?.company_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.candidate.experience_years} years experience
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>📞 {item.candidate.phone}</span>
                        <span>✉️ {item.candidate.email}</span>
                      </div>

                      {/* Skills */}
                      {item.candidate.skills && item.candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.candidate.skills.slice(0, 6).map((skill, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Screener Notes */}
                      {item.screener_notes && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                          <div className="text-xs font-semibold text-gray-700 uppercase mb-1">
                            Screener Notes:
                          </div>
                          <p className="text-sm text-gray-700">{item.screener_notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/employee/candidates/${item.candidate_id}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          👁️ View Full Profile
                        </Link>
                        <Link
                          href={`/employee/jobs/${item.job_id}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          📋 View JD
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-bold text-gray-900 mb-3">💡 Quick Tips for Final Review:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span><strong>Resume Quality:</strong> Verify formatting, check for typos, ensure InTime template is used</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span><strong>Skills Match:</strong> Confirm candidate skills align with JD requirements (80%+ match ideal)</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span><strong>Availability:</strong> Double-check start date and candidate's current notice period</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span><strong>Communication:</strong> Send professional email with candidate profiles and cover note</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

