'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'
import { Trophy, Lock, Star, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { ACHIEVEMENT_CATEGORIES } from '@/types/academy-lms'

export function AchievementsList() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const { data: achievements, isLoading } = trpc.gamification.getUserAchievements.useQuery({
    category: selectedCategory as any,
    limit: 100,
  })

  const { data: stats } = trpc.gamification.getGamificationStats.useQuery()

  if (isLoading) {
    return <AchievementsListSkeleton />
  }

  const unlockedCount = achievements?.filter(a => a.unlocked).length || 0
  const totalCount = achievements?.length || 0
  const completionPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievement Progress
          </CardTitle>
          <CardDescription>
            {unlockedCount} of {totalCount} achievements unlocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="h-3" />
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {stats?.totalAchievements || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Unlocked</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {achievements?.filter(a => a.unlocked && a.category === 'learning').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Learning</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {achievements?.filter(a => a.unlocked && a.category === 'mastery').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Mastery</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {achievements?.filter(a => a.unlocked && a.category === 'special').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Special</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => (
            <TabsTrigger key={key} value={key}>
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {achievements?.map((achievement) => (
              <motion.div key={achievement.id} variants={itemVariants}>
                <AchievementCard achievement={achievement} />
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AchievementCard({ achievement }: { achievement: any }) {
  const category = ACHIEVEMENT_CATEGORIES[achievement.category as keyof typeof ACHIEVEMENT_CATEGORIES]
  const isUnlocked = achievement.unlocked
  const isSecret = achievement.is_secret && !isUnlocked

  return (
    <Card 
      className={`relative overflow-hidden transition-all ${
        isUnlocked 
          ? 'border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' 
          : 'opacity-75'
      }`}
    >
      {isUnlocked && (
        <div className="absolute top-2 right-2">
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className={`text-4xl ${isSecret ? 'blur-sm' : ''}`}>
            {isSecret ? '❓' : achievement.icon_url || category.icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">
              {isSecret ? '???' : achievement.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {isSecret ? 'Hidden achievement' : achievement.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge 
            variant={isUnlocked ? 'default' : 'secondary'}
            className="gap-1"
          >
            {isUnlocked ? (
              <>
                <Zap className="h-3 w-3" />
                +{achievement.xp_reward} XP
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Locked
              </>
            )}
          </Badge>
          
          {isUnlocked && achievement.unlocked_at && (
            <p className="text-xs text-muted-foreground">
              {new Date(achievement.unlocked_at).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {!isUnlocked && !isSecret && achievement.requirements?.type === 'progress' && (
          <div className="mt-3">
            <Progress 
              value={(achievement.progress || 0) * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Progress: {Math.round((achievement.progress || 0) * 100)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AchievementsListSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mt-2 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


