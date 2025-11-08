import OpenAI from 'openai';
import type { ModelResponse, SynthesizedResponse } from '@/types/orchestration';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function synthesizeResponses(
  query: string,
  responses: ModelResponse[]
): Promise<SynthesizedResponse> {
  const startTime = Date.now();

  // Filter out errored responses
  const validResponses = responses.filter(r => !r.error && r.response);

  if (validResponses.length === 0) {
    throw new Error('No valid responses to synthesize');
  }

  // Build synthesis prompt
  const synthesisPrompt = `
You are a meta-AI synthesizer. Your job is to analyze multiple AI model responses to the same query and create the BEST possible synthesized response.

ORIGINAL QUERY:
${query}

RESPONSES FROM DIFFERENT MODELS:
${validResponses.map((r, i) => `
=== ${r.model.toUpperCase()} ===
${r.response}
`).join('\n\n')}

YOUR TASK:
1. Analyze all responses and identify:
   - Common themes and agreements
   - Unique insights from each model
   - Any contradictions or differing approaches
   
2. Create a SYNTHESIZED response that:
   - Combines the best ideas from all models
   - Resolves any contradictions with reasoning
   - Is more comprehensive than any single response
   - Is actionable and well-structured

3. Provide a brief methodology note explaining:
   - What you took from each model
   - How you resolved contradictions
   - Why your synthesis is better

FORMAT YOUR RESPONSE AS:

## Synthesized Response
[Your best-of-all-models answer]

## Synthesis Methodology
[Brief explanation of how you combined responses]

## Strengths from Each Model
- ${validResponses[0].model}: [key contribution]
${validResponses.slice(1).map(r => `- ${r.model}: [key contribution]`).join('\n')}
`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a meta-AI synthesizer that combines insights from multiple AI models to produce superior responses.'
        },
        {
          role: 'user',
          content: synthesisPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more focused synthesis
      max_tokens: 3000,
    });

    const fullResponse = completion.choices[0]?.message?.content || '';
    
    // Parse response
    const synthesizedMatch = fullResponse.match(/## Synthesized Response\s+([\s\S]*?)(?=## Synthesis Methodology|$)/);
    const methodologyMatch = fullResponse.match(/## Synthesis Methodology\s+([\s\S]*?)(?=## Strengths from Each Model|$)/);
    const strengthsMatch = fullResponse.match(/## Strengths from Each Model\s+([\s\S]*?)$/);

    const content = synthesizedMatch?.[1]?.trim() || fullResponse;
    const methodology = methodologyMatch?.[1]?.trim() || 'Combined insights from all models';
    
    // Parse strengths
    const strengths: Record<string, string[]> = {};
    if (strengthsMatch) {
      const strengthsText = strengthsMatch[1];
      validResponses.forEach(r => {
        const modelStrength = strengthsText.match(new RegExp(`- ${r.model}:?\\s*([^\\n]+)`));
        if (modelStrength) {
          strengths[r.model] = [modelStrength[1].trim()];
        }
      });
    }

    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const cost = (inputTokens / 1_000_000 * 2.5) + (outputTokens / 1_000_000 * 10);

    return {
      content,
      methodology,
      strengths,
      confidence: validResponses.length / responses.length, // % of successful responses
      cost,
    };
  } catch (error: any) {
    throw new Error(`Synthesis failed: ${error.message}`);
  }
}

