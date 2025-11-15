import { createClient } from '@/lib/supabase/server';
import { aiOrchestrator, AIUseCase } from './orchestrator';
import { loggers } from '@/lib/logger';
import { cache, cacheKeys } from '@/lib/redis';

// Learning data types
export interface AIInteraction {
  id: string;
  useCase: AIUseCase;
  userId: string;
  prompt: string;
  response: string;
  context: Record<string, any>;
  timestamp: Date;
}

export interface AIOutcome {
  interactionId: string;
  success: boolean;
  metrics?: Record<string, any>;
  userFeedback?: 'positive' | 'negative' | 'neutral';
  systemFeedback?: Record<string, any>;
  timestamp: Date;
}

export interface LearningPattern {
  pattern: string;
  useCase: AIUseCase;
  frequency: number;
  successRate: number;
  recommendations: string[];
}

// AI Learning System
export class AILearningSystem {
  private static instance: AILearningSystem;

  private constructor() {}

  static getInstance(): AILearningSystem {
    if (!AILearningSystem.instance) {
      AILearningSystem.instance = new AILearningSystem();
    }
    return AILearningSystem.instance;
  }

  // Track AI interaction
  async trackInteraction(
    interaction: Omit<AIInteraction, 'id' | 'timestamp'>
  ): Promise<string> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ai_learning_data')
      .insert({
        use_case: interaction.useCase,
        user_id: interaction.userId,
        prompt: interaction.prompt,
        response: interaction.response,
        context: interaction.context,
      })
      .select('id')
      .single();

    if (error) {
      loggers.system.error('AI Learning', error);
      throw error;
    }

    // Log for analysis
    loggers.ai.request(interaction.userId, interaction.useCase, 'learning_tracked');

