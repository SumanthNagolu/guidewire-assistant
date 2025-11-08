import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ModelResponse } from '@/types/orchestration';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function queryGemini(
  query: string,
  context?: string,
  temperature: number = 0.7
): Promise<ModelResponse> {
  const startTime = Date.now();
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      systemInstruction: 'You are an expert AI assistant providing comprehensive, multi-perspective analysis and recommendations.',
    });

    const prompt = context 
      ? `Context:\n${context}\n\nQuery:\n${query}`
      : query;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: 2000,
      },
    });

    const response = result.response.text();
    
    // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(response.length / 4);

    // Gemini pricing: $1.25/1M input, $5/1M output (Pro model)
    const cost = (inputTokens / 1_000_000 * 1.25) + (outputTokens / 1_000_000 * 5);

    return {
      model: 'gemini-ultra',
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
      model: 'gemini-ultra',
      response: '',
      tokens: { input: 0, output: 0 },
      cost: 0,
      latency: Date.now() - startTime,
      error: error.message || 'Failed to query Gemini',
    };
  }
}

