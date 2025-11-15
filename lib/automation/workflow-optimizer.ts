/**
 * AUTOMATED WORKFLOW OPTIMIZER
 * Self-learning system that continuously improves workflows
 * 
 * Features:
 * - Analyzes completed workflows
 * - Identifies inefficiencies
 * - Generates AI-powered solutions
 * - Auto-applies safe optimizations
 * - Queues risky changes for CEO review
 * 
 * Runs: Weekly via cron job
 */

import { createClient } from '@/lib/supabase/server';
import { getAIService } from '@/lib/ai/unified-service';

// ============================================================================
// TYPES
// ============================================================================

interface WorkflowAnalysis {
  template_code: string;
  template_name: string;
  total_completed: number;
  avg_duration_hours: number;
  target_duration_hours: number;
  stage_metrics: StageMetrics[];
  bottleneck_stages: string[];
}

interface StageMetrics {
  stage_id: string;
  stage_name: string;
  avg_duration_hours: number;
  target_duration_hours: number;
  instances_count: number;
  variance: number;
}

interface OptimizationSolution {
  type: 'workflow_change' | 'routing_optimization' | 'target_adjustment' | 'automation_opportunity';
  confidence: number;
  description: string;
  current_state: any;
  suggested_change: any;
  expected_improvement: number; // percentage
  risk_level: 'low' | 'medium' | 'high';
  auto_apply: boolean;
}

// ============================================================================
// MAIN OPTIMIZER
// ============================================================================

/**
 * Analyze and optimize all workflows
 */
export async function optimizeWorkflows(): Promise<{
  analyzed: number;
  optimizations: OptimizationSolution[];
  applied: number;
  queued: number;
}> {
  const supabase = createClient();

  // Get last 50 completed workflows
  const { data: completedWorkflows } = await supabase
    .from('workflow_instances')
    .select('*')
    .eq('status', 'completed')
    .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('completed_at', { ascending: false })
    .limit(50);

  if (!completedWorkflows || completedWorkflows.length === 0) {
    return {
      analyzed: 0,
      optimizations: [],
      applied: 0,
      queued: 0
    };
  }

  // Group by template
  const byTemplate = new Map<string, any[]>();
  for (const workflow of completedWorkflows) {
    const key = workflow.template_id;
    if (!byTemplate.has(key)) {
      byTemplate.set(key, []);
    }
    byTemplate.get(key)!.push(workflow);
  }

  // Analyze each template
  const analyses: WorkflowAnalysis[] = [];
  for (const [templateId, workflows] of byTemplate) {
    const analysis = await analyzeWorkflowTemplate(supabase, templateId, workflows);
    if (analysis) {
      analyses.push(analysis);
    }
  }

  // Generate optimization solutions using AI
  const solutions = await generateOptimizationSolutions(analyses);

  // Apply safe optimizations
  const applied: OptimizationSolution[] = [];
  const queued: OptimizationSolution[] = [];

  for (const solution of solutions) {
    if (solution.auto_apply && solution.confidence > 0.8 && solution.risk_level === 'low') {
      await applyOptimization(supabase, solution);
      applied.push(solution);
    } else {
      await queueOptimization(supabase, solution);
      queued.push(solution);
    }
  }

  return {
    analyzed: completedWorkflows.length,
    optimizations: solutions,
    applied: applied.length,
    queued: queued.length
  };
}

// ============================================================================
// WORKFLOW ANALYSIS
// ============================================================================

