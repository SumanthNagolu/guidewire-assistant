'use client';

import { useState } from 'react';

const MODES = [
  { id: 'standup', name: 'Daily Standup', icon: '📋', color: 'blue' },
  { id: 'coach', name: 'Productivity Coach', icon: '🎯', color: 'green' },
  { id: 'project_manager', name: 'Project Manager', icon: '📊', color: 'purple' },
  { id: 'workflow', name: 'Workflow Assistant', icon: '⚡', color: 'orange' },
  { id: 'general', name: 'General', icon: '💬', color: 'gray' },
];

export default function EmployeeBot() {
  const [mode, setMode] = useState('general');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/employee-bot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode, conversation_id: conversationId }),
      });

      const data = await res.json();

      if (data.success) {
        setConversationId(data.conversation_id);
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
        ]);
      }
    } catch (error) {
          } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow">
      {/* Mode Selector */}
      <div className="flex gap-2 p-4 border-b overflow-x-auto">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              mode === m.id
                ? `bg-${m.color}-100 text-${m.color}-800 border-2 border-${m.color}-500`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {m.icon} {m.name}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-4xl mb-4">🤖</p>
            <p className="text-lg font-semibold">Hi! I'm your AI Employee Bot</p>
            <p className="text-sm mt-2">How can I help you today?</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-lg">
              <p className="text-sm text-gray-600">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

