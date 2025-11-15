'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity, Coffee, TrendingUp } from 'lucide-react';

interface ContextSummary {
  window_type: string;
  summary_text: string;
  activities: string[];
  idle_minutes: number;
  active_minutes: number;
  window_start: string;
  window_end: string;
  updated_at: string;
}

interface ContextSummariesProps {
  userId: string;
}

const WINDOW_CONFIG = {
  '15min': { label: '15 Minutes', icon: Clock, color: 'bg-blue-500' },
  '30min': { label: '30 Minutes', icon: Clock, color: 'bg-indigo-500' },
  '1hr': { label: '1 Hour', icon: Activity, color: 'bg-purple-500' },
  '2hr': { label: '2 Hours', icon: Activity, color: 'bg-pink-500' },
  '4hr': { label: '4 Hours', icon: TrendingUp, color: 'bg-red-500' },
  '1day': { label: 'Daily', icon: TrendingUp, color: 'bg-orange-500' },
  '1week': { label: 'Weekly', icon: TrendingUp, color: 'bg-yellow-500' },
  '1month': { label: 'Monthly', icon: TrendingUp, color: 'bg-green-500' },
  '1year': { label: 'Annual', icon: TrendingUp, color: 'bg-teal-500' }
};

export default function ContextSummaries({ userId }: ContextSummariesProps) {
  const [summaries, setSummaries] = useState<Record<string, ContextSummary[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedWindow, setSelectedWindow] = useState<string>('15min');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchSummaries();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSummaries, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userId]);

  const fetchSummaries = async () => {
    try {
      const response = await fetch(`/api/productivity/context?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setSummaries(data.summaries);
      }
    } catch (error) {
          } finally {
      setLoading(false);
    }
  };

  const triggerBatchProcess = async () => {
    try {
      const response = await fetch('/api/productivity/batch-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh summaries after processing
        setTimeout(fetchSummaries, 2000);
      }
    } catch (error) {
          }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
  };

  const getLatestSummary = (windowType: string): ContextSummary | null => {
    const windowSummaries = summaries[windowType];
    return windowSummaries && windowSummaries.length > 0 ? windowSummaries[0] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Window Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(WINDOW_CONFIG).map(([key, config]) => {
          const summary = getLatestSummary(key);
          const hasData = summary !== null;
          
          return (
            <button
              key={key}
              onClick={() => setSelectedWindow(key)}
              className={`
                px-4 py-2 rounded-lg transition-all duration-200
                ${selectedWindow === key 
                  ? `${config.color} text-white shadow-lg scale-105` 
                  : hasData 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }
              `}
              disabled={!hasData}
            >
              <div className="flex items-center gap-2">
                <config.icon className="w-4 h-4" />
                <span className="font-medium">{config.label}</span>
                {hasData && (
                  <Badge variant="secondary" className="ml-1">
                    {formatTime(summary.active_minutes)}
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Window Summary */}
      {(() => {
        const summary = getLatestSummary(selectedWindow);
        const config = WINDOW_CONFIG[selectedWindow];
        
        if (!summary) {
          return (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">
                  No {config.label.toLowerCase()} summary available yet.
                </p>
                <button
                  onClick={triggerBatchProcess}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Generate Summary
                </button>
              </CardContent>
            </Card>
          );
        }
        
        return (
          <Card className="border-2">
            <CardHeader className={`${config.color} text-white`}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <config.icon className="w-5 h-5" />
                  {config.label} Summary
                </CardTitle>
                <div className="text-sm opacity-90">
                  {new Date(summary.window_end).toLocaleTimeString()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Human-like Summary */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                  {summary.summary_text}
                </p>
              </div>

              {/* Time Breakdown */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Active Time</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatTime(summary.active_minutes)}
                  </p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Coffee className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Break Time</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatTime(summary.idle_minutes)}
                  </p>
                </div>
              </div>

              {/* Activities */}
              {summary.activities && summary.activities.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Key Activities</h3>
                  <div className="space-y-2">
                    {summary.activities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-gray-700">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* All Summaries Grid */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">All Context Windows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(WINDOW_CONFIG).map(([key, config]) => {
            const summary = getLatestSummary(key);
            
            if (!summary) return null;
            
            return (
              <Card 
                key={key} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedWindow === key ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedWindow(key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <Badge variant="outline">
                      {formatTime(summary.active_minutes)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {summary.summary_text}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Manual Trigger Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={triggerBatchProcess}
          className="px-6 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        >
          Process Screenshots Now
        </button>
      </div>
    </div>
  );
}
