import { createClient } from '@/lib/supabase/server';
import { AIUseCase } from './orchestrator';
import { loggers } from '@/lib/logger';
import { cache, cacheKeys } from '@/lib/redis';

// A/B test types
export interface ABTest {
  id: string;
  name: string;
  useCase: AIUseCase;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: TestVariant[];
  targetAudience?: TargetAudience;
  startDate?: Date;
  endDate?: Date;
  metrics: TestMetrics;
}

export interface TestVariant {
  id: string;
  name: string;
  description: string;
  config: VariantConfig;
  allocation: number; // Percentage (0-100)
}

export interface VariantConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  promptTemplate?: string;
  contextEnrichment?: Record<string, any>;
}

export interface TargetAudience {
  userSegment?: 'all' | 'new' | 'experienced';
  useCases?: AIUseCase[];
  userIds?: string[];
  percentage?: number;
}

export interface TestMetrics {
  primaryMetric: string;
  secondaryMetrics: string[];
  minimumSampleSize: number;
  confidenceLevel: number;
}

export interface TestResults {
  variantId: string;
  sampleSize: number;
  metrics: Record<string, number>;
  confidence: number;
  isWinner: boolean;
}

// A/B Testing Framework
export class AIABTestingFramework {
  private static instance: AIABTestingFramework;
  private activeTests: Map<string, ABTest> = new Map();

  private constructor() {
    this.loadActiveTests();
  }

  static getInstance(): AIABTestingFramework {
    if (!AIABTestingFramework.instance) {
      AIABTestingFramework.instance = new AIABTestingFramework();
    }
    return AIABTestingFramework.instance;
  }

  // Load active tests from database
  private async loadActiveTests(): Promise<void> {
    const supabase = await createClient();

    const { data: tests } = await supabase
      .from('ai_ab_tests')
      .select('*')
      .in('status', ['running', 'paused']);

    tests?.forEach(test => {
      this.activeTests.set(test.id, test);
    });
  }

  // Create new A/B test
  async createTest(test: Omit<ABTest, 'id'>): Promise<string> {
    const supabase = await createClient();

    // Validate test configuration
    this.validateTest(test);

    const { data, error } = await supabase
      .from('ai_ab_tests')
      .insert({
        name: test.name,
        use_case: test.useCase,
        status: test.status,
        variants: test.variants,
        target_audience: test.targetAudience,
        start_date: test.startDate,
        end_date: test.endDate,
        metrics: test.metrics,
      })
      .select()
      .single();

    if (error) throw error;

    // Cache if running
    if (data.status === 'running') {
      this.activeTests.set(data.id, data);
    }

    loggers.system.info('A/B Test Created', { testId: data.id, name: test.name });

    return data.id;
  }

  // Validate test configuration
  private validateTest(test: Omit<ABTest, 'id'>): void {
    // Check variant allocations sum to 100
    const totalAllocation = test.variants.reduce((sum, v) => sum + v.allocation, 0);
    if (totalAllocation !== 100) {
      throw new Error(`Variant allocations must sum to 100%, got ${totalAllocation}%`);
    }

    // Ensure at least 2 variants
    if (test.variants.length < 2) {
      throw new Error('A/B test must have at least 2 variants');
    }

    // Validate metrics
    if (!test.metrics.primaryMetric) {
      throw new Error('Primary metric is required');
    }

    if (test.metrics.confidenceLevel < 0.8 || test.metrics.confidenceLevel > 0.99) {
      throw new Error('Confidence level must be between 0.8 and 0.99');
    }
  }

  // Get variant for user
  async getVariant(
    userId: string,
    useCase: AIUseCase
  ): Promise<{ testId: string; variant: TestVariant } | null> {
    // Find applicable tests
    const applicableTests = Array.from(this.activeTests.values())
      .filter(test => {
        // Check use case
        if (test.useCase !== useCase) return false;

        // Check status
        if (test.status !== 'running') return false;

        // Check date range
        const now = new Date();
        if (test.startDate && now < test.startDate) return false;
        if (test.endDate && now > test.endDate) return false;

        // Check target audience
        if (test.targetAudience) {
          return this.isUserInAudience(userId, test.targetAudience);
        }

        return true;
      });

    if (applicableTests.length === 0) return null;

    // For now, return first applicable test
    // In production, handle multiple concurrent tests
    const test = applicableTests[0];

    // Get or assign variant
    const variant = await this.assignVariant(userId, test);

    return { testId: test.id, variant };
  }

