'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { InterviewTemplate } from '@/modules/assessments/types';
import { finalizeInterview, startInterview } from '@/app/(dashboard)/assessments/interview/actions';

type Message = {
  role: 'interviewer' | 'candidate';
  content: string;
};

type Props = {
  templates: InterviewTemplate[];
};

export default function InterviewSimulator({ templates }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    templates[0]?.id ?? ''
  );
  const [selectedPersona, setSelectedPersona] = useState<string>('junior');
  const [isStreaming, setIsStreaming] = useState(false);
  const [summary, setSummary] = useState<{
    readinessScore: number;
    strengths: string | null;
    improvements: string | null;
    recommendations: string | null;
    summary: string | null;
  } | null>(null);
  const [isStarting, startTransition] = useTransition();

  // Filter templates by selected persona
  const filteredTemplates = useMemo(
    () => templates.filter((t) => t.persona === selectedPersona),
    [templates, selectedPersona]
  );

  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplate) ?? null,
    [selectedTemplate, templates]
  );

  // Update selected template when persona changes
  useEffect(() => {
    if (filteredTemplates.length > 0 && !filteredTemplates.find((t) => t.id === selectedTemplate)) {
      setSelectedTemplate(filteredTemplates[0].id);
    }
  }, [filteredTemplates, selectedTemplate]);

  const resetSession = () => {
    setMessages([]);
    setPendingAssistantMessage('');
    setSummary(null);
    setCurrentInput('');
    setSessionId(null);
  };

  const initializeInterview = (templateId?: string) => {
    startTransition(async () => {
      try {
        resetSession();
        const response = await startInterview(templateId);

        if (!response.success) {
          toast.error('Unable to start interview.');
          return;
        }

        setSessionId(response.data.id);
        await streamInterviewerResponse(response.data.id, templateId);
      } catch (error) {
        console.error(error);
        toast.error('Failed to launch interview session.');
      }
    });
  };

  const streamInterviewerResponse = async (session: string, templateId?: string, candidateMessage?: string) => {
    setIsStreaming(true);
    setPendingAssistantMessage('');

    try {
      const response = await fetch('/api/ai/interview', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session,
          templateId,
          candidateMessage,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to interview stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantBuffer = '';

      const processEvent = (rawEvent: string) => {
        const lines = rawEvent.trim().split('\n');
        let eventType = 'message';
        let dataPayload = '';

        lines.forEach((line) => {
          if (line.startsWith('event:')) {
            eventType = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            dataPayload += line.replace('data:', '').trim();
          }
        });

        if (!dataPayload) return;

        if (eventType === 'token') {
          try {
            const parsed = JSON.parse(dataPayload) as { value: string };
            assistantBuffer += parsed.value;
            setPendingAssistantMessage(assistantBuffer);
          } catch (error) {
            console.error('Failed to parse token payload', error);
          }
        }

        if (eventType === 'close') {
          try {
            const parsed = JSON.parse(dataPayload) as { sessionId?: string };
            if (parsed.sessionId) {
              setSessionId(parsed.sessionId);
            }
          } catch (error) {
            console.error('Failed to parse close payload', error);
          }

          const finalMessage = assistantBuffer.trim();
          if (finalMessage) {
            setMessages((prev) => [
              ...prev,
              {
                role: 'interviewer',
                content: finalMessage.replace(/\s+/g, ' '),
              },
            ]);
          }
          setPendingAssistantMessage('');
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          processEvent(rawEvent);
          boundary = buffer.indexOf('\n\n');
        }
      }
    } catch (error) {
      console.error('Interview stream error', error);
      toast.error('Connection interrupted. Please try again.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCandidateSubmit = async () => {
    if (!sessionId) {
      toast.error('Start the interview first.');
      return;
    }

    if (!currentInput.trim()) {
      toast.error('Enter your response before submitting.');
      return;
    }

    const responseText = currentInput.trim();
    setMessages((prev) => [...prev, { role: 'candidate', content: responseText }]);
    setCurrentInput('');

    await streamInterviewerResponse(sessionId, selectedTemplate, responseText);
  };

  const handleFinishInterview = async () => {
    if (!sessionId) {
      toast.error('No session to finish.');
      return;
    }

    setIsStreaming(true);

    try {
      const result = await finalizeInterview({ sessionId });

      if (!result.success || !result.data) {
        toast.error(result.error ?? 'Unable to generate interview summary.');
        return;
      }

      const { feedback } = result.data;

      setSummary({
        readinessScore: result.data.session.readiness_score ?? 0,
        strengths: feedback?.strengths ?? null,
        improvements: feedback?.improvements ?? null,
        recommendations: feedback?.recommendations ?? null,
        summary: feedback?.summary ?? null,
      });
      toast.success('Interview summary ready.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to finalize interview.');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[350px,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Configure Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Experience Level</p>
            <Select
              onValueChange={(value) => setSelectedPersona(value)}
              defaultValue={selectedPersona}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                <SelectItem value="senior">Senior (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Interview Focus</p>
            <Select
              onValueChange={(value) => setSelectedTemplate(value)}
              value={selectedTemplate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interview focus" />
              </SelectTrigger>
              <SelectContent>
                {filteredTemplates.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No templates available
                  </SelectItem>
                ) : (
                  filteredTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.focus_area}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {activeTemplate?.description && (
              <p className="text-sm text-muted-foreground">{activeTemplate.description}</p>
            )}
          </div>

          <Button
            className="w-full"
            onClick={() => initializeInterview(selectedTemplate)}
            disabled={isStarting || isStreaming || filteredTemplates.length === 0}
          >
            {isStarting ? 'Starting...' : 'Start Interview'}
          </Button>

          <div className="mt-4 rounded-md bg-blue-50 p-3 text-xs space-y-2">
            <p className="font-medium text-blue-900">💡 Tips for Better Responses:</p>
            <ul className="text-blue-800 space-y-1 pl-4">
              <li>• Be specific with examples from real projects</li>
              <li>• Explain your reasoning and decision-making process</li>
              <li>• Mention Guidewire-specific features and configurations</li>
              <li>• Discuss trade-offs and alternatives you considered</li>
              <li>• Show problem-solving skills, not just memorized facts</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="h-[460px] overflow-hidden">
          <CardHeader>
            <CardTitle>Live Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] overflow-y-auto rounded-lg border bg-muted/30 p-4 space-y-4">
              {messages.length === 0 && !pendingAssistantMessage ? (
                <p className="text-sm text-muted-foreground">
                  Start the interview to receive your first question.
                </p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm ${
                        message.role === 'candidate'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}

              {pendingAssistantMessage && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-white px-4 py-2 text-sm shadow-sm">
                    {pendingAssistantMessage}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              rows={4}
              placeholder="Type your answer here..."
              value={currentInput}
              onChange={(event) => setCurrentInput(event.target.value)}
              disabled={isStreaming || !sessionId}
            />
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentInput('');
                  setMessages([]);
                  setPendingAssistantMessage('');
                  setSummary(null);
                }}
                disabled={isStreaming}
              >
                Clear
              </Button>
              <Button onClick={handleCandidateSubmit} disabled={isStreaming || !sessionId}>
                {isStreaming ? 'Waiting...' : 'Send Response'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={resetSession} disabled={isStreaming}>
            Reset Session
          </Button>
          <Button onClick={handleFinishInterview} disabled={isStreaming || !sessionId}>
            {isStreaming ? 'Finishing...' : 'Complete Interview'}
          </Button>
        </div>

        {summary && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Interview Summary</CardTitle>
              <Badge variant={summary.readinessScore >= 70 ? 'default' : 'destructive'}>
                Readiness Score: {summary.readinessScore}/100
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {summary.summary && (
                <div>
                  <p className="font-medium">Overview</p>
                  <p className="text-muted-foreground">{summary.summary}</p>
                </div>
              )}
              {summary.strengths && (
                <div>
                  <p className="font-medium">Strengths</p>
                  <p className="text-muted-foreground">{summary.strengths}</p>
                </div>
              )}
              {summary.improvements && (
                <div>
                  <p className="font-medium">Growth Areas</p>
                  <p className="text-muted-foreground">{summary.improvements}</p>
                </div>
              )}
              {summary.recommendations && (
                <div>
                  <p className="font-medium">Recommendations</p>
                  <p className="text-muted-foreground">{summary.recommendations}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

