'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CEOMetricCardProps {
  title: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
  forecast?: any;
  icon?: React.ReactNode;
}

export function CEOMetricCard({
  title,
  value,
  trend = 'stable',
  changePercent = 0,
  forecast,
  icon,
}: CEOMetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {trend === 'up' ? (
            <>
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+{changePercent}%</span>
            </>
          ) : trend === 'down' ? (
            <>
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-red-500">{changePercent}%</span>
            </>
          ) : (
            <span>No change</span>
          )}
        </div>
        {forecast && (
          <div className="mt-2 text-xs text-muted-foreground">
            Forecast: {forecast.predicted}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

