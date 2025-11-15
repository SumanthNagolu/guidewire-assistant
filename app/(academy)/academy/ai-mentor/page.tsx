import { Metadata } from 'next'
import { AIMentorChat } from '@/components/academy/ai-mentor/AIMentorChat'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Brain, FileText, Briefcase, GraduationCap } from 'lucide-react'
export const metadata: Metadata = {
  title: 'AI Mentor | InTime Academy',
  description: 'Get personalized guidance from your AI-powered mentor',
}
export default function AIMentorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Mentor</h1>
        <p className="text-gray-600 mt-2">
          Your personal AI-powered guide for mastering Guidewire development
        </p>
      </div>
      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="interview">Interview Prep</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="space-y-6">
          <AIMentorChat />
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary-600" />
                  Smart Assistance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get instant help with concepts, debugging, and best practices
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-600" />
                  Context Aware
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Answers tailored to your current topic and skill level
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary-600" />
                  Always Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Continuously updated with latest Guidewire knowledge
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="learning-path">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Learning Path</CardTitle>
              <CardDescription>
                Get a personalized curriculum based on your goals and experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-primary-300 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  AI-powered learning paths will analyze your profile and create a customized journey
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>AI Project Generator</CardTitle>
              <CardDescription>
                Get real-world projects tailored to your experience level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-primary-300 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Generate personalized projects based on your resume and target role
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="interview">
          <Card>
            <CardHeader>
              <CardTitle>Interview Preparation</CardTitle>
              <CardDescription>
                Practice with AI-generated interview questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <GraduationCap className="h-16 w-16 text-primary-300 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Mock interviews and personalized feedback to ace your next opportunity
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