  // Check if user is in target audience
  private isUserInAudience(userId: string, audience: TargetAudience): boolean {
    // Check specific user IDs
    if (audience.userIds && !audience.userIds.includes(userId)) {
      return false;
    }

    // Check percentage (simple hash-based assignment)
    if (audience.percentage) {
      const hash = this.hashUserId(userId);
      const threshold = audience.percentage / 100;
      if (hash > threshold) return false;
    }

    // Additional audience checks would go here
    return true;
  }

  // Assign variant to user
  private async assignVariant(userId: string, test: ABTest): Promise<TestVariant> {
    const supabase = await createClient();

    // Check if already assigned
    const cacheKey = `ab:${test.id}:${userId}`;
    const cached = await cache.get<string>(cacheKey);
    
    if (cached) {
      const variant = test.variants.find(v => v.id === cached);
      if (variant) return variant;
    }

    // Assign based on allocation
    const assignment = this.calculateVariantAssignment(userId, test.variants);
    const variant = test.variants[assignment];

    // Store assignment
    await supabase
      .from('ai_ab_assignments')
      .upsert({
        test_id: test.id,
        user_id: userId,
        variant_id: variant.id,
        assigned_at: new Date().toISOString(),
      });

    // Cache assignment
    await cache.set(cacheKey, variant.id, 86400); // 24 hours

    return variant;
  }

  // Calculate variant assignment
  private calculateVariantAssignment(userId: string, variants: TestVariant[]): number {
    const hash = this.hashUserId(userId);
    let cumulative = 0;

    for (let i = 0; i < variants.length; i++) {
      cumulative += variants[i].allocation / 100;
      if (hash <= cumulative) {
        return i;
      }
    }

    return variants.length - 1; // Fallback to last variant
  }

  // Simple hash function for user ID
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  // Track test result
  async trackResult(
    testId: string,
    variantId: string,
    userId: string,
    metrics: Record<string, number>
  ): Promise<void> {
    const supabase = await createClient();

    await supabase
      .from('ai_ab_results')
      .insert({
        test_id: testId,
        variant_id: variantId,
        user_id: userId,
        metrics,
        created_at: new Date().toISOString(),
      });

    // Check if test should be concluded
    await this.checkTestConclusion(testId);
  }

  // Check if test should be concluded
  private async checkTestConclusion(testId: string): Promise<void> {
    const test = this.activeTests.get(testId);
    if (!test) return;

    const results = await this.calculateTestResults(testId);
    
    // Check if we have enough data
    const totalSamples = results.reduce((sum, r) => sum + r.sampleSize, 0);
    if (totalSamples < test.metrics.minimumSampleSize) return;

    // Check for statistical significance
    const winner = this.determineWinner(results, test.metrics);
    
    if (winner) {
      await this.concludeTest(testId, winner);
    }
  }

