'use client';
import { useState, useRef, useEffect } from 'react';
import { Upload, MessageSquare, User, Bot, Loader2, FileText, Briefcase, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
interface Message {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}
interface InterviewSession {
  mode: 'practice' | 'answers';
  level: 'junior' | 'mid' | 'senior';
  messages: Message[];
  candidateProfile?: {
    resume: string;
    projectDetails: string;
    experience: string;
    skills: string[];
  };
}
export default function InterviewBotPage() {
  const [mode, setMode] = useState<'practice' | 'answers'>('practice');
  const [level, setLevel] = useState<'junior' | 'mid' | 'senior'>('mid');
  const [resume, setResume] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [profileAnalyzed, setProfileAnalyzed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'project') => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (type === 'resume') {
        setResume(content);
        toast.success('Resume uploaded');
      } else {
        setProjectDetails(content);
        toast.success('Project details uploaded');
      }
    };
    reader.readAsText(file);
  };
  const analyzeProfile = async () => {
    if (!resume.trim()) {
      toast.error('Please provide a resume');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/companions/interview-bot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          projectDetails,
          level
        }),
      });
      if (!response.ok) throw new Error('Analysis failed');
      const result = await response.json();
      setProfileAnalyzed(true);
      toast.success('Profile analyzed! Ready to start interview.');
    } catch (error) {
      toast.error('Failed to analyze profile');
    } finally {
      setLoading(false);
    }
  };
  const startInterview = async () => {
    if (mode === 'answers' && !profileAnalyzed) {
      toast.error('Please analyze the candidate profile first');
      return;
    }
    setLoading(true);
    setInterviewStarted(true);
    try {
      const response = await fetch('/api/companions/interview-bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          level,
          resume: mode === 'answers' ? resume : undefined,
          projectDetails: mode === 'answers' ? projectDetails : undefined
        }),
      });
      if (!response.ok) throw new Error('Failed to start interview');
      const result = await response.json();
      setMessages([{
        role: 'interviewer',
        content: result.question,
        timestamp: new Date()
      }]);
    } catch (error) {
      toast.error('Failed to start interview');
      setInterviewStarted(false);
    } finally {
      setLoading(false);
    }
  };
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = {
      role: 'candidate',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/companions/interview-bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          level,
          messages: [...messages, userMessage],
          resume,
          projectDetails
        }),
      });
      if (!response.ok) throw new Error('Failed to get response');
      const result = await response.json();
      setMessages(prev => [...prev, {
        role: 'interviewer',
        content: result.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };
  const generateAnswers = async () => {
    if (!resume.trim()) {
      toast.error('Please provide a resume');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/companions/interview-bot/generate-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          projectDetails,
          level
        }),
      });
      if (!response.ok) throw new Error('Failed to generate answers');
      const result = await response.json();
      setMessages(result.qaSet.map((qa: any, idx: number) => ([
        {
          role: 'interviewer' as const,
          content: qa.question,
          timestamp: new Date(Date.now() + idx * 1000)
        },
        {
          role: 'candidate' as const,
          content: qa.answer,
          timestamp: new Date(Date.now() + idx * 1000 + 500)
        }
      ])).flat());
      toast.success('Generated interview answers!');
    } catch (error) {
      toast.error('Failed to generate answers');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <MessageSquare className="w-10 h-10 text-green-600" />
            Guidewire Interview Bot
          </h1>
          <p className="text-gray-600">Practice interviews or generate answers based on candidate profiles</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Interview Area */}
          <div className="lg:col-span-2">
            {!interviewStarted ? (
              <Card>
                <CardHeader>
                  <CardTitle>Interview Setup</CardTitle>
                  <CardDescription>Configure your interview session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mode Selection */}
                  <div>
                    <Label>Interview Mode</Label>
                    <Tabs value={mode} onValueChange={(v: any) => setMode(v)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="practice">Practice Mode</TabsTrigger>
                        <TabsTrigger value="answers">Answer Generation</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <p className="text-sm text-gray-600 mt-2">
                      {mode === 'practice' 
                        ? 'Interactive Q&A practice - simulate a real interview'
                        : 'Generate answers based on resume and project details'}
                    </p>
                  </div>
                  {/* Experience Level */}
                  <div>
                    <Label>Experience Level</Label>
                    <Select value={level} onValueChange={(v: any) => setLevel(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (6+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Resume & Project Details (for Answer Mode) */}
                  {mode === 'answers' && (
                    <>
                      <div>
                        <Label>Resume</Label>
                        <Textarea
                          value={resume}
                          onChange={(e) => setResume(e.target.value)}
                          placeholder="Paste resume content or upload a file..."
                          className="min-h-[150px] font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Resume
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'resume')}
                          accept=".txt,.doc,.docx,.pdf"
                        />
                      </div>
                      <div>
                        <Label>Project Details (Optional)</Label>
                        <Textarea
                          value={projectDetails}
                          onChange={(e) => setProjectDetails(e.target.value)}
                          placeholder="Detailed project documentation, achievements, technical details..."
                          className="min-h-[150px] font-mono text-sm"
                        />
                      </div>
                      <Button
                        onClick={analyzeProfile}
                        disabled={loading || !resume.trim()}
                        variant="outline"
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing Profile...
                          </>
                        ) : profileAnalyzed ? (
                          <>✓ Profile Analyzed</>
                        ) : (
                          <>
                            <Briefcase className="w-4 h-4 mr-2" />
                            Analyze Profile
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  {/* Start Interview */}
                  <div className="flex gap-3">
                    {mode === 'practice' ? (
                      <Button
                        onClick={startInterview}
                        disabled={loading}
                        className="flex-1"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Practice Interview
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={generateAnswers}
                        disabled={loading || !resume.trim()}
                        className="flex-1"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Interview Answers
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[700px] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Interview in Progress</CardTitle>
                      <CardDescription>
                        {mode === 'practice' ? 'Practice' : 'Answer Generation'} - {level} level
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInterviewStarted(false);
                        setMessages([]);
                      }}
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      End Interview
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {messages.map((message, idx) => (
                      <div
                        key={idx}
                        className={`flex ${message.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === 'interviewer'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-green-100 text-green-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {message.role === 'interviewer' ? (
                              <Bot className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                            <span className="font-semibold text-sm">
                              {message.role === 'interviewer' ? 'Interviewer' : 'Candidate'}
                            </span>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-blue-100 rounded-lg p-4">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
                {mode === 'practice' && (
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Type your answer..."
                        className="flex-1"
                        rows={2}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
          {/* Tips & Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Interview Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Practice Mode</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Real-time Q&A simulation</li>
                    <li>• Get feedback on answers</li>
                    <li>• Build confidence</li>
                    <li>• Learn from mistakes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Answer Mode</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Based on your profile</li>
                    <li>• Uses resume + projects</li>
                    <li>• Generates realistic answers</li>
                    <li>• Ready-to-use responses</li>
                  </ul>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Best Practices</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Be specific with examples</li>
                    <li>• Quantify achievements</li>
                    <li>• Show problem-solving</li>
                    <li>• Mention technologies used</li>
                    <li>• Discuss team collaboration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
