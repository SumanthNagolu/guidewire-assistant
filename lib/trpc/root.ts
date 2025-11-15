import { router } from './trpc'
import { learningRouter } from '@/modules/learning/learning.router'
import { gamificationRouter } from '@/modules/gamification/gamification.router'
import { aiRouter } from '@/modules/ai/ai.router'
import { enterpriseRouter } from '@/modules/enterprise/enterprise.router'

export const appRouter = router({
  learning: learningRouter,
  gamification: gamificationRouter,
  ai: aiRouter,
  enterprise: enterpriseRouter,
})

export type AppRouter = typeof appRouter


