'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import { CheckCircle, Clock, Play } from 'lucide-react'
import { motion } from 'framer-motion'

interface LearningBlockPlayerProps {
  block: any
  onComplete: () => void
}

export function LearningBlockPlayer({ block, onComplete }: LearningBlockPlayerProps) {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isCompleted, setIsCompleted] = useState(
    !!block.learning_block_completions?.[0]?.completed_at
  )

  const startBlockMutation = trpc.learning.startLearningBlock.useMutation()
  const completeBlockMutation = trpc.learning.completeLearningBlock.useMutation({
    onSuccess: () => {
      setIsCompleted(true)
      onComplete()
    },
  })

  useEffect(() => {
    if (!isCompleted && !startTime) {
      handleStartBlock()
    }
  }, [block.id])

  const handleStartBlock = async () => {
    setStartTime(Date.now())
    await startBlockMutation.mutateAsync({ blockId: block.id })
  }

  const handleCompleteBlock = async () => {
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
    await completeBlockMutation.mutateAsync({
      blockId: block.id,
      timeSpentSeconds: timeSpent,
      score: 100, // For now, always 100
    })
  }

  const renderContent = () => {
    const content = block.content as any
    
    switch (block.block_type) {
      case 'theory':
        return (
          <div className="space-y-4">
            {content.video_url && (
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <Play className="h-16 w-16 text-white" />
                {/* Replace with actual video player */}
              </div>
            )}
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content.html || '' }} />
            </div>
          </div>
        )
      
      case 'demo':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <Play className="h-16 w-16 text-white" />
              {/* Replace with demo video player */}
            </div>
            {content.steps && (
              <ol className="space-y-2">
                {content.steps.map((step: string, index: number) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )
      
      case 'practice':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Exercise</h4>
              <p className="text-sm text-gray-600">{content.instructions}</p>
            </div>
            {content.code_template && (
              <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
                <code>{content.code_template}</code>
              </pre>
            )}
          </div>
        )
      
      case 'project':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Project Brief</h4>
              <p className="text-sm text-blue-800">{content.brief}</p>
            </div>
            {content.requirements && (
              <div>
                <h5 className="font-medium mb-2">Requirements</h5>
                <ul className="space-y-1">
                  {content.requirements.map((req: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      
      default:
        return <div>Content not available</div>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {block.title}
              {isCompleted && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Completed
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Clock className="h-4 w-4" />
              {block.duration_minutes} minutes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {renderContent()}
          
          {!isCompleted && (
            <div className="pt-4 border-t">
              <Button 
                onClick={handleCompleteBlock}
                disabled={completeBlockMutation.isPending}
                className="w-full"
              >
                Mark as Complete
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}


