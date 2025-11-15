import { createClient } from '@/lib/supabase/server';
import { aiLearningSystem } from './learning-system';
import { loggers } from '@/lib/logger';

// Feedback types
export type FeedbackType = 'thumbs_up' | 'thumbs_down' | 'report' | 'correction';
export type FeedbackCategory = 'accuracy' | 'helpfulness' | 'relevance' | 'tone' | 'other';

export interface UserFeedback {
  id?: string;
  conversationId: string;
  messageId: string;
  userId: string;
  type: FeedbackType;
  category?: FeedbackCategory;
  details?: string;
  suggestedResponse?: string;
  timestamp?: Date;
}

export interface SystemFeedback {
  responseTime: number;
  tokenCount: number;
  errorOccurred: boolean;
  retryCount: number;
  modelUsed: string;
}

// Feedback Collection System
export class AIFeedbackSystem {
  private static instance: AIFeedbackSystem;

  private constructor() {}

  static getInstance(): AIFeedbackSystem {
    if (!AIFeedbackSystem.instance) {
      AIFeedbackSystem.instance = new AIFeedbackSystem();
    }
    return AIFeedbackSystem.instance;
  }

  // Collect user feedback
  async collectUserFeedback(feedback: UserFeedback): Promise<void> {
    const supabase = await createClient();

    try {
      // Store feedback
      const { data, error } = await supabase
        .from('ai_feedback')
        .insert({
          conversation_id: feedback.conversationId,
          message_id: feedback.messageId,
          user_id: feedback.userId,
          feedback_type: feedback.type,
          feedback_category: feedback.category,
          feedback_details: feedback.details,
          suggested_response: feedback.suggestedResponse,
        })
        .select()
        .single();

      if (error) throw error;

      // Update learning system
      await this.processUserFeedback(data.id, feedback);

      // Log feedback
      loggers.ai.request(feedback.userId, 'feedback', feedback.type);

    } catch (error) {
      loggers.system.error('Feedback Collection', error);
      throw error;
    }
  }

  // Process feedback for learning
  private async processUserFeedback(
    feedbackId: string,
    feedback: UserFeedback
  ): Promise<void> {
    const supabase = await createClient();

    // Get the original interaction
    const { data: message } = await supabase
      .from('ai_messages')
      .select(`
        *,
        ai_conversations(*)
      `)
      .eq('id', feedback.messageId)
      .single();

    if (!message) return;

    // Calculate success score based on feedback
    const successScore = this.calculateSuccessScore(feedback);

    // Track outcome in learning system
    await aiLearningSystem.trackOutcome(message.conversation_id, {
      success: successScore > 0.5,
      userFeedback: this.mapFeedbackToSentiment(feedback.type),
      systemFeedback: {
        feedbackId,
        category: feedback.category,
        hasCorrection: !!feedback.suggestedResponse,
      },
      metrics: {
        successScore,
        responseLength: message.content.length,
      },
    });

    // If correction provided, store for fine-tuning
    if (feedback.suggestedResponse) {
      await this.storeCorrectionPair(
        message.content,
        feedback.suggestedResponse,
        message.ai_conversations.conversation_type
      );
    }

    // Check if retraining is needed
    await this.checkRetrainingTriggers(message.ai_conversations.conversation_type);
  }

  // Calculate success score from feedback
  private calculateSuccessScore(feedback: UserFeedback): number {
    const baseScores = {
      thumbs_up: 1.0,
      thumbs_down: 0.0,
      report: 0.0,
      correction: 0.3, // Partial success if correction provided
    };

    let score = baseScores[feedback.type];

    // Adjust based on category
    if (feedback.category === 'accuracy' && feedback.type === 'thumbs_down') {
      score = 0.0; // Critical failure
    } else if (feedback.category === 'tone' && feedback.type === 'thumbs_down') {
      score = 0.4; // Less critical
    }

    return score;
  }

  // Map feedback type to sentiment
  private mapFeedbackToSentiment(type: FeedbackType): 'positive' | 'negative' | 'neutral' {
    switch (type) {
      case 'thumbs_up':
        return 'positive';
      case 'thumbs_down':
      case 'report':
        return 'negative';
      case 'correction':
        return 'neutral';
    }
  }

  // Store correction pairs for fine-tuning
  private async storeCorrectionPair(
    original: string,
    corrected: string,
    useCase: string
  ): Promise<void> {
    const supabase = await createClient();

    await supabase
      .from('ai_correction_pairs')
      .insert({
        original_response: original,
        corrected_response: corrected,
        use_case: useCase,
        created_at: new Date().toISOString(),
      });
  }

