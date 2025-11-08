import Anthropic from '@anthropic-ai/sdk';
import type { ModelResponse } from '@/types/orchestration';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function queryClaude(
  query: string,
  context?: string,
  temperature: number = 0.7
): Promise<ModelResponse> {
  const startTime = Date.now();
  
  try {
    const prompt = context 
      ? `Context:\n${context}\n\nQuery:\n${query}`
      : query;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature,
      system: 'You are an expert AI assistant specializing in deep reasoning, architecture design, and best practices. Provide thorough, well-reasoned responses.',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    const response = message.content[0]?.type === 'text' 
      ? message.content[0].text 
      : '';
    
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;

    // Claude 3.5 Sonnet pricing: $3/1M input, $15/1M output
    const cost = (inputTokens / 1_000_000 * 3) + (outputTokens / 1_000_000 * 15);

    return {
      model: 'claude-sonnet-4',
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
      model: 'claude-sonnet-4',
      response: '',
      tokens: { input: 0, output: 0 },
      cost: 0,
      latency: Date.now() - startTime,
      error: error.message || 'Failed to query Claude',
    };
  }
}

