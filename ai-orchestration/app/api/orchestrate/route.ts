import { NextRequest, NextResponse } from 'next/server';
import { queryGPT4o } from '@/lib/ai-clients/openai';
import { queryClaude } from '@/lib/ai-clients/anthropic';
import { queryGemini } from '@/lib/ai-clients/google';
import { synthesizeResponses } from '@/lib/synthesizer';
import type { QueryInput, OrchestrationResult } from '@/types/orchestration';

export const maxDuration = 60; // Allow up to 60 seconds for API calls

export async function POST(request: NextRequest) {
  try {
    const body: QueryInput = await request.json();
    const { query, context, models, temperature = 0.7, synthesize } = body;

    if (!query || !models || models.length === 0) {
      return NextResponse.json(
        { error: 'Query and models are required' },
        { status: 400 }
      );
    }

    // Check API keys
    const missingKeys = [];
    if (models.includes('gpt-4o') && !process.env.OPENAI_API_KEY) {
      missingKeys.push('OPENAI_API_KEY');
    }
    if (models.includes('claude-sonnet-4') && !process.env.ANTHROPIC_API_KEY) {
      missingKeys.push('ANTHROPIC_API_KEY');
    }
    if (models.includes('gemini-ultra') && !process.env.GOOGLE_AI_API_KEY) {
      missingKeys.push('GOOGLE_AI_API_KEY');
    }

    if (missingKeys.length > 0) {
      return NextResponse.json(
        { error: `Missing API keys: ${missingKeys.join(', ')}` },
        { status: 500 }
      );
    }

    // Query all selected models in parallel
    const modelQueries = models.map(async (model) => {
      switch (model) {
        case 'gpt-4o':
          return queryGPT4o(query, context, temperature);
        case 'claude-sonnet-4':
          return queryClaude(query, context, temperature);
        case 'gemini-ultra':
          return queryGemini(query, context, temperature);
        default:
          throw new Error(`Unknown model: ${model}`);
      }
    });

    const responses = await Promise.all(modelQueries);

    // Calculate total metrics
    const totalCost = responses.reduce((sum, r) => sum + r.cost, 0);
    const totalLatency = Math.max(...responses.map(r => r.latency));

    // Synthesize if requested
    let synthesized;
    if (synthesize && responses.filter(r => !r.error).length >= 2) {
      try {
        synthesized = await synthesizeResponses(query, responses);
      } catch (error: any) {
        console.error('Synthesis error:', error);
        // Continue without synthesis if it fails
      }
    }

    const result: OrchestrationResult = {
      query,
      context,
      responses,
      synthesized,
      totalCost: totalCost + (synthesized?.cost || 0),
      totalLatency,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Orchestration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

