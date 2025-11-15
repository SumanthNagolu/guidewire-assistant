'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

interface Insight {
  title: string;
  description: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
}

interface CEOInsightPanelProps {
  insights: Insight[];
}

export function CEOInsightPanel({ insights }: CEOInsightPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">No insights available</p>
          ) : (
            insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge variant={insight.priority === 'high' ? 'destructive' : 'default'}>
                  {insight.priority}
                </Badge>
                <div className="flex-1">
                  <div className="font-medium">{insight.title}</div>
                  <div className="text-sm text-gray-600">{insight.description}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
