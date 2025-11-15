'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'
import { Clock, Lock, CheckCircle, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface TopicListProps {
  productId?: string
}

export function TopicList({ productId }: TopicListProps) {
  const { data: topics, isLoading } = trpc.learning.getTopics.useQuery({ productId })

  if (isLoading) {
    return <TopicListSkeleton />
  }

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4"
    >
      {topics?.map((topic) => (
        <motion.div key={topic.id} variants={itemVariants}>
          <TopicCard topic={topic} />
        </motion.div>
      ))}
    </motion.div>
  )
}

function TopicCard({ topic }: { topic: any }) {
  const isCompleted = !!topic.completion?.completed_at
  const isInProgress = !!topic.completion && !isCompleted
  const isLocked = topic.is_locked

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (isLocked) return <Lock className="h-5 w-5 text-gray-400" />
    if (isInProgress) return <PlayCircle className="h-5 w-5 text-blue-500" />
    return <PlayCircle className="h-5 w-5 text-gray-400" />
  }

  const getStatusBadge = () => {
    if (isCompleted) return <Badge variant="success">Completed</Badge>
    if (isLocked) return <Badge variant="secondary">Locked</Badge>
    if (isInProgress) return <Badge variant="default">In Progress</Badge>
    return <Badge variant="outline">Not Started</Badge>
  }

  return (
    <Card 
      className={`transition-all hover:shadow-lg ${
        isLocked ? 'opacity-60' : 'cursor-pointer'
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <CardTitle className="text-lg">
                Topic {topic.position}: {topic.title}
              </CardTitle>
            </div>
            <CardDescription>{topic.description}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isInProgress && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{topic.completion.completion_percentage}%</span>
              </div>
              <Progress value={topic.completion.completion_percentage} className="h-2" />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {topic.duration_minutes} min
              </span>
              <span>{topic.products?.name}</span>
            </div>
            
            {!isLocked && (
              <Link href={`/academy/topics/${topic.id}`}>
                <Button size="sm" variant={isCompleted ? 'outline' : 'default'}>
                  {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TopicListSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


