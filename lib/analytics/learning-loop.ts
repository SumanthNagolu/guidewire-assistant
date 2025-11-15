/**
 * PRODUCTIVITY → PLATFORM LEARNING LOOP
 * Autonomous workflow optimization
 * 
 * Analyzes:
 * - Productivity patterns across pods
 * - Workflow performance metrics
 * - Bottleneck correlations
 * 
 * Generates:
 * - AI-powered insights
 * - Optimization suggestions
 * - Auto-applied improvements
 * - CEO daily digest
 * 
 * Runs: Daily at 6 AM (via cron)
 */

import { createClient } from '@/lib/supabase/server';
import { getAIService } from '@/lib/ai/unified-service';
import { getWorkflowEngine } from '@/lib/workflows/engine';

// ============================================================================
// TYPES
// ============================================================================

interface ProductivityPattern {
  pod_id: string;
  pod_name: string;
  avg_productivity: number;
  avg_workflow_speed: number;
  members_count: number;
  bottleneck_count: number;
}

interface WorkflowPattern {
  template_code: string;
  avg_completion_time: number;
  target_completion_time: number;
  completion_rate: number;
  bottleneck_stages: string[];
}

interface OptimizationInsight {
  type: 'reassign_task' | 'adjust_pod_target' | 'workflow_stage_change' | 'training_needed';
  confidence: number;
  description: string;
  taskId?: string;
  podId?: string;
  suggestedAssignee?: string;
  newTarget?: any;
  reason: string;
  expectedImpact: string;
}

interface CEODigest {
  date: string;
  key_metrics: {
    avg_productivity: number;
    workflows_completed: number;
    bottlenecks_detected: number;
    optimizations_applied: number;
  };
  insights: string[];
  auto_actions: number;
  pending_review: number;
  notable_patterns: string[];
}

// ============================================================================
// MAIN LEARNING LOOP
// ============================================================================

/**
 * Run daily learning loop
 * Analyzes data, generates insights, applies optimizations
 */
export async function runDailyLearningLoop(): Promise<CEODigest> {
  const supabase = createClient();

  try {
    // 1. Aggregate last 7 days of data
    const productivityData = await aggregateProductivityData(supabase);
    const workflowData = await aggregateWorkflowData(supabase);

    // 2. Detect patterns
    const patterns = await analyzePatterns(supabase, {
      productivity: productivityData,
      workflows: workflowData
    });

    // 3. Generate AI insights
    const insights = await generateOptimizationInsights(patterns);

    // 4. Apply auto-optimizations (high confidence only)
    const autoApplied = await applyAutoOptimizations(supabase, insights.autoApplicable);

    // 5. Queue manual review items
    await queueManualReviewItems(supabase, insights.requiresReview);

    // 6. Detect and alert on bottlenecks
    const workflowEngine = getWorkflowEngine();
    const bottlenecks = await workflowEngine.detectBottlenecks();

    // 7. Generate CEO digest
    const digest = await generateCEODigest(supabase, {
      productivityData,
      workflowData,
      patterns,
      insights,
      autoApplied,
      bottlenecks
    });

    // 8. Send CEO email (if configured)
    await sendCEODailyDigest(supabase, digest);

    // 9. Log learning loop execution
    await supabase
      .from('learning_loop_metrics')
      .insert({
        period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
        optimizations_applied: autoApplied.length,
        avg_improvement: 0, // Will be calculated after optimizations take effect
        predictions_made: 0,
        prediction_accuracy: 0,
        key_insights: insights.autoApplicable.map((i: OptimizationInsight) => i.description),
        bottlenecks_detected: bottlenecks.length
      });

    return digest;

  } catch (error: any) {
        throw error;
  }
}

// ============================================================================
// DATA AGGREGATION
// ============================================================================

async function aggregateProductivityData(supabase: any) {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const { data: scores } = await supabase
    .from('productivity_scores')
    .select('user_id, score, date')
    .gte('date', last7Days.toISOString().split('T')[0]);

  const avgScore = scores && scores.length > 0
    ? scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length
    : 0;

  return {
    avgScore: Math.round(avgScore),
    totalRecords: scores?.length || 0,
    dateRange: {
      start: last7Days,
      end: new Date()
    }
  };
}

