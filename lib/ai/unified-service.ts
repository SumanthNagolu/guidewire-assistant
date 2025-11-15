/**
 * UNIFIED AI SERVICE
 * Single service for all AI features across the platform
 * 
 * Consolidates:
 * - Academy AI Mentor
 * - Guidewire Guru
 * - Employee Bot
 * - Productivity Analysis (Claude Vision)
 * - CEO Insights
 * - Workflow Optimization
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AIModel = 'gpt-4o-mini' | 'gpt-4o' | 'claude-3.5-sonnet' | 'claude-3-opus';

export type ConversationType = 
  | 'mentor'              // Academy AI Mentor
  | 'guru'                // Guidewire Guru
  | 'employee_bot'        // Productivity Employee Bot
  | 'productivity_analysis' // Claude Vision screenshot analysis
  | 'ceo_insights'        // CEO business intelligence
  | 'workflow_optimization'; // Workflow improvement suggestions

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | MessageContent[];
}

export interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface AIServiceConfig {
  model?: AIModel;
  systemPrompt: string;
  contextLimit?: number;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIUsageMetrics {
  tokens_used: number;
  cost: number;
  model: string;
  conversation_type: ConversationType;
}

export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxTokensPerDay: number;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

class RateLimiter {
  private userRequests: Map<string, { minute: number[], hour: number[], tokens: Map<string, number> }> = new Map();

  async checkLimit(userId: string, conversationType: ConversationType): Promise<boolean> {
    const now = Date.now();
    const config = this.getLimitConfig(conversationType);
    
    if (!this.userRequests.has(userId)) {
      this.userRequests.set(userId, {
        minute: [],
        hour: [],
        tokens: new Map()
      });
    }

    const userLimit = this.userRequests.get(userId)!;
    
    // Clean old timestamps
    userLimit.minute = userLimit.minute.filter(t => now - t < 60000); // 1 minute
    userLimit.hour = userLimit.hour.filter(t => now - t < 3600000); // 1 hour
    
    // Check limits
    if (userLimit.minute.length >= config.maxRequestsPerMinute) {
      throw new Error(`Rate limit exceeded: ${config.maxRequestsPerMinute} requests per minute`);
    }
    
    if (userLimit.hour.length >= config.maxRequestsPerHour) {
      throw new Error(`Rate limit exceeded: ${config.maxRequestsPerHour} requests per hour`);
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayTokens = userLimit.tokens.get(today) || 0;
    if (todayTokens >= config.maxTokensPerDay) {
      throw new Error(`Rate limit exceeded: ${config.maxTokensPerDay} tokens per day`);
    }
    
    // Record this request
    userLimit.minute.push(now);
    userLimit.hour.push(now);
    
    return true;
  }

  recordTokenUsage(userId: string, tokens: number): void {
    const today = new Date().toISOString().split('T')[0];
    const userLimit = this.userRequests.get(userId);
    if (userLimit) {
      const currentTokens = userLimit.tokens.get(today) || 0;
      userLimit.tokens.set(today, currentTokens + tokens);
    }
  }

  private getLimitConfig(conversationType: ConversationType): RateLimitConfig {
    switch (conversationType) {
      case 'mentor':
      case 'guru':
        return {
          maxRequestsPerMinute: 10,
          maxRequestsPerHour: 100,
          maxTokensPerDay: 100000
        };
      case 'employee_bot':
        return {
          maxRequestsPerMinute: 5,
          maxRequestsPerHour: 50,
          maxTokensPerDay: 50000
        };
      case 'productivity_analysis':
        return {
          maxRequestsPerMinute: 2, // Screenshot analysis is expensive
          maxRequestsPerHour: 20,
          maxTokensPerDay: 200000
        };
      case 'ceo_insights':
      case 'workflow_optimization':
        return {
          maxRequestsPerMinute: 1,
          maxRequestsPerHour: 10,
          maxTokensPerDay: 50000
        };
      default:
        return {
          maxRequestsPerMinute: 5,
          maxRequestsPerHour: 50,
          maxTokensPerDay: 50000
        };
    }
  }
}

// ============================================================================
// UNIFIED AI SERVICE CLASS
// ============================================================================

export class UnifiedAIService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private rateLimiter: RateLimiter;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    this.rateLimiter = new RateLimiter();
  }

  // ==========================================================================
  // MAIN CHAT METHOD
  // ==========================================================================

  async chat(
    userId: string,
    conversationType: ConversationType,
    messages: Message[],
    config: AIServiceConfig
  ): Promise<ReadableStream | string> {
    // Rate limiting
    await this.rateLimiter.checkLimit(userId, conversationType);

    // Get or create conversation in database
    const conversation = await this.getOrCreateConversation(userId, conversationType);

    // Determine provider based on model
    const model = config.model || this.getDefaultModel(conversationType);
    const provider = model.startsWith('claude') ? 'anthropic' : 'openai';

    // Add system prompt if not already included
    const messagesWithSystem = this.prepareMessages(messages, config.systemPrompt);

    // Stream or non-stream completion
    let response: any;
    let tokensUsed = 0;

    if (config.stream !== false) {
      // Streaming response
      response = await this.streamCompletion(
        provider,
        model,
        messagesWithSystem,
        config
      );
    } else {
      // Non-streaming response
      const result = await this.getCompletion(
        provider,
        model,
        messagesWithSystem,
        config
      );
      response = result.content;
      tokensUsed = result.tokensUsed;
    }

    // Save messages to database (async, don't wait)
    this.saveMessages(conversation.id, messages, response, model, tokensUsed)
      .catch(err => console.error('Error saving messages:', err));

    return response;
  }

  // ==========================================================================
  // STREAMING COMPLETION
  // ==========================================================================

  private async streamCompletion(
    provider: 'openai' | 'anthropic',
    model: AIModel,
    messages: Message[],
    config: AIServiceConfig
  ): Promise<ReadableStream> {
    if (provider === 'openai') {
      return this.streamOpenAI(model, messages, config);
    } else {
      return this.streamAnthropic(model, messages, config);
    }
  }

  private async streamOpenAI(
    model: AIModel,
    messages: Message[],
    config: AIServiceConfig
  ): Promise<ReadableStream> {
    const stream = await this.openai.chat.completions.create({
      model: model,
      messages: messages as any,
      stream: true,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens
    });

    // Convert OpenAI stream to web stream
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }

  private async streamAnthropic(
    model: AIModel,
    messages: Message[],
    config: AIServiceConfig
  ): Promise<ReadableStream> {
    // Extract system message
    const systemMessage = messages.find(m => m.role === 'system')?.content as string;
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const stream = await this.anthropic.messages.stream({
      model: model,
      max_tokens: config.maxTokens || 4096,
      temperature: config.temperature ?? 0.7,
      system: systemMessage,
      messages: conversationMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content as any
      }))
    });

    // Convert Anthropic stream to web stream
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }

  // ==========================================================================
  // NON-STREAMING COMPLETION
  // ==========================================================================

  private async getCompletion(
    provider: 'openai' | 'anthropic',
    model: AIModel,
    messages: Message[],
    config: AIServiceConfig
  ): Promise<{ content: string; tokensUsed: number }> {
    if (provider === 'openai') {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: messages as any,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens
      });

      return {
        content: response.choices[0]?.message?.content || '',
        tokensUsed: response.usage?.total_tokens || 0
      };
    } else {
      // Extract system message
      const systemMessage = messages.find(m => m.role === 'system')?.content as string;
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const response = await this.anthropic.messages.create({
        model: model,
        max_tokens: config.maxTokens || 4096,
        temperature: config.temperature ?? 0.7,
        system: systemMessage,
        messages: conversationMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content as any
        }))
      });

      const content = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('');

      return {
        content,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens
      };
    }
  }

  // ==========================================================================
  // CONVERSATION MANAGEMENT
  // ==========================================================================

  private async getOrCreateConversation(
    userId: string,
    conversationType: ConversationType
  ): Promise<any> {
    const supabase = createClient();

    // Try to find existing active conversation
    const { data: existing } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('conversation_type', conversationType)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      return existing;
    }

    // Create new conversation
    const { data: newConversation, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        conversation_type: conversationType,
        title: this.getConversationTitle(conversationType)
      })
      .select()
      .single();

    if (error) throw error;
    return newConversation;
  }

  private async saveMessages(
    conversationId: string,
    messages: Message[],
    response: string | ReadableStream,
    model: string,
    tokensUsed: number
  ): Promise<void> {
    const supabase = createClient();

    // Save user messages
    for (const message of messages.filter(m => m.role === 'user')) {
      await supabase.from('ai_messages').insert({
        conversation_id: conversationId,
        role: message.role,
        content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
      });
    }

    // Save assistant response (if not streaming)
    if (typeof response === 'string') {
      await supabase.from('ai_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: response,
        model: model,
        tokens_used: tokensUsed,
        cost: this.calculateCost(model, tokensUsed)
      });
    }
  }

  // ==========================================================================
  // USAGE TRACKING
  // ==========================================================================

  async trackUsage(
    userId: string,
    conversationType: ConversationType,
    model: string,
    tokensUsed: number
  ): Promise<void> {
    const supabase = createClient();
    const cost = this.calculateCost(model, tokensUsed);

    await supabase.from('ai_usage_tracking').insert({
      user_id: userId,
      conversation_type: conversationType,
      model: model,
      tokens_used: tokensUsed,
      cost: cost,
      request_date: new Date().toISOString().split('T')[0]
    });

    // Record for rate limiting
    this.rateLimiter.recordTokenUsage(userId, tokensUsed);
  }

  private calculateCost(model: string, tokens: number): number {
    // Cost per 1M tokens
    const costs: Record<string, number> = {
      'gpt-4o-mini': 0.15,
      'gpt-4o': 5.0,
      'claude-3.5-sonnet': 3.0,
      'claude-3-opus': 15.0
    };

    const costPer1M = costs[model] || 1.0;
    return (tokens / 1000000) * costPer1M;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private prepareMessages(messages: Message[], systemPrompt: string): Message[] {
    // Check if system message already exists
    const hasSystem = messages.some(m => m.role === 'system');
    
    if (hasSystem) {
      return messages;
    }

    // Add system prompt at the beginning
    return [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
  }

  private getDefaultModel(conversationType: ConversationType): AIModel {
    switch (conversationType) {
      case 'mentor':
      case 'employee_bot':
        return 'gpt-4o-mini'; // Cost-effective for high-volume
      case 'guru':
      case 'ceo_insights':
      case 'workflow_optimization':
        return 'gpt-4o'; // More capable for complex tasks
      case 'productivity_analysis':
        return 'claude-3.5-sonnet'; // Best for vision tasks
      default:
        return 'gpt-4o-mini';
    }
  }

  private getConversationTitle(conversationType: ConversationType): string {
    const titles: Record<ConversationType, string> = {
      mentor: 'AI Mentor Session',
      guru: 'Guidewire Guru Consultation',
      employee_bot: 'Employee Bot Conversation',
      productivity_analysis: 'Productivity Analysis',
      ceo_insights: 'CEO Insights Analysis',
      workflow_optimization: 'Workflow Optimization'
    };

    return titles[conversationType] || 'AI Conversation';
  }

  // ==========================================================================
  // USAGE ANALYTICS
  // ==========================================================================

  async getUserUsage(userId: string, days: number = 30): Promise<AIUsageMetrics[]> {
    const supabase = createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('ai_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('request_date', startDate.toISOString().split('T')[0])
      .order('request_date', { ascending: false });

    if (error) throw error;

    return data.map(record => ({
      tokens_used: record.tokens_used,
      cost: record.cost,
      model: record.model,
      conversation_type: record.conversation_type
    }));
  }

  async getSystemUsage(days: number = 30): Promise<{
    totalTokens: number;
    totalCost: number;
    byModel: Record<string, { tokens: number; cost: number }>;
    byType: Record<string, { tokens: number; cost: number }>;
  }> {
    const supabase = createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('ai_usage_tracking')
      .select('*')
      .gte('request_date', startDate.toISOString().split('T')[0]);

    if (error) throw error;

    const byModel: Record<string, { tokens: number; cost: number }> = {};
    const byType: Record<string, { tokens: number; cost: number }> = {};
    let totalTokens = 0;
    let totalCost = 0;

    for (const record of data) {
      totalTokens += record.tokens_used;
      totalCost += record.cost;

      // By model
      if (!byModel[record.model]) {
        byModel[record.model] = { tokens: 0, cost: 0 };
      }
      byModel[record.model].tokens += record.tokens_used;
      byModel[record.model].cost += record.cost;

      // By type
      if (!byType[record.conversation_type]) {
        byType[record.conversation_type] = { tokens: 0, cost: 0 };
      }
      byType[record.conversation_type].tokens += record.tokens_used;
      byType[record.conversation_type].cost += record.cost;
    }

    return { totalTokens, totalCost, byModel, byType };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let aiServiceInstance: UnifiedAIService | null = null;

export function getAIService(): UnifiedAIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new UnifiedAIService();
  }
  return aiServiceInstance;
}

// ============================================================================
// CONVENIENCE METHODS
// ============================================================================

export async function chatWithMentor(
  userId: string,
  messages: Message[],
  systemPrompt: string
): Promise<ReadableStream> {
  const service = getAIService();
  return service.chat(userId, 'mentor', messages, {
    model: 'gpt-4o-mini',
    systemPrompt,
    temperature: 0.7
  }) as Promise<ReadableStream>;
}

export async function chatWithGuru(
  userId: string,
  messages: Message[],
  systemPrompt: string
): Promise<ReadableStream> {
  const service = getAIService();
  return service.chat(userId, 'guru', messages, {
    model: 'gpt-4o',
    systemPrompt,
    temperature: 0.7
  }) as Promise<ReadableStream>;
}

export async function analyzeScreenshot(
  userId: string,
  screenshotUrl: string
): Promise<string> {
  const service = getAIService();
  const messages: Message[] = [
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: screenshotUrl,
            detail: 'high'
          }
        },
        {
          type: 'text',
          text: 'Analyze this screenshot and describe the user\'s activity. Identify the application, task being performed, and categorize the productivity level (high/medium/low). Be concise.'
        }
      ]
    }
  ];

  return service.chat(userId, 'productivity_analysis', messages, {
    model: 'claude-3.5-sonnet',
    systemPrompt: 'You are a productivity analysis AI. Analyze screenshots to understand user activity and productivity patterns.',
    stream: false
  }) as Promise<string>;
}

export async function generateCEOInsights(
  userId: string,
  businessData: any
): Promise<string> {
  const service = getAIService();
  const messages: Message[] = [
    {
      role: 'user',
      content: `Analyze this business data and provide 3-5 actionable insights:\n\n${JSON.stringify(businessData, null, 2)}`
    }
  ];

  return service.chat(userId, 'ceo_insights', messages, {
    model: 'claude-3.5-sonnet',
    systemPrompt: 'You are a business intelligence analyst for a staffing company. Provide data-driven insights that are actionable and specific. Focus on patterns, opportunities, and risks.',
    stream: false
  }) as Promise<string>;
}

export async function optimizeWorkflow(
  userId: string,
  workflowData: any
): Promise<string> {
  const service = getAIService();
  const messages: Message[] = [
    {
      role: 'user',
      content: `Analyze this workflow data and suggest optimizations:\n\n${JSON.stringify(workflowData, null, 2)}`
    }
  ];

  return service.chat(userId, 'workflow_optimization', messages, {
    model: 'gpt-4o',
    systemPrompt: 'You are a workflow optimization expert. Analyze workflow performance data and suggest specific, measurable improvements. Focus on bottlenecks, timing, and resource allocation.',
    stream: false
  }) as Promise<string>;
}

export const unifiedAIService = new UnifiedAIService();
