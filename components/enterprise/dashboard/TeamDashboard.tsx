'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trpc } from '@/lib/trpc/client'
import { Users, TrendingUp, Target, Award, Activity, BookOpen } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TeamDashboardProps {
  organizationId: string
  userRole: string
}

export function TeamDashboard({ organizationId, userRole }: TeamDashboardProps) {
  const { data: teamProgress, isLoading: progressLoading } = trpc.enterprise.getTeamProgress.useQuery({
    organizationId,
    timeframe: 'month',
  })

  const { data: usageStats, isLoading: statsLoading } = trpc.enterprise.getUsageStats.useQuery(
    organizationId
  )

  const { data: analytics } = trpc.enterprise.getTeamAnalytics.useQuery({
    organizationId,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    groupBy: 'department',
  })

  if (progressLoading || statsLoading) {
    return <DashboardSkeleton />
  }

  const chartData = analytics?.data || []

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary-600" />
              Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamProgress?.overview.totalMembers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {teamProgress?.overview.activeMembers || 0} active this month
            </p>
            <Progress
              value={teamProgress?.overview.activityRate || 0}
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamProgress?.overview.totalCompletions || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Topics completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" />
              Team XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(teamProgress?.overview.totalXP || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Avg {teamProgress?.overview.avgXPPerUser || 0} per member
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Activity Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamProgress?.overview.activityRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Members active this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Info (Admin only) */}
      {['admin', 'owner'].includes(userRole) && usageStats && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription & Usage</CardTitle>
            <CardDescription>
              Your organization's current plan and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Subscription Tier</span>
                  <Badge variant="default" className="capitalize">
                    {usageStats.subscription.tier}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge
                    variant={
                      usageStats.subscription.status === 'active'
                        ? 'success'
                        : 'secondary'
                    }
                    className="capitalize"
                  >
                    {usageStats.subscription.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Seat Usage</span>
                    <span className="font-medium">
                      {usageStats.subscription.seats.used} / {usageStats.subscription.seats.purchased}
                    </span>
                  </div>
                  <Progress
                    value={
                      (usageStats.subscription.seats.used /
                        usageStats.subscription.seats.purchased) *
                      100
                    }
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {usageStats.subscription.seats.available} seats available
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers & Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>
              This month's learning leaders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamProgress?.topPerformers.map((performer: any, index: number) => (
                <div
                  key={performer.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">User {index + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        Level {Math.floor(performer.xp / 1000) + 1}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-700">
                      {performer.xp.toLocaleString()} XP
                    </p>
                  </div>
                </div>
              ))}
              {(!teamProgress?.topPerformers || teamProgress.topPerformers.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No activity data available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Department Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary-600" />
              Department Progress
            </CardTitle>
            <CardDescription>
              Completions by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
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
                    <Bar
                      dataKey="completions"
                      fill="#3B82F6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-600" />
                Active Learning Goals
              </CardTitle>
              <CardDescription>
                Team objectives and progress
              </CardDescription>
            </div>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Learning goals feature will be available soon</p>
            <p className="text-sm mt-2">
              Set team objectives and track collective progress
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-100 rounded animate-pulse mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Import Trophy icon if not already imported
import { Trophy } from 'lucide-react'


