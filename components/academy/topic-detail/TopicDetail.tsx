'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { trpc } from '@/lib/trpc/client'
import { 
  BookOpen, 
  PlayCircle, 
  Code, 
  FileText, 
  CheckCircle, 
  Lock,
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LearningBlockPlayer } from './LearningBlockPlayer'

interface TopicDetailProps {
  topicId: string
}

export function TopicDetail({ topicId }: TopicDetailProps) {
  const router = useRouter()
  const [activeBlockIndex, setActiveBlockIndex] = useState(0)
  
  const { data: topic, isLoading } = trpc.learning.getTopic.useQuery(topicId)
  const { data: blocks } = trpc.learning.getLearningBlocks.useQuery(topicId)
  
  const startTopicMutation = trpc.learning.startTopic.useMutation({
    onSuccess: () => {
      // Refetch topic data
      router.refresh()
    },
  })
  
  const completeTopicMutation = trpc.learning.completeTopic.useMutation({
    onSuccess: () => {
      router.push('/academy/topics')
    },
  })

  if (isLoading || !topic) {
    return <TopicDetailSkeleton />
  }

  const isStarted = !!topic.completion?.started_at
  const isCompleted = !!topic.completion?.completed_at
  const canStart = !topic.is_locked && !isCompleted

  const completedBlocks = blocks?.filter(
    (block) => block.learning_block_completions?.[0]?.completed_at
  ).length || 0
  
  const totalBlocks = blocks?.length || 0
  const progress = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0

  const handleStartTopic = async () => {
    if (canStart) {
      await startTopicMutation.mutateAsync({ topicId })
    }
  }

  const handleCompleteTopic = async () => {
    const timeSpent = topic.completion?.time_spent_seconds || 0
    await completeTopicMutation.mutateAsync({
      topicId,
      timeSpentSeconds: timeSpent + 300, // Add 5 minutes
    })
  }

  return (
    <div className="space-y-6">
      {/* Topic Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                Topic {topic.position}: {topic.title}
              </CardTitle>
              <CardDescription className="text-base">
                {topic.description}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              {topic.is_locked && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Completed
                </Badge>
              )}
              {isStarted && !isCompleted && (
                <Badge variant="default">In Progress</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {topic.is_locked ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Complete the prerequisite topics to unlock this content.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {isStarted && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {completedBlocks} of {totalBlocks} blocks completed
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{topic.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{topic.products?.name}</span>
                </div>
              </div>
              
              {!isStarted && (
                <Button 
                  onClick={handleStartTopic}
                  disabled={!canStart || startTopicMutation.isPending}
                  className="w-full"
                >
                  Start Topic
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Content */}
      {isStarted && blocks && blocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Blocks</CardTitle>
            <CardDescription>
              Complete each block to master this topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeBlockIndex.toString()} onValueChange={(v) => setActiveBlockIndex(parseInt(v))}>
              <TabsList className="grid grid-cols-4 w-full max-w-lg">
                {blocks.map((block, index) => (
                  <TabsTrigger 
                    key={block.id} 
                    value={index.toString()}
                    className="gap-1"
                  >
                    {getBlockIcon(block.block_type)}
                    {block.block_type}
                    {block.learning_block_completions?.[0]?.completed_at && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <AnimatePresence mode="wait">
                {blocks.map((block, index) => (
                  <TabsContent key={block.id} value={index.toString()}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LearningBlockPlayer 
                        block={block}
                        onComplete={() => {
                          if (index < blocks.length - 1) {
                            setActiveBlockIndex(index + 1)
                          } else if (completedBlocks === totalBlocks - 1) {
                            // Last block completed, complete the topic
                            handleCompleteTopic()
                          }
                        }}
                      />
                    </motion.div>
                  </TabsContent>
                ))}
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getBlockIcon(blockType: string) {
  switch (blockType) {
    case 'theory':
      return <BookOpen className="h-4 w-4" />
    case 'demo':
      return <PlayCircle className="h-4 w-4" />
    case 'practice':
      return <Code className="h-4 w-4" />
    case 'project':
      return <FileText className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

function TopicDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


