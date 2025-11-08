'use client';

import { useState } from 'react';
import type { ModelName, OrchestrationResult } from '@/types/orchestration';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('');
  const [selectedModels, setSelectedModels] = useState<ModelName[]>(['gpt-4o', 'claude-sonnet-4', 'gemini-ultra']);
  const [synthesize, setSynthesize] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const models: { name: ModelName; label: string; description: string }[] = [
    { name: 'gpt-4o', label: 'GPT-4o', description: 'Fast, versatile, great for general tasks' },
    { name: 'claude-sonnet-4', label: 'Claude 3.5 Sonnet', description: 'Deep reasoning, best for architecture' },
    { name: 'gemini-ultra', label: 'Gemini Pro', description: 'Multi-perspective analysis' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    if (selectedModels.length === 0) {
      setError('Please select at least one model');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context: context || undefined,
          models: selectedModels,
          synthesize,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to orchestrate');
      }

      const data: OrchestrationResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleModel = (model: ModelName) => {
    setSelectedModels(prev => 
      prev.includes(model)
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🎯 AI Orchestration Tool</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Query multiple AI models simultaneously and get synthesized best-of-all-models responses
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 space-y-6">
          {/* Query Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Design a complete database schema for a multi-business staffing platform..."
              className="w-full p-4 border rounded-lg min-h-[120px] bg-white dark:bg-gray-800"
              disabled={loading}
            />
          </div>

          {/* Context Input (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Context (Optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., This is for IntimeEsolutions platform which includes Training, Recruiting, Bench Sales..."
              className="w-full p-4 border rounded-lg min-h-[80px] bg-white dark:bg-gray-800"
              disabled={loading}
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Models
            </label>
            <div className="space-y-2">
              {models.map((model) => (
                <label key={model.name} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.name)}
                    onChange={() => toggleModel(model.name)}
                    disabled={loading}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">{model.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {model.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Synthesis Toggle */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={synthesize}
                onChange={(e) => setSynthesize(e.target.checked)}
                disabled={loading}
              />
              <span className="font-medium">
                Synthesize responses (combine best ideas from all models)
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Orchestrating...' : 'Orchestrate Models'}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Metrics */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Cost: </span>
                  <span className="font-mono font-medium">${result.totalCost.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Time: </span>
                  <span className="font-mono font-medium">{(result.totalLatency / 1000).toFixed(2)}s</span>
                </div>
              </div>
            </div>

            {/* Synthesized Response (if available) */}
            {result.synthesized && (
              <div className="border rounded-lg p-6 bg-green-50 dark:bg-green-900/20">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
                    ✨ Synthesized Response
                  </h2>
                  <button
                    onClick={() => copyToClipboard(result.synthesized!.content)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <div className="markdown prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{result.synthesized.content}</ReactMarkdown>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                    <strong>Methodology:</strong> {result.synthesized.methodology}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>Cost:</strong> ${result.synthesized.cost.toFixed(4)}
                  </p>
                </div>
              </div>
            )}

            {/* Individual Model Responses */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Individual Model Responses</h2>
              <div className="space-y-4">
                {result.responses.map((response, idx) => (
                  <div key={idx} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold capitalize">
                          {response.model.replace('-', ' ')}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Cost: ${response.cost.toFixed(4)} | 
                          Time: {(response.latency / 1000).toFixed(2)}s | 
                          Tokens: {response.tokens.input + response.tokens.output}
                        </div>
                      </div>
                      {!response.error && (
                        <button
                          onClick={() => copyToClipboard(response.response)}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                    {response.error ? (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded">
                        Error: {response.error}
                      </div>
                    ) : (
                      <div className="markdown prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{response.response}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

