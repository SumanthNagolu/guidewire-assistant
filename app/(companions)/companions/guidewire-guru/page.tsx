'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, Trash2, Plus, Code, FileText, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// ================================================================
// TYPES
// ================================================================
interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ file: string; chunk: number; product: string }>;
}
interface Conversation {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
}
// ================================================================
// CAPABILITIES
// ================================================================
const CAPABILITIES = [
  { id: 'resume', label: 'Resume Generation', icon: '📄', color: 'bg-blue-100 text-blue-700' },
  { id: 'projects', label: 'Project Docs', icon: '📁', color: 'bg-purple-100 text-purple-700' },
  { id: 'qa', label: 'Q&A Assistant', icon: '💡', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'debugging', label: 'Code Debugging', icon: '🐛', color: 'bg-red-100 text-red-700' },
  { id: 'interview', label: 'Interview Prep', icon: '🎤', color: 'bg-green-100 text-green-700' },
  { id: 'assistant', label: 'Personal Assistant', icon: '🤝', color: 'bg-teal-100 text-teal-700' }
];
// ================================================================
// MAIN COMPONENT
// ================================================================
export default function GuidewireGuruPage() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [capability, setCapability] = useState('qa');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);
  // ================================================================
  // API FUNCTIONS
  // ================================================================
  const loadConversations = async () => {
    try {
      const response = await fetch('/api/companions/conversations');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      }
  };
  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/companions/conversations/${id}/messages`);
      const data = await response.json();
      setMessages(data.messages.map((m: any) => ({
        role: m.role,
        content: m.content,
        sources: m.sources
      })));
      setConversationId(id);
    } catch (error) {
      }
  };
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/companions/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          conversationId,
          capability
        })
      });
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }]);
      if (!conversationId) {
        setConversationId(data.conversationId);
        loadConversations(); // Refresh conversation list
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };
  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    inputRef.current?.focus();
  };
  const deleteConversation = async (id: string) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await fetch(`/api/companions/conversations?id=${id}`, { method: 'DELETE' });
      loadConversations();
      if (conversationId === id) {
        startNewConversation();
      }
    } catch (error) {
      }
  };
  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-80 bg-white border-r border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">🧙‍♂️</div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-trust-blue">
                    Guidewire Guru
                  </h2>
                  <p className="text-xs text-wisdom-gray-600">Your Guidewire Expert</p>
                </div>
              </div>
              {/* Quick Tools */}
              <div className="mb-4 space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase">Quick Tools</div>
                <div className="grid grid-cols-2 gap-2">
                  <Link 
                    href="/companions/guidewire-guru/debugging-studio"
                    className="p-2 bg-red-50 hover:bg-red-100 rounded text-center transition-colors"
                    title="Debugging Studio"
                  >
                    <Code className="w-5 h-5 mx-auto text-red-600" />
                    <span className="text-xs text-red-700">Debug</span>
                  </Link>
                  <Link 
                    href="/companions/guidewire-guru/interview-bot"
                    className="p-2 bg-green-50 hover:bg-green-100 rounded text-center transition-colors"
                    title="Interview Bot"
                  >
                    <Briefcase className="w-5 h-5 mx-auto text-green-600" />
                    <span className="text-xs text-green-700">Interview</span>
                  </Link>
                  <Link 
                    href="/companions/guidewire-guru/resume-builder"
                    className="p-2 bg-purple-50 hover:bg-purple-100 rounded text-center transition-colors"
                    title="Resume Builder"
                  >
                    <FileText className="w-5 h-5 mx-auto text-purple-600" />
                    <span className="text-xs text-purple-700">Resume</span>
                  </Link>
                  <Link 
                    href="/companions/guidewire-guru/project-generator"
                    className="p-2 bg-blue-50 hover:bg-blue-100 rounded text-center transition-colors"
                    title="Project Docs"
                  >
                    <MessageSquare className="w-5 h-5 mx-auto text-blue-600" />
                    <span className="text-xs text-blue-700">Projects</span>
                  </Link>
                </div>
              </div>
              <button
                onClick={startNewConversation}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Conversation
              </button>
            </div>
            {/* Capabilities */}
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs font-semibold text-wisdom-gray-600 uppercase tracking-wider mb-3">
                Mode
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CAPABILITIES.map(cap => (
                  <button
                    key={cap.id}
                    onClick={() => setCapability(cap.id)}
                    className={`
                      px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${capability === cap.id
                        ? cap.color + ' shadow-md'
                        : 'bg-gray-100 text-wisdom-gray hover:bg-gray-200'
                      }
                    `}
                  >
                    <span className="mr-1">{cap.icon}</span>
                    {cap.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Conversations History */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs font-semibold text-wisdom-gray-600 uppercase tracking-wider mb-3">
                Recent Conversations
              </p>
              {conversations.length === 0 ? (
                <p className="text-sm text-wisdom-gray-500 italic">No conversations yet</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`
                        group flex items-center justify-between p-3 rounded-lg cursor-pointer
                        transition-colors
                        ${conversationId === conv.id
                          ? 'bg-trust-blue-50 border-2 border-trust-blue'
                          : 'hover:bg-gray-100 border-2 border-transparent'
                        }
                      `}
                      onClick={() => loadConversation(conv.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-wisdom-gray-700 truncate">
                          {conv.title}
                        </p>
                        <p className="text-xs text-wisdom-gray-500">
                          {conv.messageCount} messages
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-2xl">
                <Bot className="w-20 h-20 text-trust-blue mx-auto mb-6" />
                <h3 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-4">
                  Ready to help with anything Guidewire
                </h3>
                <p className="text-lg text-wisdom-gray-600 mb-8">
                  Ask me anything - from resume writing to code debugging to interview prep
                </p>
                <div className="grid grid-cols-2 gap-4 text-left">
                  {[
                    { q: 'Write a resume for a ClaimCenter developer with 5 years experience', icon: '📄' },
                    { q: 'Explain how PCF configuration works in PolicyCenter', icon: '💡' },
                    { q: 'Debug this GOSU code that\'s throwing a null pointer', icon: '🐛' },
                    { q: 'Prepare me for a senior Guidewire architect interview', icon: '🎤' }
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(example.q)}
                      className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-trust-blue hover:shadow-md transition-all text-left"
                    >
                      <span className="text-2xl mb-2 block">{example.icon}</span>
                      <p className="text-sm text-wisdom-gray-700">{example.q}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-trust-blue flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}
              <div className={`
                max-w-3xl px-6 py-4 rounded-2xl
                ${msg.role === 'user'
                  ? 'bg-trust-blue text-white'
                  : 'bg-white border-2 border-gray-200 text-wisdom-gray-700'
                }
              `}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-wisdom-gray-600 mb-2">📚 Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.slice(0, 3).map((source, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {source.file} ({source.product})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-success-green flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 mb-6"
            >
              <div className="w-10 h-10 rounded-full bg-trust-blue flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl">
                <p className="text-wisdom-gray-600">Thinking...</p>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask anything about Guidewire..."
                rows={1}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-trust-blue resize-none"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-wisdom-gray-500 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
