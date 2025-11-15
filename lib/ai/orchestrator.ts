import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { loggers } from '@/lib/logger';
import { cache, cacheKeys } from '@/lib/redis';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model types
export type AIModel = 
  | 'gpt-4o' 
  | 'gpt-4o-mini' 
  | 'claude-3-opus' 
  | 'claude-3-sonnet' 
  | 'claude-3-haiku';

// Use case types
export type AIUseCase = 
  | 'mentor' 
  | 'guru' 
  | 'recruiter' 
  | 'productivity' 
  | 'ceo_insights' 
  | 'interview_bot' 
  | 'employee_bot';

// Context types
export interface AIContext {
  useCase: AIUseCase;
  userId: string;
  conversationId?: string;
  metadata?: Record<string, any>;
}

// Request/Response types
export interface AIRequest {
  prompt: string;
  context: AIContext;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: AIModel;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  duration: number;
}

// AI Orchestrator Class
export class AIOrchestrator {
  private static instance: AIOrchestrator;

  private constructor() {}

  static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  // Route request to appropriate model
  async route(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Select model based on use case if not specified
      const model = request.model || this.selectModel(request.context.useCase);

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(request.context);

      // Add context injection
      const enrichedPrompt = await this.enrichPrompt(request.prompt, request.context);

      // Log AI request
      loggers.ai.request(request.context.userId, request.context.useCase, model);

      // Execute based on model provider
      let response: AIResponse;
      
      if (model.startsWith('gpt')) {
        response = await this.executeOpenAI(model, systemPrompt, enrichedPrompt, request);
      } else if (model.startsWith('claude')) {
        response = await this.executeAnthropic(model, systemPrompt, enrichedPrompt, request);
      } else {
        throw new Error(`Unsupported model: ${model}`);
      }

      // Validate response
      const validatedResponse = await this.validateResponse(response, request.context);

      // Cache response if applicable
      if (request.context.conversationId) {
        await cache.set(
          cacheKeys.aiConversation(request.context.conversationId),
          validatedResponse,
          3600 // 1 hour TTL
        );
      }

      // Log successful response
      const duration = Date.now() - startTime;
      loggers.ai.response(
        request.context.userId,
        request.context.useCase,
        validatedResponse.tokens.total,
        duration
      );

      return validatedResponse;

    } catch (error: any) {
      loggers.ai.error(
        request.context.userId,
        request.context.useCase,
        error.message
      );
      throw error;
    }
  }

  // Select best model for use case
  private selectModel(useCase: AIUseCase): AIModel {
    const modelMap: Record<AIUseCase, AIModel> = {
      mentor: 'gpt-4o-mini',        // Fast, cheap for learning guidance
      guru: 'claude-3-sonnet',       // Balanced for technical questions
      recruiter: 'gpt-4o-mini',      // Fast for communication
      productivity: 'gpt-4o-mini',   // Fast for analysis
      ceo_insights: 'gpt-4o',        // Powerful for strategic insights
      interview_bot: 'claude-3-opus', // Best for complex technical evaluation
      employee_bot: 'gpt-4o-mini',   // Fast for general queries
    };

    return modelMap[useCase] || 'gpt-4o-mini';
  }

  // Execute OpenAI request
  private async executeOpenAI(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    request: AIRequest
  ): Promise<AIResponse> {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content || '';
    const usage = completion.usage;

    return {
      content: response,
      model: model as AIModel,
      tokens: {
        prompt: usage?.prompt_tokens || 0,
        completion: usage?.completion_tokens || 0,
        total: usage?.total_tokens || 0,
      },
      cost: this.calculateCost(model as AIModel, usage?.total_tokens || 0),
      duration: 0, // Will be set by caller
    };
  }

  // Execute Anthropic request
  private async executeAnthropic(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    request: AIRequest
  ): Promise<AIResponse> {
    const completion = await anthropic.messages.create({
      model: model.replace('claude-3-', 'claude-3.'),
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
    });

    const response = completion.content[0]?.type === 'text' 
      ? completion.content[0].text 
      : '';

    return {
      content: response,
      model: model as AIModel,
      tokens: {
        prompt: 0, // Anthropic doesn't provide token counts
        completion: 0,
        total: 0,
      },
      cost: this.calculateCost(model as AIModel, response.length / 4), // Estimate
      duration: 0,
    };
  }

  // Calculate cost based on model and tokens
  private calculateCost(model: AIModel, tokens: number): number {
    // Cost per 1K tokens (approximate)
    const costMap: Record<AIModel, number> = {
      'gpt-4o': 0.03,
      'gpt-4o-mini': 0.0015,
      'claude-3-opus': 0.075,
      'claude-3-sonnet': 0.018,
      'claude-3-haiku': 0.0025,
    };

    return (tokens / 1000) * (costMap[model] || 0.01);
  }

  // Build system prompt based on use case
  private buildSystemPrompt(context: AIContext): string {
    // Import prompt templates
    const templates = {
      mentor: this.getMentorPrompt(context),
      guru: this.getGuruPrompt(context),
      recruiter: this.getRecruiterPrompt(context),
      productivity: this.getProductivityPrompt(context),
      ceo_insights: this.getCEOPrompt(context),
      interview_bot: this.getInterviewPrompt(context),
      employee_bot: this.getEmployeePrompt(context),
    };

    return templates[context.useCase] || 'You are a helpful AI assistant.';
  }

  // Enrich prompt with context
  private async enrichPrompt(prompt: string, context: AIContext): Promise<string> {
    // Add relevant context based on use case
    let enriched = prompt;

    // Add user context
    if (context.userId) {
      const userContext = await this.getUserContext(context.userId);
      if (userContext) {
        enriched = `User Context: ${JSON.stringify(userContext)}\n\n${enriched}`;
      }
    }

    // Add conversation history
    if (context.conversationId) {
      const history = await this.getConversationHistory(context.conversationId);
      if (history) {
        enriched = `Previous Context: ${history}\n\n${enriched}`;
      }
    }

    // Add metadata
    if (context.metadata) {
      enriched = `Additional Context: ${JSON.stringify(context.metadata)}\n\n${enriched}`;
    }

    return enriched;
  }

  // Validate response based on use case rules
  private async validateResponse(
    response: AIResponse,
    context: AIContext
  ): Promise<AIResponse> {
    // Use case specific validation
    switch (context.useCase) {
      case 'mentor':
        // Ensure no direct answers are given
        if (response.content.includes('The answer is') || 
            response.content.includes('Here is the solution')) {
          response.content = this.rewriteAsGuidance(response.content);
        }
        break;

      case 'recruiter':
        // Ensure professional tone
        response.content = this.ensureProfessionalTone(response.content);
        break;

      case 'ceo_insights':
        // Ensure executive summary format
        if (!response.content.includes('Executive Summary')) {
          response.content = this.formatAsExecutiveSummary(response.content);
        }
        break;
    }

    return response;
  }

  // Helper methods for context
  private async getUserContext(userId: string): Promise<any> {
    // Fetch from cache or database
    return await cache.get(cacheKeys.userProfile(userId));
  }

  private async getConversationHistory(conversationId: string): Promise<string> {
    // Fetch last few messages from cache or database
    const cached = await cache.get(cacheKeys.aiConversation(conversationId));
    return cached ? JSON.stringify(cached) : '';
  }

  // Prompt templates (simplified - would be in separate files in production)
  private getMentorPrompt(context: AIContext): string {
    return `You are Sumanth's AI teaching assistant for Guidewire training. 

CRITICAL RULES:
1. NEVER provide direct answers. Always guide through questions.
2. If student asks "How do I X?", respond with "What do you think would happen if...?"
3. Reference specific lesson materials when available.
4. Enforce prerequisites - don't help with advanced topics if basics aren't complete.
5. Maximum 3 hints before suggesting video review.
6. Track struggle patterns and suggest breaks if needed.

TEACHING PHILOSOPHY:
- Understanding > Memorization
- Practice > Theory
- Struggle is part of learning
- Small wins build confidence

RESPONSE STRUCTURE:
1. Acknowledge the question
2. Ask a guiding question back
3. Provide a contextual hint
4. Reference specific materials`;
  }

  private getGuruPrompt(context: AIContext): string {
    return `You are Guidewire Guru, an expert in all Guidewire products and implementations.

EXPERTISE AREAS:
- ClaimCenter, PolicyCenter, BillingCenter configuration
- Integration patterns and best practices
- Performance optimization
- Troubleshooting complex issues

RESPONSE STYLE:
- Technical but accessible
- Provide code examples when relevant
- Reference official documentation
- Suggest best practices
- Warn about common pitfalls`;
  }

  private getRecruiterPrompt(context: AIContext): string {
    return `You are an expert staffing recruiter assistant.

COMMUNICATION STYLE:
- Professional but personable
- Create urgency without desperation
- Focus on value proposition
- Always collect: Rate, Availability, Location

COMPLIANCE:
- Never discuss rates before Right to Work confirmation
- Include EEO statements
- Document all interactions
- Flag H1B/visa requirements

OPTIMIZATION GOALS:
- Response time < 2 hours
- Submission:Interview ratio > 1:3
- Interview:Placement ratio > 1:5`;
  }

  private getProductivityPrompt(context: AIContext): string {
    return `You analyze employee productivity data objectively.

ANALYSIS FRAMEWORK:
1. Identify patterns, not isolated incidents
2. Consider context (meetings, breaks, focus time)
3. Compare to role baselines
4. Suggest improvements, not criticisms

PRIVACY RULES:
- Never identify personal websites/apps
- Group similar activities
- Focus on outcomes, not surveillance
- Flag only significant deviations (>20%)

OUTPUT: Constructive insights with actionable recommendations`;
  }

  private getCEOPrompt(context: AIContext): string {
    return `You are the CEO's strategic insights AI.

COMMUNICATION STYLE:
- Executive summary first (3 bullets max)
- Data-driven but intuitive
- Focus on decisions needed
- Highlight risks and opportunities

ANALYSIS DEPTH:
1. Cross-functional correlations
2. Leading indicators
3. Competitive implications
4. Revenue/cost impact

PRIORITY LEVELS:
🔴 Critical: Immediate action needed
🟡 Important: Review this week  
🟢 Informational: Trending positive`;
  }

  private getInterviewPrompt(context: AIContext): string {
    return `You are a technical interview assistant evaluating candidates.

EVALUATION CRITERIA:
- Technical accuracy
- Problem-solving approach
- Communication clarity
- Learning potential

QUESTION STYLE:
- Start with fundamentals
- Progress to complex scenarios
- Include real-world problems
- Test debugging skills

FEEDBACK:
- Specific strengths/weaknesses
- Learning recommendations
- Hiring recommendation with confidence level`;
  }

  private getEmployeePrompt(context: AIContext): string {
    return `You are an employee assistant helping with workplace queries.

AREAS OF SUPPORT:
- Company policies
- Benefits information
- Process guidance
- Tool assistance

RESPONSE STYLE:
- Friendly and helpful
- Clear and concise
- Reference official resources
- Escalate when needed`;
  }

  // Response transformation helpers
  private rewriteAsGuidance(content: string): string {
    // Transform direct answers into guiding questions
    return content
      .replace(/The answer is/g, 'Consider what would happen if')
      .replace(/You should/g, 'What if you tried')
      .replace(/Here is the solution/g, 'Think about how you might');
  }

  private ensureProfessionalTone(content: string): string {
    // Basic tone adjustment (would be more sophisticated)
    return content
      .replace(/hey/gi, 'Hello')
      .replace(/yeah/gi, 'yes')
      .replace(/nope/gi, 'no');
  }

  private formatAsExecutiveSummary(content: string): string {
    // Add executive summary structure
    const lines = content.split('\n');
    const summary = lines.slice(0, 3).join('\n');
    const details = lines.slice(3).join('\n');

    return `EXECUTIVE SUMMARY:
${summary}

DETAILED ANALYSIS:
${details}`;
  }
}

// Export singleton instance
export const aiOrchestrator = AIOrchestrator.getInstance();