    return data.id;
  }

  // Track outcome
  async trackOutcome(
    interactionId: string,
    outcome: Omit<AIOutcome, 'interactionId' | 'timestamp'>
  ): Promise<void> {
    const supabase = await createClient();

    // Update learning data with outcome
    const { error } = await supabase
      .from('ai_learning_data')
      .update({
        outcome: {
          success: outcome.success,
          metrics: outcome.metrics,
          user_feedback: outcome.userFeedback,
          system_feedback: outcome.systemFeedback,
        },
        success_score: outcome.success ? 1.0 : 0.0,
        user_feedback: outcome.userFeedback,
      })
      .eq('id', interactionId);

    if (error) {
      loggers.system.error('AI Learning Outcome', error);
      throw error;
    }

    // Check for patterns
    await this.detectPatterns(interactionId);
  }

  // Detect patterns in interactions
  private async detectPatterns(interactionId: string): Promise<void> {
    const supabase = await createClient();

    // Get the interaction
    const { data: interaction } = await supabase
      .from('ai_learning_data')
      .select('*')
      .eq('id', interactionId)
      .single();

    if (!interaction) return;

    // Get similar interactions
    const { data: similar } = await supabase
      .from('ai_learning_data')
      .select('*')
      .eq('use_case', interaction.use_case)
      .neq('id', interactionId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!similar || similar.length < 10) return;

    // Analyze patterns
    const patterns = this.analyzePatterns(interaction, similar);

    // Store significant patterns
    for (const pattern of patterns) {
      if (pattern.frequency > 5 && pattern.successRate < 0.7) {
        await this.storePattern(pattern);
      }
    }
  }

  // Analyze patterns in data
  private analyzePatterns(
    current: any,
    historical: any[]
  ): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    // Pattern 1: Common prompt patterns
    const promptPatterns = this.findPromptPatterns(current, historical);
    patterns.push(...promptPatterns);

    // Pattern 2: Failed response patterns
    const failurePatterns = this.findFailurePatterns(current, historical);
    patterns.push(...failurePatterns);

    // Pattern 3: Context patterns
    const contextPatterns = this.findContextPatterns(current, historical);
    patterns.push(...contextPatterns);

    return patterns;
  }

  // Find patterns in prompts
  private findPromptPatterns(current: any, historical: any[]): LearningPattern[] {
    const patterns: LearningPattern[] = [];
    const promptWords = current.prompt.toLowerCase().split(/\s+/);

    // Find common phrases
    const phraseFrequency = new Map<string, number>();
    const phraseSuccess = new Map<string, number>();

    historical.forEach(item => {
      const words = item.prompt.toLowerCase().split(/\s+/);
      
      // Check for common 2-3 word phrases
      for (let i = 0; i < words.length - 2; i++) {
        const phrase2 = `${words[i]} ${words[i + 1]}`;
        const phrase3 = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;

        [phrase2, phrase3].forEach(phrase => {
          phraseFrequency.set(phrase, (phraseFrequency.get(phrase) || 0) + 1);
          if (item.success_score > 0.7) {
            phraseSuccess.set(phrase, (phraseSuccess.get(phrase) || 0) + 1);
          }
        });
      }
    });

    // Identify problematic phrases
    phraseFrequency.forEach((freq, phrase) => {
      if (freq > 5) {
        const successCount = phraseSuccess.get(phrase) || 0;
        const successRate = successCount / freq;

        if (successRate < 0.7 && current.prompt.toLowerCase().includes(phrase)) {
          patterns.push({
            pattern: `Phrase "${phrase}" often leads to poor responses`,
            useCase: current.use_case,
            frequency: freq,
            successRate,
            recommendations: [
              `Rephrase prompts containing "${phrase}"`,
              `Add more context when using this phrase`,
            ],
          });
        }
      }
    });

    return patterns;
  }

  // Find failure patterns
  private findFailurePatterns(current: any, historical: any[]): LearningPattern[] {
    const patterns: LearningPattern[] = [];
    
    // Group by failure type
    const failures = historical.filter(item => item.success_score < 0.5);
    const failureTypes = new Map<string, number>();

    failures.forEach(item => {
      const response = item.response.toLowerCase();
      
      // Categorize failure types
      if (response.includes('i cannot') || response.includes("i can't")) {
        failureTypes.set('refusal', (failureTypes.get('refusal') || 0) + 1);
      } else if (response.includes('error') || response.includes('failed')) {
        failureTypes.set('error', (failureTypes.get('error') || 0) + 1);
      } else if (response.length < 50) {
        failureTypes.set('short_response', (failureTypes.get('short_response') || 0) + 1);
      }
    });

    // Create patterns for common failures
    failureTypes.forEach((count, type) => {
      if (count > 3) {
        patterns.push({
          pattern: `High ${type} rate in responses`,
          useCase: current.use_case,
          frequency: count,
          successRate: 0,
          recommendations: this.getFailureRecommendations(type),
        });
      }
    });

    return patterns;
  }

  // Find context patterns
  private findContextPatterns(current: any, historical: any[]): LearningPattern[] {
    const patterns: LearningPattern[] = [];
    
    // Analyze context impact on success
    const contextKeys = Object.keys(current.context || {});
    const contextSuccess = new Map<string, { total: number; success: number }>();

    historical.forEach(item => {
      const itemContext = item.context || {};
      
      contextKeys.forEach(key => {
        if (itemContext[key] !== undefined) {
          const stats = contextSuccess.get(key) || { total: 0, success: 0 };
          stats.total++;
          if (item.success_score > 0.7) {
            stats.success++;
          }
          contextSuccess.set(key, stats);
        }
      });
    });

    // Identify impactful context
    contextSuccess.forEach((stats, key) => {
      const successRate = stats.success / stats.total;
      
      if (stats.total > 10 && successRate < 0.6) {
        patterns.push({
          pattern: `Context "${key}" correlates with poor outcomes`,
          useCase: current.use_case,
          frequency: stats.total,
          successRate,
          recommendations: [
            `Review how "${key}" context is being used`,
            `Consider enriching or modifying this context`,
          ],
        });
      }
    });

    return patterns;
  }

  // Store detected pattern
  private async storePattern(pattern: LearningPattern): Promise<void> {
    const supabase = await createClient();

    await supabase
      .from('ai_learning_patterns')
      .upsert({
        pattern: pattern.pattern,
        use_case: pattern.useCase,
        frequency: pattern.frequency,
        success_rate: pattern.successRate,
        recommendations: pattern.recommendations,
        last_seen: new Date().toISOString(),
      }, {
        onConflict: 'pattern,use_case',
      });
  }

  // Get failure recommendations
  private getFailureRecommendations(failureType: string): string[] {
    const recommendations = {
      refusal: [
        'Adjust system prompts to be more permissive',
        'Add context to clarify the request is appropriate',
        'Break down complex requests into simpler parts',
      ],
      error: [
        'Check for malformed inputs',
        'Validate context data before sending',
        'Add error handling for edge cases',
      ],
      short_response: [
        'Request more detailed responses in prompts',
        'Add follow-up questions automatically',
        'Increase temperature for more creative responses',
      ],
    };

    return recommendations[failureType] || ['Review prompt templates'];
  }

  // Get learning insights
  async getLearningInsights(
    useCase?: AIUseCase,
    dateRange?: { from: Date; to: Date }
  ): Promise<{
    totalInteractions: number;
    successRate: number;
    commonPatterns: LearningPattern[];
    recommendations: string[];
  }> {
    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('ai_learning_data')
      .select('*');

    if (useCase) {
      query = query.eq('use_case', useCase);
    }

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());
    }

    const { data: interactions } = await query;

    // Calculate metrics
    const totalInteractions = interactions?.length || 0;
    const successfulInteractions = interactions?.filter(i => i.success_score > 0.7).length || 0;
    const successRate = totalInteractions > 0 ? successfulInteractions / totalInteractions : 0;

    // Get patterns
    const { data: patterns } = await supabase
      .from('ai_learning_patterns')
      .select('*')
      .eq(useCase ? 'use_case' : '', useCase || '')
      .order('frequency', { ascending: false })
      .limit(10);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      successRate,
      patterns || [],
      interactions || []
    );

    return {
      totalInteractions,
      successRate,
      commonPatterns: patterns || [],
      recommendations,
    };
  }

  // Generate recommendations
  private generateRecommendations(
    successRate: number,
    patterns: LearningPattern[],
    interactions: any[]
  ): string[] {
    const recommendations: string[] = [];

    // Success rate recommendations
    if (successRate < 0.7) {
      recommendations.push('Overall success rate is below target. Review prompt templates.');
    }

    // Pattern-based recommendations
    patterns.forEach(pattern => {
      if (pattern.frequency > 10 && pattern.successRate < 0.6) {
        recommendations.push(...pattern.recommendations);
      }
    });

    // Time-based recommendations
    const recentInteractions = interactions
      .filter(i => new Date(i.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .slice(-20);

    const recentSuccessRate = recentInteractions.filter(i => i.success_score > 0.7).length / 
                            (recentInteractions.length || 1);

    if (recentSuccessRate < 0.6) {
      recommendations.push('Recent performance is declining. Check for system changes.');
    }

    // Remove duplicates
    return [...new Set(recommendations)];
  }

  // Apply learnings to improve responses
  async applyLearnings(
    useCase: AIUseCase,
    prompt: string,
    context: Record<string, any>
  ): Promise<{
    adjustedPrompt?: string;
    adjustedContext?: Record<string, any>;
    warnings?: string[];
  }> {
    const supabase = await createClient();

    // Get relevant patterns
    const { data: patterns } = await supabase
      .from('ai_learning_patterns')
      .select('*')
      .eq('use_case', useCase)
      .order('frequency', { ascending: false })
      .limit(20);

    let adjustedPrompt = prompt;
    const adjustedContext = { ...context };
    const warnings: string[] = [];

    // Apply pattern-based adjustments
    patterns?.forEach(pattern => {
      // Check if pattern applies to current interaction
      if (prompt.toLowerCase().includes(pattern.pattern.toLowerCase())) {
        warnings.push(`Warning: ${pattern.pattern}`);
        
        // Apply automatic adjustments if confidence is high
        if (pattern.frequency > 20 && pattern.success_rate < 0.3) {
          // Simple prompt adjustments
          adjustedPrompt = this.adjustPromptBasedOnPattern(adjustedPrompt, pattern);
        }
      }
    });

    // Get successful examples for this use case
    const { data: successes } = await supabase
      .from('ai_learning_data')
      .select('prompt, context')
      .eq('use_case', useCase)
      .gt('success_score', 0.9)
      .order('created_at', { ascending: false })
      .limit(10);

    // Learn from successful patterns
    if (successes && successes.length > 5) {
      const successContext = this.extractCommonContext(successes);
      Object.assign(adjustedContext, successContext);
    }

    return {
      adjustedPrompt: adjustedPrompt !== prompt ? adjustedPrompt : undefined,
      adjustedContext: Object.keys(adjustedContext).length > Object.keys(context).length 
        ? adjustedContext 
        : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // Adjust prompt based on pattern
  private adjustPromptBasedOnPattern(prompt: string, pattern: LearningPattern): string {
    // Simple adjustments - in production would use more sophisticated NLP
    let adjusted = prompt;

    // Add clarifying context
    if (pattern.pattern.includes('ambiguous')) {
      adjusted = `Please provide a specific and detailed response to: ${adjusted}`;
    }

    // Break down complex requests
    if (pattern.pattern.includes('complex')) {
      adjusted = `Let's break this down step by step: ${adjusted}`;
    }

    return adjusted;
  }

  // Extract common successful context
  private extractCommonContext(successes: any[]): Record<string, any> {
    const commonContext: Record<string, any> = {};
    const contextFrequency = new Map<string, Map<any, number>>();

    // Count context key-value frequencies
    successes.forEach(item => {
      const ctx = item.context || {};
      
      Object.entries(ctx).forEach(([key, value]) => {
        if (!contextFrequency.has(key)) {
          contextFrequency.set(key, new Map());
        }
        const valueMap = contextFrequency.get(key)!;
        valueMap.set(value, (valueMap.get(value) || 0) + 1);
      });
    });

    // Extract most common values
    contextFrequency.forEach((valueMap, key) => {
      let maxCount = 0;
      let mostCommon: any;

      valueMap.forEach((count, value) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommon = value;
        }
      });

      if (maxCount > successes.length * 0.6) {
        commonContext[key] = mostCommon;
      }
    });

    return commonContext;
  }
}

// Export singleton
export const aiLearningSystem = AILearningSystem.getInstance();