  // Calculate test results
  private async calculateTestResults(testId: string): Promise<TestResults[]> {
    const supabase = await createClient();
    const test = this.activeTests.get(testId);
    if (!test) return [];

    const results: TestResults[] = [];

    for (const variant of test.variants) {
      const { data: variantResults } = await supabase
        .from('ai_ab_results')
        .select('metrics')
        .eq('test_id', testId)
        .eq('variant_id', variant.id);

      if (!variantResults || variantResults.length === 0) {
        results.push({
          variantId: variant.id,
          sampleSize: 0,
          metrics: {},
          confidence: 0,
          isWinner: false,
        });
        continue;
      }

      // Aggregate metrics
      const aggregatedMetrics: Record<string, number> = {};
      const primaryMetricValues: number[] = [];

      variantResults.forEach(result => {
        Object.entries(result.metrics).forEach(([key, value]) => {
          if (!aggregatedMetrics[key]) {
            aggregatedMetrics[key] = 0;
          }
          aggregatedMetrics[key] += value as number;
        });
        
        if (test.metrics.primaryMetric in result.metrics) {
          primaryMetricValues.push(result.metrics[test.metrics.primaryMetric] as number);
        }
      });

      // Calculate averages
      Object.keys(aggregatedMetrics).forEach(key => {
        aggregatedMetrics[key] /= variantResults.length;
      });

      // Calculate confidence (simplified)
      const confidence = this.calculateConfidence(
        primaryMetricValues,
        test.metrics.confidenceLevel
      );

      results.push({
        variantId: variant.id,
        sampleSize: variantResults.length,
        metrics: aggregatedMetrics,
        confidence,
        isWinner: false,
      });
    }

    return results;
  }

  // Calculate confidence interval
  private calculateConfidence(values: number[], confidenceLevel: number): number {
    if (values.length < 2) return 0;

    // Calculate mean and standard deviation
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
    const stdDev = Math.sqrt(variance);

    // Calculate standard error
    const stdError = stdDev / Math.sqrt(values.length);

    // Z-score for confidence level (simplified)
    const zScores = {
      0.8: 1.28,
      0.9: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };
    const z = zScores[confidenceLevel] || 1.96;

    // Confidence interval
    const margin = z * stdError;
    
    // Return relative confidence (0-1)
    return Math.min(1, 1 - (margin / Math.abs(mean)));
  }

  // Determine winner
  private determineWinner(
    results: TestResults[],
    metrics: TestMetrics
  ): TestResults | null {
    // Sort by primary metric
    const sorted = results
      .filter(r => r.sampleSize > 0)
      .sort((a, b) => {
        const aValue = a.metrics[metrics.primaryMetric] || 0;
        const bValue = b.metrics[metrics.primaryMetric] || 0;
        return bValue - aValue;
      });

    if (sorted.length < 2) return null;

    const best = sorted[0];
    const second = sorted[1];

    // Check if difference is significant
    const improvement = (best.metrics[metrics.primaryMetric] - second.metrics[metrics.primaryMetric]) /
                       second.metrics[metrics.primaryMetric];

    // Require at least 5% improvement and high confidence
    if (improvement > 0.05 && best.confidence >= metrics.confidenceLevel) {
      best.isWinner = true;
      return best;
    }

    return null;
  }

  // Conclude test
  private async concludeTest(testId: string, winner: TestResults): Promise<void> {
    const supabase = await createClient();

    // Update test status
    await supabase
      .from('ai_ab_tests')
      .update({
        status: 'completed',
        winner_variant_id: winner.variantId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', testId);

    // Remove from active tests
    this.activeTests.delete(testId);

    // Log conclusion
    loggers.system.info('A/B Test Concluded', {
      testId,
      winner: winner.variantId,
      improvement: winner.metrics,
    });

    // Apply winning variant (if configured)
    await this.applyWinningVariant(testId, winner.variantId);
  }

  // Apply winning variant configuration
  private async applyWinningVariant(testId: string, variantId: string): Promise<void> {
    // This would update the production configuration
    // For now, just log
    loggers.system.info('Winning Variant Ready to Apply', { testId, variantId });
  }

  // Get test analytics
  async getTestAnalytics(testId: string): Promise<{
    test: ABTest;
    results: TestResults[];
    timeline: any[];
  }> {
    const supabase = await createClient();

    // Get test details
    const { data: test } = await supabase
      .from('ai_ab_tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (!test) throw new Error('Test not found');

    // Get results
    const results = await this.calculateTestResults(testId);

    // Get timeline data
    const { data: timeline } = await supabase
      .from('ai_ab_results')
      .select('variant_id, created_at, metrics')
      .eq('test_id', testId)
      .order('created_at', { ascending: true });

    return {
      test,
      results,
      timeline: timeline || [],
    };
  }
}

// Export singleton
export const aiABTestingFramework = AIABTestingFramework.getInstance();
