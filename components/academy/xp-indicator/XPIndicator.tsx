'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { Zap, TrendingUp, Trophy, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { calculateLevelInfo } from '@/types/academy-lms'

export function XPIndicator() {
  const { data: userLevel } = trpc.gamification.getUserLevel.useQuery()
  const { data: stats } = trpc.gamification.getGamificationStats.useQuery()
  const [showXPGain, setShowXPGain] = useState<number | null>(null)

  // Subscribe to XP updates (in production, use websockets or SSE)
  useEffect(() => {
    if (showXPGain) {
      const timer = setTimeout(() => setShowXPGain(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [showXPGain])

  if (!userLevel || !stats) {
    return null
  }

  const levelInfo = calculateLevelInfo(userLevel.total_xp)

  return (
    <div className="flex items-center gap-3">
      {/* Streak Indicator */}
      {stats.streak > 0 && (
        <Badge variant="secondary" className="gap-1">
          <Flame className="h-3 w-3 text-orange-500" />
          {stats.streak}
        </Badge>
      )}

      {/* XP Indicator */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 relative"
          >
            <div className="flex items-center gap-2">
              <Badge className="gap-1 bg-gradient-to-r from-primary-600 to-accent-600">
                <Zap className="h-3 w-3" />
                Level {userLevel.current_level}
              </Badge>
              <span className="text-sm font-medium">
                {userLevel.total_xp.toLocaleString()} XP
              </span>
            </div>
            
            {/* XP Gain Animation */}
            <AnimatePresence>
              {showXPGain && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -20 }}
                  exit={{ opacity: 0, y: -40 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  <Badge className="bg-green-500 text-white">
                    +{showXPGain} XP
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary-600" />
                Level Progress
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {levelInfo.title}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level {userLevel.current_level}</span>
                <span>Level {userLevel.current_level + 1}</span>
              </div>
              <Progress value={levelInfo.progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {userLevel.current_xp} / {levelInfo.xpForNext - levelInfo.xpRequired} XP
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-sm font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {stats.weeklyXP} XP
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Skill Points</p>
                <p className="text-sm font-semibold">
                  {stats.skillPoints - stats.skillPointsSpent} available
                </p>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// XP Gain Hook (for triggering animations)
export function useXPGain() {
  const [xpGains, setXPGains] = useState<number[]>([])

  const showXPGain = (amount: number) => {
    setXPGains(prev => [...prev, amount])
    setTimeout(() => {
      setXPGains(prev => prev.slice(1))
    }, 3000)
  }

  return { xpGains, showXPGain }
}