async function analyzeWorkflowTemplate(
  supabase: any,
  templateId: string,
  workflows: any[]
): Promise<WorkflowAnalysis | null> {
  // Get template
  const { data: template } = await supabase
    .from('workflow_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (!template) return null;

  // Calculate average duration
  let totalDuration = 0;
  for (const workflow of workflows) {
    const started = new Date(workflow.started_at);
    const completed = new Date(workflow.completed_at);
    totalDuration += (completed.getTime() - started.getTime()) / (1000 * 60 * 60);
  }
  const avgDuration = totalDuration / workflows.length;

  // Get target duration from SLA config
  const targetDuration = template.sla_config?.total_duration_hours || avgDuration * 0.8;

  // Analyze stage performance
  const stageMetrics = await analyzeStagePerformance(supabase, workflows);

  // Identify bottleneck stages (>20% over target)
  const bottleneckStages = stageMetrics
    .filter(s => s.avg_duration_hours > s.target_duration_hours * 1.2)
    .map(s => s.stage_id);

  return {
    template_code: template.code,
    template_name: template.name,
    total_completed: workflows.length,
    avg_duration_hours: avgDuration,
    target_duration_hours: targetDuration,
    stage_metrics: stageMetrics,
    bottleneck_stages: bottleneckStages
  };
}

async function analyzeStagePerformance(
  supabase: any,
  workflows: any[]
): Promise<StageMetrics[]> {
  const stageMap = new Map<string, number[]>();

  // Get stage history for all workflows
  for (const workflow of workflows) {
    const { data: history } = await supabase
      .from('workflow_stage_history')
      .select('*')
      .eq('instance_id', workflow.id)
      .order('created_at', { ascending: true });

    if (!history) continue;

    for (const entry of history) {
      if (!entry.duration_in_stage) continue;

      // Parse interval
      const match = entry.duration_in_stage.match(/(\d+):(\d+):(\d+)/);
      if (match) {
        const hours = parseInt(match[1]) + parseInt(match[2]) / 60;
        
        if (!stageMap.has(entry.from_stage_id)) {
          stageMap.set(entry.from_stage_id, []);
        }
        stageMap.get(entry.from_stage_id)!.push(hours);
      }
    }
  }

  // Calculate metrics for each stage
  const metrics: StageMetrics[] = [];
  for (const [stageId, durations] of stageMap) {
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = calculateVariance(durations, avg);
    const target = avg * 0.8; // Target is 80% of average

    metrics.push({
      stage_id: stageId,
      stage_name: stageId,
      avg_duration_hours: avg,
      target_duration_hours: target,
      instances_count: durations.length,
      variance
    });
  }

  return metrics;
}

function calculateVariance(values: number[], mean: number): number {
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
}

// ============================================================================
// AI-POWERED OPTIMIZATION
// ============================================================================

async function generateOptimizationSolutions(
  analyses: WorkflowAnalysis[]
): Promise<OptimizationSolution[]> {
  const aiService = getAIService();

  const prompt = `Analyze workflow performance data and generate optimization solutions:

${JSON.stringify(analyses, null, 2)}

For each bottleneck or inefficiency, suggest specific optimizations. Consider:
- Process automation opportunities
- Resource reallocation
- Target adjustments
- Stage elimination or combination

Return JSON array of solutions:
[{
  "type": "workflow_change|routing_optimization|target_adjustment|automation_opportunity",
  "confidence": 0-1,
  "description": "...",
  "current_state": {},
  "suggested_change": {},
  "expected_improvement": 0-100,
  "risk_level": "low|medium|high",
  "auto_apply": true/false
}]`;

  try {
    const response = await aiService.chat(
      'system',
      'workflow_optimization',
      [{ role: 'user', content: prompt }],
      {
        model: 'gpt-4o',
        systemPrompt: 'You are a workflow optimization expert. Generate specific, measurable optimization suggestions with realistic confidence scores.',
        stream: false
      }
    ) as string;

    return JSON.parse(response);
  } catch (error) {
        return [];
  }
}

// ============================================================================
// OPTIMIZATION APPLICATION
// ============================================================================

async function applyOptimization(
  supabase: any,
  solution: OptimizationSolution
): Promise<void> {
  // Log the optimization
  await supabase
    .from('system_feedback')
    .insert({
      entity_type: 'optimization',
      entity_id: 'system',
      action_type: solution.type,
      outcome: 'success',
      performance_metrics: {
        confidence: solution.confidence,
        expected_improvement: solution.expected_improvement,
        description: solution.description
      }
    });

  // Apply based on type
  switch (solution.type) {
    case 'target_adjustment':
      // Adjust targets automatically
      if (solution.suggested_change.pod_id) {
        await supabase
          .from('pods')
          .update({
            performance_target: solution.suggested_change.new_target
          })
          .eq('id', solution.suggested_change.pod_id);
      }
      break;

    case 'routing_optimization':
      // Update routing rules (if applicable)
      break;

    case 'automation_opportunity':
      // Flag for development team
      break;

    default:
        }
}

async function queueOptimization(
  supabase: any,
  solution: OptimizationSolution
): Promise<void> {
  await supabase
    .from('optimization_suggestions')
    .insert({
      suggestion_type: solution.type,
      current_state: solution.current_state,
      suggested_change: solution.suggested_change,
      expected_improvement: solution.expected_improvement,
      confidence: solution.confidence,
      status: 'pending'
    });
}

