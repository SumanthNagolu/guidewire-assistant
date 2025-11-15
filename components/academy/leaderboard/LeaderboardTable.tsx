'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import { Trophy, Medal, Award, TrendingUp, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

export function LeaderboardTable() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('weekly')
  
  const { data: leaderboard, isLoading } = trpc.gamification.getLeaderboard.useQuery({
    type: timeframe,
    limit: 50,
  })

  const { data: userRank } = trpc.gamification.getUserRank.useQuery({
    type: timeframe,
  })

  const { data: userLevel } = trpc.gamification.getUserLevel.useQuery()

  if (isLoading) {
    return <LeaderboardSkeleton />
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
      default:
        return ''
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* User Rank Card */}
      {userRank?.rank && (
        <Card className="bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary-600" />
              Your Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-primary-700">
                  #{userRank.rank}
                </p>
                <p className="text-sm text-muted-foreground">
                  out of {userRank.totalPlayers} players
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-lg font-semibold">
                    Top {userRank.percentile}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Level {userLevel?.current_level || 1}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                Top performers based on XP earned
              </CardDescription>
            </div>
            <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
              <TabsList>
                <TabsTrigger value="weekly">This Week</TabsTrigger>
                <TabsTrigger value="monthly">This Month</TabsTrigger>
                <TabsTrigger value="all-time">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {leaderboard?.period && (
            <p className="text-sm text-muted-foreground mb-4">
              Period: {new Date(leaderboard.period.start).toLocaleDateString()} - {' '}
              {new Date(leaderboard.period.end).toLocaleDateString()}
            </p>
          )}
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {leaderboard?.entries.map((entry) => (
              <motion.div
                key={entry.user_id}
                variants={itemVariants}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                  getRankStyle(entry.rank)
                }`}
              >
                <div className="w-12 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                <Avatar>
                  <AvatarImage src={entry.user?.avatar_url} />
                  <AvatarFallback>
                    {entry.user?.first_name?.[0]}{entry.user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <p className="font-medium">
                    {entry.user?.first_name} {entry.user?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Level {Math.floor(entry.score / 1000) + 1}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-700">
                    {entry.score.toLocaleString()} XP
                  </p>
                  {entry.rank <= 3 && (
                    <Badge variant="secondary" className="mt-1">
                      Top {entry.rank}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {leaderboard?.entries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No data available for this period yet.</p>
              <p className="text-sm mt-2">Start learning to climb the ranks!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mt-1" />
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