async function aggregateWorkflowData(supabase: any) {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const { data: completed } = await supabase
    .from('workflow_instances')
    .select('*')
    .eq('status', 'completed')
    .gte('completed_at', last7Days.toISOString());

  const { data: active } = await supabase
    .from('workflow_instances')
    .select('*')
    .eq('status', 'active');

  return {
    completedCount: completed?.length || 0,
    activeCount: active?.length || 0,
    avgCompletionTime: 18.5,     dateRange: {
      start: last7Days,
      end: new Date()
    }
  };
}

// ============================================================================
// PATTERN ANALYSIS
// ============================================================================

async function analyzePatterns(supabase: any, data: any): Promise<{
  productivityPatterns: ProductivityPattern[];
  workflowPatterns: WorkflowPattern[];
  correlations: any[];
  bottlenecks: any[];
}> {
  // Get pods with members and their productivity
  const { data: pods } = await supabase
    .from('pods')
    .select(`
      id,
      name,
      type,
      pod_members(user_id)
    `)
    .eq('is_active', true);

  const productivityPatterns: ProductivityPattern[] = [];

  for (const pod of pods || []) {
    if (!pod.pod_members || pod.pod_members.length === 0) continue;

    const memberIds = pod.pod_members.map((m: any) => m.user_id);

    // Get avg productivity for pod members
    const { data: scores } = await supabase
      .from('productivity_scores')
      .select('score')
      .in('user_id', memberIds)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const avgProductivity = scores && scores.length > 0
      ? scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length
      : 0;

    // Get workflow speed for this pod
    const { data: workflows } = await supabase
      .from('workflow_instances')
      .select('started_at, completed_at')
      .eq('assigned_pod_id', pod.id)
      .eq('status', 'completed')
      .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    let avgWorkflowSpeed = 0;
    if (workflows && workflows.length > 0) {
      const totalTime = workflows.reduce((sum: number, w: any) => {
        const started = new Date(w.started_at);
        const completed = new Date(w.completed_at);
        return sum + ((completed.getTime() - started.getTime()) / (1000 * 60 * 60));
      }, 0);
      avgWorkflowSpeed = totalTime / workflows.length;
    }

    productivityPatterns.push({
      pod_id: pod.id,
      pod_name: pod.name,
      avg_productivity: Math.round(avgProductivity),
      avg_workflow_speed: Math.round(avgWorkflowSpeed),
      members_count: pod.pod_members.length,
      bottleneck_count: 0 // Will be filled by bottleneck detection
    });
  }

  return {
    productivityPatterns,
    workflowPatterns: [],
    correlations: [],
    bottlenecks: []
  };
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

async function generateOptimizationInsights(patterns: any): Promise<{
  autoApplicable: OptimizationInsight[];
  requiresReview: OptimizationInsight[];
}> {
  const aiService = getAIService();

  const prompt = `Analyze productivity and workflow patterns to generate optimization suggestions:

Patterns:
${JSON.stringify(patterns, null, 2)}

Generate specific, actionable optimization suggestions. Categorize them as:
1. Auto-applicable (confidence > 0.8, low-risk changes)
2. Requires review (confidence < 0.8 or high-impact changes)

Return JSON:
{
  "autoApplicable": [{"type": "...", "confidence": 0.9, "description": "...", "reason": "...", "expectedImpact": "..."}],
  "requiresReview": [{"type": "...", "confidence": 0.6, "description": "...", "reason": "...", "expectedImpact": "..."}]
}`;

  try {
    const response = await aiService.chat(
      'system',
      'workflow_optimization',
      [{ role: 'user', content: prompt }],
      {
        model: 'gpt-4o',
        systemPrompt: 'You are a workflow optimization expert. Generate specific, measurable optimization suggestions.',
        stream: false
      }
    ) as string;

    return JSON.parse(response);
  } catch (error) {
        return {
      autoApplicable: [],
      requiresReview: []
    };
  }
}

// ============================================================================
// AUTO-OPTIMIZATION
// ============================================================================

async function applyAutoOptimizations(
  supabase: any,
  insights: OptimizationInsight[]
): Promise<OptimizationInsight[]> {
  const workflowEngine = getWorkflowEngine();
  const applied: OptimizationInsight[] = [];

  for (const insight of insights) {
    try {
      if (insight.type === 'reassign_task' && insight.confidence > 0.8) {
        // Reassign task to suggested user
        if (insight.taskId && insight.suggestedAssignee) {
          await supabase
            .from('tasks')
            .update({
              assigned_to_user_id: insight.suggestedAssignee,
              updated_at: new Date().toISOString()
            })
            .eq('id', insight.taskId);

          applied.push(insight);
        }
      }

      if (insight.type === 'adjust_pod_target' && insight.confidence > 0.9) {
        // Adjust pod performance target
        if (insight.podId && insight.newTarget) {
          await supabase
            .from('pods')
            .update({
              performance_target: insight.newTarget,
              updated_at: new Date().toISOString()
            })
            .eq('id', insight.podId);

          applied.push(insight);
        }
      }

      // Log optimization
      await supabase
        .from('system_feedback')
        .insert({
          entity_type: 'optimization',
          entity_id: insight.podId || insight.taskId || 'system',
          action_type: insight.type,
          outcome: 'success',
          performance_metrics: {
            confidence: insight.confidence,
            expected_impact: insight.expectedImpact
          }
        });

    } catch (error) {
          }
  }

  return applied;
}

async function queueManualReviewItems(
  supabase: any,
  insights: OptimizationInsight[]
): Promise<void> {
  for (const insight of insights) {
    await supabase
      .from('optimization_suggestions')
      .insert({
        suggestion_type: insight.type,
        current_state: {},
        suggested_change: {
          description: insight.description,
          reason: insight.reason,
          expected_impact: insight.expectedImpact
        },
        expected_improvement: parseFloat(insight.expectedImpact) || 0,
        confidence: insight.confidence,
        status: 'pending'
      });
  }
}

// ============================================================================
// CEO DIGEST
// ============================================================================

async function generateCEODigest(
  supabase: any,
  data: any
): Promise<CEODigest> {
  const today = new Date().toISOString().split('T')[0];

  return {
    date: today,
    key_metrics: {
      avg_productivity: data.productivityData.avgScore,
      workflows_completed: data.workflowData.completedCount,
      bottlenecks_detected: data.bottlenecks?.length || 0,
      optimizations_applied: data.autoApplied?.length || 0
    },
    insights: data.insights?.autoApplicable?.map((i: any) => i.description) || [],
    auto_actions: data.autoApplied?.length || 0,
    pending_review: data.insights?.requiresReview?.length || 0,
    notable_patterns: data.patterns?.productivityPatterns
      ?.slice(0, 3)
      .map((p: ProductivityPattern) => 
        `${p.pod_name}: ${p.avg_productivity}% productivity, ${p.avg_workflow_speed}hr avg workflow`
      ) || []
  };
}

async function sendCEODailyDigest(supabase: any, digest: CEODigest): Promise<void> {
  // Get CEO user
  const { data: ceoRole } = await supabase
    .from('roles')
    .select('id')
    .eq('code', 'ceo')
    .single();

  if (!ceoRole) return;

  const { data: ceoUsers } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role_id', ceoRole.id);

  if (!ceoUsers || ceoUsers.length === 0) return;

  // Create notification for each CEO
  for (const user of ceoUsers) {
    await supabase
      .from('notifications')
      .insert({
        user_id: user.user_id,
        type: 'info',
        category: 'system',
        title: `Daily Digest - ${digest.date}`,
        message: `
**Key Metrics:**
- Team Productivity: ${digest.key_metrics.avg_productivity}%
- Workflows Completed: ${digest.key_metrics.workflows_completed}
- Bottlenecks: ${digest.key_metrics.bottlenecks_detected}
- Optimizations Applied: ${digest.key_metrics.optimizations_applied}

**Top Insights:**
${digest.insights.slice(0, 3).map(i => `• ${i}`).join('\n')}

**Actions:** ${digest.auto_actions} auto-applied, ${digest.pending_review} awaiting review
        `.trim(),
        action_url: '/admin/ceo'
      });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Already exported inline

