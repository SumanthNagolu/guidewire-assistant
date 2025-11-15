'use client';

import { Sparkles, TrendingUp, Target, Lightbulb } from 'lucide-react';

interface AIWorkSummaryProps {
  summary: any;
  analyses: any[];
  timeRange: string;
  userRole?: string;
}

export default function AIWorkSummary({ summary, analyses, timeRange, userRole }: AIWorkSummaryProps) {
  if (!summary && (!analyses || analyses.length === 0)) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">No activity data for this time period</p>
        <p className="text-gray-400 text-xs mt-1">AI summary will appear once work is detected</p>
      </div>
    );
  }
  
  // Calculate real-time metrics from analyses if summary doesn't exist
  const productiveMinutes = summary?.total_productive_minutes || (analyses?.length || 0) * 0.5;
  const breakMinutes = summary?.total_break_minutes || 0;
  const avgProductivityScore = analyses?.length > 0 
    ? Math.round(analyses.reduce((sum: number, a: any) => sum + (a.productivity_score || 50), 0) / analyses.length)
    : 50;
  
  return (
    <div className="space-y-4">
      {/* AI Generated Summary */}
      {summary?.ai_summary && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 text-sm">AI Summary</h3>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{summary.ai_summary}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Productive Time</p>
          <p className="text-2xl font-bold text-green-600">
            {Math.round(productiveMinutes)}m
          </p>
        </div>
        
        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Productivity Score</p>
          <p className="text-2xl font-bold text-blue-600">
            {avgProductivityScore}%
          </p>
        </div>
      </div>
      
      {/* Key Accomplishments */}
      {summary?.key_accomplishments && summary.key_accomplishments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold text-sm text-gray-900">Key Accomplishments</h3>
          </div>
          <ul className="space-y-1">
            {summary.key_accomplishments.slice(0, 3).map((accomplishment: string, index: number) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{accomplishment}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Improvement Suggestions */}
      {summary?.improvement_suggestions && summary.improvement_suggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            <h3 className="font-semibold text-sm text-gray-900">Suggestions</h3>
          </div>
          <ul className="space-y-1">
            {summary.improvement_suggestions.slice(0, 3).map((suggestion: string, index: number) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">💡</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Real-time Activity Preview (when no summary yet) */}
      {!summary && analyses && analyses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-2">
            {analyses.slice(0, 3).map((analysis: any, index: number) => (
              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                <p className="font-medium text-gray-900">{analysis.application_detected}</p>
                <p className="text-gray-600 truncate">{analysis.activity_description}</p>
                <p className="text-gray-500 mt-1">
                  {new Date(analysis.analyzed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            AI summary will be generated in a few minutes...
          </p>
        </div>
      )}
    </div>
  );
}