  // Check if retraining is needed
  private async checkRetrainingTriggers(useCase: string): Promise<void> {
    const supabase = await createClient();

    // Get recent feedback stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: feedbackStats } = await supabase
      .from('ai_feedback')
      .select('feedback_type')
      .eq('use_case', useCase)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (!feedbackStats || feedbackStats.length < 100) return;

    // Calculate negative feedback rate
    const negativeFeedback = feedbackStats.filter(f => 
      f.feedback_type === 'thumbs_down' || f.feedback_type === 'report'
    ).length;

    const negativeRate = negativeFeedback / feedbackStats.length;

    // Trigger retraining if negative rate > 20%
    if (negativeRate > 0.2) {
      await this.triggerRetraining(useCase, negativeRate);
    }
  }

  // Trigger model retraining
  private async triggerRetraining(useCase: string, negativeRate: number): Promise<void> {
    const supabase = await createClient();

    // Create retraining job
    await supabase
      .from('ai_retraining_jobs')
      .insert({
        use_case: useCase,
        trigger_reason: 'high_negative_feedback',
        metrics: {
          negative_rate: negativeRate,
          threshold: 0.2,
        },
        status: 'pending',
      });

    // Log alert
    loggers.system.error('AI Retraining Triggered', {
      useCase,
      negativeRate,
      reason: 'High negative feedback rate',
    });
  }

  // Get feedback analytics
  async getFeedbackAnalytics(
    useCase?: string,
    dateRange?: { from: Date; to: Date }
  ): Promise<{
    totalFeedback: number;
    feedbackByType: Record<FeedbackType, number>;
    feedbackByCategory: Record<FeedbackCategory, number>;
    satisfactionRate: number;
    commonIssues: string[];
  }> {
    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('ai_feedback')
      .select('*');

    if (useCase) {
      // Join with conversations to filter by use case
      query = query.eq('ai_conversations.conversation_type', useCase);
    }

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());
    }

    const { data: feedback } = await query;

    // Calculate metrics
    const totalFeedback = feedback?.length || 0;
    
    const feedbackByType: Record<FeedbackType, number> = {
      thumbs_up: 0,
      thumbs_down: 0,
      report: 0,
      correction: 0,
    };

    const feedbackByCategory: Record<string, number> = {};
    const issues: string[] = [];

    feedback?.forEach(item => {
      // Count by type
      feedbackByType[item.feedback_type as FeedbackType]++;

      // Count by category
      if (item.feedback_category) {
        feedbackByCategory[item.feedback_category] = 
          (feedbackByCategory[item.feedback_category] || 0) + 1;
      }

      // Collect issues
      if (item.feedback_details && item.feedback_type !== 'thumbs_up') {
        issues.push(item.feedback_details);
      }
    });

    // Calculate satisfaction rate
    const positiveFeedback = feedbackByType.thumbs_up;
    const satisfactionRate = totalFeedback > 0 
      ? positiveFeedback / totalFeedback 
      : 0;

    // Find common issues using simple frequency analysis
    const commonIssues = this.findCommonIssues(issues);

    return {
      totalFeedback,
      feedbackByType,
      feedbackByCategory: feedbackByCategory as Record<FeedbackCategory, number>,
      satisfactionRate,
      commonIssues,
    };
  }

  // Find common issues in feedback
  private findCommonIssues(issues: string[]): string[] {
    const wordFrequency = new Map<string, number>();
    const commonWords = new Set(['the', 'a', 'an', 'is', 'was', 'were', 'been', 'be', 'to', 'of']);

    // Count word frequency
    issues.forEach(issue => {
      const words = issue.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && !commonWords.has(word)) {
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
      });
    });

    // Sort by frequency
    const sortedWords = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Group related issues
    const commonIssues: string[] = [];
    const processedWords = new Set<string>();

    sortedWords.forEach(([word, count]) => {
      if (processedWords.has(word)) return;

      // Find issues containing this word
      const relatedIssues = issues.filter(issue => 
        issue.toLowerCase().includes(word)
      ).slice(0, 3);

      if (relatedIssues.length > 0 && count > 2) {
        commonIssues.push(`${word} (${count} mentions)`);
        processedWords.add(word);
      }
    });

    return commonIssues;
  }
}

// Export singleton
export const aiFeedbackSystem = AIFeedbackSystem.getInstance();
