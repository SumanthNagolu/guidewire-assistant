import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MentorChat from '@/components/features/ai-mentor/MentorChat';
import { MessageSquare, Sparkles } from 'lucide-react';

export default async function AIMentorPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile for personalization
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, assumed_persona')
    .eq('id', user.id)
    .maybeSingle();

  const firstName = profile?.first_name || 'there';
  const persona = profile?.assumed_persona || '0-2 years experience';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-indigo-600" />
          AI Mentor
        </h1>
        <p className="text-muted-foreground mt-2">
          Ask questions, explore concepts, and get Socratic guidance from your AI mentor.
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Welcome, {firstName}!
          </CardTitle>
          <CardDescription>
            Your AI mentor adapts to your experience level: <strong>{persona}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700 space-y-2">
            <p className="font-medium">💡 How to get the most from your mentor:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ask &quot;why&quot; and &quot;how&quot; questions to deepen understanding</li>
              <li>Request examples related to your experience level</li>
              <li>Explore how concepts connect to real-world scenarios</li>
              <li>The mentor uses the Socratic method—it guides, doesn&apos;t just answer</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* AI Chat */}
      <Card>
        <CardHeader>
          <CardTitle>Start a Conversation</CardTitle>
          <CardDescription>
            Ask about any Guidewire topic, concept, or scenario. Your conversation history is saved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MentorChat topicTitle="General Discussion" />
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Example Questions to Try</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900">🏢 Architecture & Design:</p>
              <ul className="text-blue-800 space-y-1 pl-4">
                <li>• &quot;How does ClaimCenter&apos;s data model support complex claims?&quot;</li>
                <li>• &quot;What are best practices for PolicyCenter integrations?&quot;</li>
              </ul>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900">💼 Real-World Scenarios:</p>
              <ul className="text-blue-800 space-y-1 pl-4">
                <li>• &quot;Walk me through a typical claim lifecycle scenario&quot;</li>
                <li>• &quot;How would you design a custom billing calculation?&quot;</li>
              </ul>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900">🎯 Interview Prep:</p>
              <ul className="text-blue-800 space-y-1 pl-4">
                <li>• &quot;What are common interview questions about Guidewire Cloud?&quot;</li>
                <li>• &quot;How do I explain my experience with rule configuration?&quot;</li>
              </ul>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900">🔧 Technical Deep Dives:</p>
              <ul className="text-blue-800 space-y-1 pl-4">
                <li>• &quot;Explain Gosu closures with a practical example&quot;</li>
                <li>• &quot;How does Guidewire handle transaction management?&quot;</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

