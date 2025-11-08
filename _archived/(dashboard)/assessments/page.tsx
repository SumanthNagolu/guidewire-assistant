import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClipboardCheck, MessageSquare, ArrowRight } from 'lucide-react';

export default function AssessmentsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <p className="text-muted-foreground">
          Validate your knowledge and unlock interview readiness. Choose how you want to test your skills below.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {/* Quizzes Card */}
        <Card className="flex flex-col hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Knowledge Quizzes</CardTitle>
            </div>
            <CardDescription className="text-base">
              Test your understanding with multiple-choice questions on specific topics. 
              Get immediate feedback and track your progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Topic-specific quizzes with 5-10 questions each</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Instant scoring and detailed explanations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Track your quiz history and improvement</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Passing score: 70% required</span>
              </div>
            </div>
            <Link href="/assessments/quizzes" className="w-full">
              <Button className="w-full gap-2">
                Browse Quizzes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Interview Simulator Card */}
        <Card className="flex flex-col hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Interview Simulator</CardTitle>
            </div>
            <CardDescription className="text-base">
              Practice realistic technical interviews with AI. Build confidence through 
              Socratic-style conversations and structured feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Realistic interview scenarios (Junior to Senior level)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>AI adapts questions based on your responses</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Structured evaluation with detailed feedback</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Practice behavioral and technical questions</span>
              </div>
            </div>
            <Link href="/assessments/interview" className="w-full">
              <Button className="w-full gap-2" variant="default">
                Start Interview Practice
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Additional Info */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-lg">💡 Recommended Approach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
            <div>
              <p className="font-medium">Complete topic lessons and quizzes first</p>
              <p className="text-sm text-muted-foreground">Build foundational knowledge through structured learning</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">2</span>
            <div>
              <p className="font-medium">Practice with interview simulator regularly</p>
              <p className="text-sm text-muted-foreground">Develop communication skills and interview confidence</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">3</span>
            <div>
              <p className="font-medium">Review feedback and iterate</p>
              <p className="text-sm text-muted-foreground">Focus on areas where you need improvement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

