"use client";

import { useCallback, useEffect, useState } from "react";
import { logger } from "@/lib/utils/logger";

export default function ProductivityChart({ userId }: { userId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProductivityData = useCallback(async () => {
    try {
      const res = await fetch(`/api/productivity/stats/history?user_id=${userId}&days=7`);
      const result = await res.json();
      setData(result.history || []);
    } catch (error) {
      logger.error('Error fetching productivity data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchProductivityData();
  }, [fetchProductivityData]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Productivity Trend</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  const maxScore = 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Productivity Trend (Last 7 Days)</h3>
      <div className="h-64">
        <div className="flex items-end justify-between h-full gap-2">
          {data.map((day) => {
            const height = (day.overall_score / maxScore) * 100;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 flex items-end w-full">
                  <div
                    className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                    style={{ height: `${height}%` }}
                    title={`Score: ${day.overall_score}`}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-purple-600">
            {data.length > 0
              ? Math.round(data.reduce((sum, d) => sum + d.overall_score, 0) / data.length)
              : 0}
          </p>
          <p className="text-xs text-gray-600">Avg Score</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">
            {data.length > 0
              ? Math.round(
                  data.reduce((sum, d) => sum + d.total_active_time_minutes, 0) / data.length
                )
              : 0}
            m
          </p>
          <p className="text-xs text-gray-600">Avg Active Time</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">
            {data.reduce((sum, d) => sum + d.tasks_completed, 0)}
          </p>
          <p className="text-xs text-gray-600">Total Tasks</p>
        </div>
      </div>
    </div>
  );
}

