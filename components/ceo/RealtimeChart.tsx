'use client';

interface RealtimeChartProps {
  data: any;
  type?: 'line' | 'bar';
}

export function RealtimeChart({ data, type = 'line' }: RealtimeChartProps) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
      <p className="text-sm text-muted-foreground">
        Chart visualization (requires charting library)
      </p>
    </div>
  );
}
