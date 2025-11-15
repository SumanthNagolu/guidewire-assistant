'use client';

export default function DashboardOverview({
  scores,
  sprint,
  standupCount,
  bottleneckCount,
  isAdmin,
}: {
  scores: any[];
  sprint: any;
  standupCount: number;
  bottleneckCount: number;
  isAdmin: boolean;
}) {
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + (s.overall_score || 0), 0) / scores.length)
    : 0;

  const totalActiveTime = scores.reduce(
    (sum, s) => sum + (s.total_active_time_minutes || 0),
    0
  );

  const totalTasks = scores.reduce((sum, s) => sum + (s.tasks_completed || 0), 0);

  const sprintProgress = sprint
    ? Math.round((sprint.completed_story_points / sprint.planned_story_points) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {isAdmin ? 'Team Productivity' : 'Your Productivity'}
            </p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{avgScore}</p>
            <p className="text-xs text-gray-500 mt-1">Score out of 100</p>
          </div>
          <div className="text-4xl">📊</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Time Today</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {Math.round(totalActiveTime / (isAdmin ? scores.length || 1 : 1))}m
            </p>
            <p className="text-xs text-gray-500 mt-1">Average per person</p>
          </div>
          <div className="text-4xl">⏱️</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Sprint Progress</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{sprintProgress}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {sprint?.name || 'No active sprint'}
            </p>
          </div>
          <div className="text-4xl">🎯</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Daily Standups</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">
              {standupCount}
              {isAdmin && `/${scores.length}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">Completed today</p>
          </div>
          <div className="text-4xl">✅</div>
        </div>
      </div>
    </div>
  );
}

