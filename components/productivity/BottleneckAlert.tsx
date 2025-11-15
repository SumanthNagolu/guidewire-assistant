'use client';

export default function BottleneckAlert({ bottleneck }: { bottleneck: any }) {
  const severityColors = {
    low: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    medium: 'bg-orange-50 border-orange-200 text-orange-800',
    high: 'bg-red-50 border-red-200 text-red-800',
    critical: 'bg-red-100 border-red-300 text-red-900',
  };

  const severityIcons = {
    low: '⚠️',
    medium: '🔶',
    high: '🔴',
    critical: '🚨',
  };

  const color = severityColors[bottleneck.severity as keyof typeof severityColors];
  const icon = severityIcons[bottleneck.severity as keyof typeof severityIcons];

  return (
    <div className={`p-4 rounded-lg border ${color}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">
              {bottleneck.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </h4>
            <span className="text-xs uppercase font-semibold">{bottleneck.severity}</span>
          </div>
          <p className="text-sm mt-1">{bottleneck.detection_reason}</p>
          {bottleneck.ai_suggestions && (
            <p className="text-sm mt-2 italic">💡 {bottleneck.ai_suggestions}</p>
          )}
          {bottleneck.user_profiles && (
            <p className="text-xs mt-2">
              Affects: {bottleneck.user_profiles.first_name} {bottleneck.user_profiles.last_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

