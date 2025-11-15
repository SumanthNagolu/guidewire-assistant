"use client";

import { useCallback, useEffect, useState } from "react";
import { logger } from "@/lib/utils/logger";

export default function SprintBoard({ sprint, userId }: { sprint: any; userId?: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/productivity/tasks?sprint_id=${sprint.id}${userId ? `&user_id=${userId}` : ''}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      logger.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [sprint.id, userId]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const tasksByStatus = {
    backlog: tasks.filter((t) => t.status === 'backlog'),
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    in_review: tasks.filter((t) => t.status === 'in_review'),
    done: tasks.filter((t) => t.status === 'done'),
    blocked: tasks.filter((t) => t.status === 'blocked'),
  };

  const columns = [
    { key: 'backlog', title: 'Backlog', color: 'gray' },
    { key: 'todo', title: 'To Do', color: 'blue' },
    { key: 'in_progress', title: 'In Progress', color: 'yellow' },
    { key: 'in_review', title: 'Review', color: 'purple' },
    { key: 'done', title: 'Done', color: 'green' },
    { key: 'blocked', title: 'Blocked', color: 'red' },
  ];

  if (loading) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading sprint board...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">{sprint.name}</h2>
          <p className="text-sm text-gray-600">
            {new Date(sprint.start_date).toLocaleDateString()} -{' '}
            {new Date(sprint.end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-purple-600">
            {sprint.completed_story_points}/{sprint.planned_story_points}
          </p>
          <p className="text-sm text-gray-600">Story Points</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {columns.map((column) => (
          <div key={column.key} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <span className={`text-xs bg-${column.color}-100 text-${column.color}-800 px-2 py-1 rounded`}>
                {tasksByStatus[column.key as keyof typeof tasksByStatus].length}
              </span>
            </div>
            <div className="space-y-2">
              {tasksByStatus[column.key as keyof typeof tasksByStatus].map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-3 rounded shadow-sm hover:shadow transition cursor-pointer"
                >
                  <p className="text-sm font-medium line-clamp-2">{task.title}</p>
                  <div className="flex gap-2 mt-2">
                    {task.priority && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded capitalize">
                        {task.priority}
                      </span>
                    )}
                    {task.story_points && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        {task.story_points}sp
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

