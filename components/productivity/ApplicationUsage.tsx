'use client';

import { Monitor, ChevronRight } from 'lucide-react';

interface ApplicationUsageProps {
  applications: any[];
  analyses?: any[];
  limit?: number;
  detailed?: boolean;
}

export default function ApplicationUsage({ applications, analyses, limit, detailed = false }: ApplicationUsageProps) {
  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-8">
        <Monitor className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">No application data yet</p>
        <p className="text-gray-400 text-xs mt-1">Start the desktop agent to track activity</p>
      </div>
    );
  }
  
  // Group applications by name and sum duration
  const appUsage: Record<string, number> = {};
  applications.forEach(app => {
    const appName = app.app_name || 'Unknown';
    if (!appUsage[appName]) {
      appUsage[appName] = 0;
    }
    appUsage[appName] += app.duration || 0;
  });
  
  // Also include data from AI analyses for more accurate tracking
  if (analyses && analyses.length > 0) {
    analyses.forEach(analysis => {
      const appName = analysis.application_detected || 'Unknown';
      if (!appUsage[appName]) {
        appUsage[appName] = 0;
      }
      // Each analysis represents ~30 seconds
      appUsage[appName] += 30;
    });
  }
  
  // Convert to array and sort
  const topApps = Object.entries(appUsage)
    .map(([name, duration]) => ({
      name,
      duration: Math.round(duration / 60), // Convert to minutes
      percentage: 0 // Will calculate below
    }))
    .sort((a, b) => b.duration - a.duration);
  
  // Calculate percentages
  const totalTime = topApps.reduce((sum, app) => sum + app.duration, 0);
  topApps.forEach(app => {
    app.percentage = totalTime > 0 ? Math.round((app.duration / totalTime) * 100) : 0;
  });
  
  const displayApps = limit ? topApps.slice(0, limit) : topApps;
  
  // Get icon for application
  function getAppIcon(appName: string): string {
    const icons: Record<string, string> = {
      'Chrome': '🌐',
      'Firefox': '🦊',
      'Safari': '🧭',
      'Edge': '🔷',
      'VS Code': '💻',
      'Visual Studio Code': '💻',
      'IntelliJ': '🔶',
      'Slack': '💬',
      'Teams': '👥',
      'Zoom': '📹',
      'Outlook': '📧',
      'Excel': '📊',
      'PowerPoint': '📽️',
      'Word': '📝',
      'Terminal': '⌨️',
      'iTerm': '⌨️',
      'Cursor': '🖱️'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
      if (appName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return '📱';
  }
  
  // Get color for progress bar
  function getBarColor(index: number): string {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-blue-600',
      'bg-gradient-to-r from-green-500 to-green-600',
      'bg-gradient-to-r from-purple-500 to-purple-600',
      'bg-gradient-to-r from-orange-500 to-orange-600',
      'bg-gradient-to-r from-pink-500 to-pink-600',
    ];
    return colors[index % colors.length];
  }
  
  if (detailed) {
    return (
      <div className="space-y-3">
        {displayApps.map((app, index) => (
          <div key={app.name} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{getAppIcon(app.name)}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{app.name}</h4>
                  <p className="text-xs text-gray-600">{app.duration} minutes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{app.percentage}%</p>
                <p className="text-xs text-gray-500">of total time</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${getBarColor(index)} h-3 rounded-full transition-all shadow-sm`}
                style={{ width: `${app.percentage}%` }}
              />
            </div>
          </div>
        ))}
        
        {topApps.length > displayApps.length && !limit && (
          <p className="text-center text-sm text-gray-500 pt-2">
            + {topApps.length - displayApps.length} more applications
          </p>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {displayApps.map((app, index) => (
        <div key={app.name}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-lg">{getAppIcon(app.name)}</span>
              <span className="font-medium text-gray-900 truncate text-sm">{app.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{app.duration}m</span>
              <span className="text-xs text-gray-500 font-semibold">{app.percentage}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${getBarColor(index)} h-2 rounded-full transition-all`}
              style={{ width: `${app.percentage}%` }}
            />
          </div>
        </div>
      ))}
      
      {limit && topApps.length > limit && (
        <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 flex items-center justify-center gap-1 hover:bg-blue-50 rounded transition-colors">
          View All Applications
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}



