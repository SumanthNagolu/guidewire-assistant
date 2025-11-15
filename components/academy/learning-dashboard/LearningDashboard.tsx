'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { ArrowRight, Award, BookOpen, Flame, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

export function LearningDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.learning.getStats.useQuery()
  const { data: learningPath, isLoading: pathLoading } = trpc.learning.getLearningPath.useQuery({})

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  if (statsLoading || pathLoading) {
    return <DashboardSkeleton />
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Daily Mission Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Daily Mission</CardTitle>
                <CardDescription className="text-base mt-1">
                  Complete 2 topics to maintain your streak
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  <Flame className="w-4 h-4 mr-1 text-orange-500" />
                  {stats?.currentStreak || 0} day streak
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Today's Progress</span>
                  <span className="font-medium">1/2 Topics</span>
                </div>
                <Progress value={50} className="h-3" />
              </div>
              <p className="text-sm text-muted-foreground">
                Complete one more topic to earn your daily bonus XP!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <StatsCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Topics Completed"
          value={stats?.totalCompleted || 0}
          subtitle={`of ${stats?.totalTopics || 0} total`}
          color="blue"
        />
        <StatsCard
          icon={<TrendingUp className="h-5 w-5" />}
          title="Overall Progress"
          value={`${stats?.completionPercentage || 0}%`}
          subtitle="Keep going!"
          color="green"
        />
        <StatsCard
          icon={<Award className="h-5 w-5" />}
          title="Current Level"
          value="7"
          subtitle="2,450 XP"
          color="yellow"
        />
        <StatsCard
          icon={<Flame className="h-5 w-5" />}
          title="Learning Streak"
          value={`${stats?.currentStreak || 0} days`}
          subtitle="Personal best: 14"
          color="orange"
        />
      </motion.div>

      {/* Learning Journey */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Learning Journey</CardTitle>
            <CardDescription>
              {learningPath?.name || 'Sequential Learning Path'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-4">
              {learningPath?.topics_sequence.slice(0, 5).map((topicId, index) => (
                <div key={topicId} className="flex items-center">
                  <TopicNode
                    status={index < 2 ? 'completed' : index === 2 ? 'current' : 'locked'}
                    number={index + 1}
                  />
                  {index < 4 && (
                    <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/academy/topics">
                <Button className="w-full">
                  Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Achievements */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Achievements</CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <AchievementBadge
                icon="🚀"
                name="First Steps"
                description="Complete your first topic"
                xp={50}
              />
              <AchievementBadge
                icon="⚡"
                name="Speed Learner"
                description="Complete 5 topics in one day"
                xp={200}
                locked
              />
              <AchievementBadge
                icon="🎯"
                name="Perfect Shot"
                description="Score 100% on a quiz"
                xp={150}
                locked
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function StatsCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
  color: 'blue' | 'green' | 'yellow' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  }

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function TopicNode({
  status,
  number,
}: {
  status: 'completed' | 'current' | 'locked'
  number: number
}) {
  const statusClasses = {
    completed: 'bg-green-500 text-white',
    current: 'bg-accent-500 text-white ring-4 ring-accent-200',
    locked: 'bg-gray-200 text-gray-500',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold cursor-pointer transition-all ${
        statusClasses[status]
      }`}
    >
      {status === 'completed' ? '✓' : number}
    </motion.div>
  )
}

function AchievementBadge({
  icon,
  name,
  description,
  xp,
  locked = false,
}: {
  icon: string
  name: string
  description: string
  xp: number
  locked?: boolean
}) {
  return (
    <motion.div
      whileHover={!locked ? { scale: 1.05 } : {}}
      className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
        locked
          ? 'bg-gray-50 border-gray-200 opacity-50'
          : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 cursor-pointer'
      }`}
    >
      <div className="text-4xl mb-2">{locked ? '🔒' : icon}</div>
      <h4 className="font-semibold text-sm">{name}</h4>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      <Badge variant="secondary" className="mt-2">
        +{xp} XP
      </Badge>
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-4 w-48 mt-4" />
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


