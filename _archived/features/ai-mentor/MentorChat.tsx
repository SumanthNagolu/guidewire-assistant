'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { extractSSEEvents } from '@/lib/streams/sse';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MentorChatProps {
  topicId?: string;
  topicTitle?: string;
}

export default function MentorChat({ topicId, topicTitle }: MentorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) {
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Build request body, excluding undefined values
      const requestBody: {
        message: string;
        topicId?: string;
        conversationId?: string;
      } = { message: userMessage };
      
      if (topicId) requestBody.topicId = topicId;
      if (conversationId) requestBody.conversationId = conversationId;

      const response = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `Request failed with status ${response.status}`;
        console.error('[AI Mentor] API error:', response.status, errorMessage);
        throw new Error(errorMessage);
      }

      // Get conversation ID from headers
      const newConversationId = response.headers.get('X-Conversation-Id');
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';
      let streamClosed = false;

      const processEvents = (events: ReturnType<typeof extractSSEEvents>['events']) => {
        for (const event of events) {
          if (event.type === 'token') {
            let token = '';
            try {
              const payload = JSON.parse(event.data) as { value?: unknown };
              token = typeof payload.value === 'string' ? payload.value : '';
            } catch {
              token = event.data;
            }

            if (token) {
              assistantMessage += token;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          }

          if (event.type === 'close') {
            streamClosed = true;
          }
        }
      };

      // Add empty assistant message that we'll update
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (!streamClosed) {
          const { done, value } = await reader.read();

          if (value) {
            buffer += decoder.decode(value, { stream: true });

            const { events, buffer: nextBuffer } = extractSSEEvents(buffer);
            buffer = nextBuffer;
            processEvents(events);
          }

          if (done) {
            buffer += decoder.decode();
            const { events, buffer: nextBuffer } = extractSSEEvents(buffer);
            buffer = nextBuffer;
            processEvents(events);

            streamClosed = true;
          }
        }

        if (!streamClosed) {
          await reader.cancel().catch(() => {
            // Ignored cancellation errors
          });
        }
      }
    } catch (error) {
      toast.error('Failed to get response from AI mentor');
      console.error('Chat error:', error);
      
      // Remove the empty assistant message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Mentor
          {topicTitle && <Badge variant="secondary">{topicTitle}</Badge>}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Ask questions and get guidance using the Socratic method
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium mb-2">Start a conversation</p>
              <p className="text-sm">
                Ask me anything about Guidewire. I&apos;ll guide you to discover the answers!
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}

              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t p-4 flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? (
              'Thinking...'
            ) : (
              <>
                <Send className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

