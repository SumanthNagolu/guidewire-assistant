'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { trpc } from '@/lib/trpc/client'
import { Send, Sparkles, User, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface AIMentorChatProps {
  topicId?: string
  initialQuestion?: string
}

export function AIMentorChat({ topicId, initialQuestion }: AIMentorChatProps) {
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [question, setQuestion] = useState(initialQuestion || '')
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [messages, setMessages] = useState<Message[]>([])
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])

  const askMentorMutation = trpc.ai.askMentor.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      }])
      setFollowUpQuestions(data.suggestedFollowUps || [])
      setQuestion('')
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to get response from AI mentor',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = async () => {
    if (!question.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }
    
    setMessages(prev => [...prev, userMessage])

    await askMentorMutation.mutateAsync({
      question,
      topicId,
      conversationId,
      context: {
        currentTopic: topicId,
      },
    })
  }

  const handleFollowUp = (followUpQuestion: string) => {
    setQuestion(followUpQuestion)
  }

  const resetConversation = () => {
    setMessages([])
    setConversationId(undefined)
    setFollowUpQuestions([])
    setQuestion('')
  }

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-600" />
              AI Mentor
            </CardTitle>
            <CardDescription>
              Ask questions about your current topic or Guidewire in general
            </CardDescription>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetConversation}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              New Chat
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary-300" />
              <p className="text-lg mb-2">Welcome to your AI Mentor!</p>
              <p className="text-sm">
                I'm here to help you understand concepts, solve problems, and prepare for interviews.
              </p>
              {topicId && (
                <p className="text-sm mt-2">
                  Ask me anything about the current topic or Guidewire development.
                </p>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 mb-6 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 bg-primary-100">
                      <Sparkles className="h-5 w-5 text-primary-600" />
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm">{message.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                    <p
                      className={`text-xs mt-2 ${
                        message.role === 'user'
                          ? 'text-primary-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 bg-gray-200">
                      <User className="h-5 w-5 text-gray-600" />
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {askMentorMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8 bg-primary-100">
                <Sparkles className="h-5 w-5 text-primary-600" />
              </Avatar>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </ScrollArea>
        
        {followUpQuestions.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Suggested follow-ups:
            </p>
            <div className="flex flex-wrap gap-2">
              {followUpQuestions.map((q, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleFollowUp(q)}
                >
                  {q}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your AI mentor a question..."
              rows={2}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={!question.trim() || askMentorMutation.isPending}
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  )
}


