import OpenAI from 'openai';
import type { ModelResponse } from '@/types/orchestration';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function queryGPT4o(
  query: string,
  context?: string,
  temperature: number = 0.7
): Promise<ModelResponse> {
  const startTime = Date.now();
  
  try {
    const prompt = context 
      ? `Context:\n${context}\n\nQuery:\n${query}`
      : query;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI assistant helping with technical planning and architecture decisions. Provide clear, actionable, and well-structured responses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || '';
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;

    // GPT-4o pricing: $2.50/1M input, $10/1M output
    const cost = (inputTokens / 1_000_000 * 2.5) + (outputTokens / 1_000_000 * 10);

    return {
      model: 'gpt-4o',
      response,
      tokens: {
        input: inputTokens,
        output: outputTokens,
      },
      cost,
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      model: 'gpt-4o',
      response: '',
      tokens: { input: 0, output: 0 },
      cost: 0,
      latency: Date.now() - startTime,
      error: error.message || 'Failed to query GPT-4o',
    };
  }
}

