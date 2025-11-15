'use client';

export default function EmployeeCard({
  employee,
  score,
  detailed = false,
}: {
  employee: any;
  score?: any;
  detailed?: boolean;
}) {
  const productivityScore = score?.overall_score || 0;
  const activeTime = score?.total_active_time_minutes || 0;
  const tasksCompleted = score?.tasks_completed || 0;

  const scoreColor =
    productivityScore >= 80
      ? 'text-green-600'
      : productivityScore >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
            {employee.first_name?.[0]}{employee.last_name?.[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {employee.first_name} {employee.last_name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{employee.role}</p>
          </div>
        </div>
        <div className={`text-2xl font-bold ${scoreColor}`}>{productivityScore}</div>
      </div>

      {detailed && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-xl font-bold text-gray-900">{Math.round(activeTime)}m</p>
            <p className="text-xs text-gray-600">Active</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-xl font-bold text-gray-900">{tasksCompleted}</p>
            <p className="text-xs text-gray-600">Tasks</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-xl font-bold text-gray-900">
              {score?.focus_score || 0}
            </p>
            <p className="text-xs text-gray-600">Focus</p>
          </div>
        </div>
      )}

      {!detailed && (
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-gray-600">
            ⏱️ {Math.round(activeTime)}m
          </span>
          <span className="text-gray-600">✅ {tasksCompleted} tasks</span>
        </div>
      )}
    </div>
  );
}

