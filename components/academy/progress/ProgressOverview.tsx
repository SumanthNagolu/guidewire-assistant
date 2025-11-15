'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import { BarChart, Calendar, Target, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function ProgressOverview() {
  const { data: stats } = trpc.learning.getStats.useQuery()
  const { data: gamificationStats } = trpc.gamification.getGamificationStats.useQuery()
  const { data: xpHistory } = trpc.gamification.getXPHistory.useQuery({ days: 30 })

  const chartData = xpHistory?.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    xp: day.xp_earned,
  })) || []

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary-600" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.completionPercentage || 0}%
            </div>
            <Progress
              value={stats?.completionPercentage || 0}
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.totalCompleted || 0} of {stats?.totalTopics || 0} topics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart className="h-4 w-4 text-green-600" />
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Level {gamificationStats?.level || 1}
            </div>
            <Progress
              value={gamificationStats?.levelProgress || 0}
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {gamificationStats?.currentXP || 0} / {gamificationStats?.nextLevelXP || 100} XP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Weekly XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gamificationStats?.weeklyXP || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep it up!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              Learning Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.currentStreak || 0} days
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Personal best: 14 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* XP Chart */}
      <Card>
        <CardHeader>
          <CardTitle>XP Progress</CardTitle>
          <CardDescription>
            Your experience points earned over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#1F2937', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#xpGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest learning achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentCompletions?.slice(0, 5).map((completion: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium">Topic Completed</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(completion.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">+50 XP</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
