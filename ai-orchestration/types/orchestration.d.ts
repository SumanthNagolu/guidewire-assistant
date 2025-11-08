export type ModelName = 'gpt-4o' | 'claude-sonnet-4' | 'gemini-ultra';

export interface QueryInput {
  query: string;
  context?: string;
  models: ModelName[];
  temperature?: number;
  synthesize: boolean;
}

export interface ModelResponse {
  model: ModelName;
  response: string;
  tokens: {
    input: number;
    output: number;
  };
  cost: number;
  latency: number; // ms
  error?: string;
}

export interface SynthesizedResponse {
  content: string;
  methodology: string;
  strengths: Record<ModelName, string[]>;
  confidence: number;
  cost: number;
}

export interface OrchestrationResult {
  query: string;
  context?: string;
  responses: ModelResponse[];
  synthesized?: SynthesizedResponse;
  totalCost: number;
  totalLatency: number;
  timestamp: string;
}

