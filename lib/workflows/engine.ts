/**
 * WORKFLOW ENGINE
 * Orchestrates all processes across the platform
 * 
 * Powers:
 * - Recruiting workflows (job → placement)
 * - Employee onboarding
 * - Approval chains (leave, expenses)
 * - Bench sales processes
 * - Training progressions
 * 
 * Features:
 * - Template-based workflow definitions
 * - Stage-based progression
 * - SLA tracking and alerts
 * - Bottleneck detection
 * - Auto-assignment to pods
 * - History logging
 * - Real-time metrics
 */

import { createClient } from '@/lib/supabase/server';
import { getAIService } from '@/lib/ai/unified-service';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: 'recruiting' | 'onboarding' | 'approval_chain' | 'bench_sales' | 'custom';
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
  sla_config?: SLAConfig;
  is_active: boolean;
  is_system: boolean;
}

export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  is_initial?: boolean;
  is_final?: boolean;
  required_actions?: string[];
  auto_advance_conditions?: any;
}

export interface WorkflowTransition {
  from_stage_id: string;
  to_stage_id: string;
  condition?: string;
  required_role?: string;
}

export interface SLAConfig {
  total_duration_hours?: number;
  stage_durations?: Record<string, number>;
  alert_threshold_percentage?: number; // Alert when X% of SLA time consumed
}

export interface WorkflowInstance {
  id: string;
  template_id: string;
  name: string;
  object_type: string;
  object_id: string;
  current_stage_id: string;
  status: 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  assigned_pod_id?: string;
  owner_id?: string;
  context_data: any;
  stages_completed: number;
  total_stages: number;
  completion_percentage: number;
  sla_deadline?: Date;
  is_overdue: boolean;
  started_at: Date;
  completed_at?: Date;
}

export interface StartWorkflowParams {
  templateCode: string;
  objectType: string;
  objectId: string;
  name?: string;
  assignedPodId?: string;
  ownerId?: string;
  contextData?: any;
}

export interface AdvanceStageParams {
  instanceId: string;
  toStageId: string;
  userId: string;
  reason?: string;
  stageData?: any;
}

export interface BottleneckAlert {
  id: string;
  workflow_instance_id: string;
  pod_id?: string;
  stuck_stage_id: string;
  stuck_duration: number; // milliseconds
  severity: 'low' | 'medium' | 'high' | 'critical';
  ai_suggestion?: string;
  ai_confidence?: number;
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed';
}

// ============================================================================
// WORKFLOW ENGINE CLASS
// ============================================================================

export class WorkflowEngine {
  private supabase = createClient();

  // ==========================================================================
  // WORKFLOW INSTANCE MANAGEMENT
  // ==========================================================================

  /**
   * Start a new workflow instance
   */
  async startWorkflow(params: StartWorkflowParams): Promise<WorkflowInstance> {
    // Get template
    const template = await this.getTemplate(params.templateCode);
    
    if (!template) {
      throw new Error(`Workflow template not found: ${params.templateCode}`);
    }

    if (!template.is_active) {
      throw new Error(`Workflow template is inactive: ${params.templateCode}`);
    }

    // Find initial stage
    const initialStage = template.stages.find(s => s.is_initial) || template.stages[0];
    
    if (!initialStage) {
      throw new Error(`No initial stage found for template: ${params.templateCode}`);
    }

    // Calculate SLA deadline
    const slaDeadline = this.calculateSLADeadline(template.sla_config);

    // Create instance
    const { data: instance, error } = await this.supabase
      .from('workflow_instances')
      .insert({
        template_id: template.id,
        name: params.name || `${template.name} - ${params.objectId}`,
        object_type: params.objectType,
        object_id: params.objectId,
        current_stage_id: initialStage.id,
        status: 'active',
        assigned_pod_id: params.assignedPodId,
        owner_id: params.ownerId,
        context_data: params.contextData || {},
        stages_completed: 0,
        total_stages: template.stages.length,
        completion_percentage: 0,
        sla_deadline: slaDeadline,
        is_overdue: false,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create workflow instance: ${error.message}`);
    }

    // Log initial stage entry
    await this.logStageHistory({
      instance_id: instance.id,
      from_stage_id: null,
      to_stage_id: initialStage.id,
      transitioned_by: params.ownerId,
      transition_reason: 'Workflow started'
    });

    // Execute stage actions (async)
    this.executeStageActions(instance.id, initialStage.id)
      .catch(err => console.error('Error executing stage actions:', err));

    return instance as WorkflowInstance;
  }

  /**
   * Advance workflow to next stage
   */
  async advanceStage(params: AdvanceStageParams): Promise<WorkflowInstance> {
    // Get current instance
    const instance = await this.getInstance(params.instanceId);
    
    if (!instance) {
      throw new Error(`Workflow instance not found: ${params.instanceId}`);
    }

    if (instance.status !== 'active') {
      throw new Error(`Cannot advance inactive workflow: ${instance.status}`);
    }

    // Get template
    const template = await this.getTemplateById(instance.template_id);
    
    if (!template) {
      throw new Error(`Template not found for instance: ${params.instanceId}`);
    }

    // Validate transition
    const isValid = await this.canTransition(
      template,
      instance.current_stage_id,
      params.toStageId
    );
    if (!isValid) {
      throw new Error(`Invalid transition: ${instance.current_stage_id} → ${params.toStageId}`);
    }

    // Get target stage
    const targetStage = template.stages.find(s => s.id === params.toStageId);
    
    if (!targetStage) {
      throw new Error(`Target stage not found: ${params.toStageId}`);
    }

    // Calculate new completion percentage
    const stagesCompleted = instance.stages_completed + 1;
    const completionPercentage = Math.round((stagesCompleted / template.stages.length) * 100);

    // Update instance
    const { data: updated, error } = await this.supabase
      .from('workflow_instances')
      .update({
        current_stage_id: params.toStageId,
        stages_completed: stagesCompleted,
        completion_percentage: completionPercentage,
        updated_at: new Date().toISOString(),
        ...(targetStage.is_final ? {
          status: 'completed',
          completed_at: new Date().toISOString()
        } : {})
      })
      .eq('id', params.instanceId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to advance workflow: ${error.message}`);
    }

    // Log stage transition
    await this.logStageHistory({
      instance_id: params.instanceId,
      from_stage_id: instance.current_stage_id,
      to_stage_id: params.toStageId,
      transitioned_by: params.userId,
      transition_reason: params.reason,
      stage_data: params.stageData
    });

    // Execute stage actions (async)
    this.executeStageActions(params.instanceId, params.toStageId)
      .catch(err => console.error('Error executing stage actions:', err));

    // Check SLA status
    this.checkSLA(params.instanceId)
      .catch(err => console.error('Error checking SLA:', err));

    return updated as WorkflowInstance;
  }

  /**
   * Pause workflow instance
   */
  async pauseWorkflow(instanceId: string, userId: string, reason?: string): Promise<void> {
    const { error } = await this.supabase
      .from('workflow_instances')
      .update({
        status: 'paused',
        paused_at: new Date().toISOString()
      })
      .eq('id', instanceId);

    if (error) {
      throw new Error(`Failed to pause workflow: ${error.message}`);
    }

    // Log event
    await this.logSystemEvent(instanceId, 'workflow_paused', {
      paused_by: userId,
      reason
    });
  }

  /**
   * Resume paused workflow
   */
  async resumeWorkflow(instanceId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('workflow_instances')
      .update({
        status: 'active',
        paused_at: null
      })
      .eq('id', instanceId);

    if (error) {
      throw new Error(`Failed to resume workflow: ${error.message}`);
    }

    // Log event
    await this.logSystemEvent(instanceId, 'workflow_resumed', {
      resumed_by: userId
    });
  }

  /**
   * Cancel workflow
   */
  async cancelWorkflow(instanceId: string, userId: string, reason?: string): Promise<void> {
    const { error } = await this.supabase
      .from('workflow_instances')
      .update({
        status: 'cancelled'
      })
      .eq('id', instanceId);

    if (error) {
      throw new Error(`Failed to cancel workflow: ${error.message}`);
    }

    // Log event
    await this.logSystemEvent(instanceId, 'workflow_cancelled', {
      cancelled_by: userId,
      reason
    });
  }

  // ==========================================================================
  // POD ASSIGNMENT
  // ==========================================================================

  /**
   * Assign workflow to pod
   */
  async assignToPod(instanceId: string, podId: string): Promise<void> {
    const { error } = await this.supabase
      .from('workflow_instances')
      .update({ assigned_pod_id: podId })
      .eq('id', instanceId);

    if (error) {
      throw new Error(`Failed to assign workflow to pod: ${error.message}`);
    }

    // Notify pod members (async)
    this.notifyPodMembers(podId, instanceId)
      .catch(err => console.error('Error executing wait action:', err));
  }

  /**
   * AI-powered pod assignment based on historical performance
   */
  async assignToBestPod(
    instanceId: string,
    objectType: string,
    objectData: any
  ): Promise<string> {
    // Get all active pods
    const { data: pods } = await this.supabase
      .from('pods')
      .select('*')
      .eq('is_active', true);

    if (!pods || pods.length === 0) {
      throw new Error('No active pods available');
    }

    // Score each pod based on historical performance
    const scores = await Promise.all(
      pods.map(async (pod) => {
        const performance = await this.getPodPerformance(pod.id, objectType);
        const workload = await this.getPodWorkload(pod.id);
        
        return {
          pod_id: pod.id,
          pod_name: pod.name,
          score: this.calculatePodFitScore(pod, performance, workload, objectData)
        };
      })
    );
    
    // Sort by score (descending)
    scores.sort((a, b) => b.score - a.score);
    
    const bestPod = scores[0];
    
    // Assign to best pod
    await this.assignToPod(instanceId, bestPod.pod_id);
    
    // Log decision
    await this.logSystemEvent(instanceId, 'ai_pod_assignment', {
      assigned_pod: bestPod.pod_name,
      score: bestPod.score,
      alternatives: scores.slice(1, 3)
    });

    return bestPod.pod_id;
  }

  // ==========================================================================
  // SLA TRACKING & BOTTLENECK DETECTION
  // ==========================================================================

  /**
   * Check SLA status for workflow instance
   */
  async checkSLA(instanceId: string): Promise<boolean> {
    const instance = await this.getInstance(instanceId);
    
    if (!instance || !instance.sla_deadline) {
      return true; // No SLA defined
    }

    const now = new Date();
    const deadline = new Date(instance.sla_deadline);
    const isOverdue = now > deadline;

    // Update overdue flag if changed
    if (isOverdue !== instance.is_overdue) {
      await this.supabase
        .from('workflow_instances')
        .update({ is_overdue: isOverdue })
        .eq('id', instanceId);

      if (isOverdue) {
        // Create alert
        await this.createSLAAlert(instanceId);
      }
    }

    return !isOverdue;
  }

  /**
   * Detect bottlenecks across all active workflows
   */
  async detectBottlenecks(podId?: string): Promise<BottleneckAlert[]> {
    // Find workflows stuck in same stage for > 48 hours
    const { data: stuckInstances } = await this.supabase
      .rpc('find_stuck_workflows', {
        threshold_hours: 48,
        pod_filter: podId
      });

    if (!stuckInstances || stuckInstances.length === 0) {
      return [];
    }

    const alerts: BottleneckAlert[] = [];

    for (const stuck of stuckInstances) {
      // Check if alert already exists
      const { data: existing } = await this.supabase
        .from('bottleneck_alerts')
        .select('id')
        .eq('workflow_instance_id', stuck.id)
        .eq('status', 'open')
        .single();

      if (existing) {
        continue; // Alert already exists
      }

      // Calculate severity based on how long it's stuck
      const stuckHours = stuck.stuck_duration_hours;
      const severity = 
        stuckHours > 120 ? 'critical' :
        stuckHours > 96 ? 'high' :
        stuckHours > 72 ? 'medium' : 'low';

      // Generate AI suggestion
      const aiSuggestion = await this.generateBottleneckSuggestion(stuck);

      // Create alert
      const { data: alert, error } = await this.supabase
        .from('bottleneck_alerts')
        .insert({
          workflow_instance_id: stuck.id,
          pod_id: stuck.pod_id,
          stuck_stage_id: stuck.current_stage_id,
          stuck_duration: `${stuckHours} hours`,
          severity,
          ai_suggestion: aiSuggestion.suggestion,
          ai_confidence: aiSuggestion.confidence,
          status: 'open'
        })
        .select()
        .single();

      if (!error && alert) {
        alerts.push(alert as BottleneckAlert);
      }
    }

    return alerts;
  }

  /**
   * Generate AI-powered suggestion for resolving bottleneck
   */
  private async generateBottleneckSuggestion(stuckWorkflow: any): Promise<{
    suggestion: string;
    confidence: number;
  }> {
    const aiService = getAIService();
    
    const prompt = `
Workflow bottleneck detected:
- Workflow: ${stuckWorkflow.name}
- Stuck in stage: ${stuckWorkflow.current_stage_id}
- Duration: ${stuckWorkflow.stuck_duration_hours} hours
- Assigned pod: ${stuckWorkflow.pod_name || 'Unassigned'}

Analyze this bottleneck and suggest a specific action to resolve it.
Consider: resource allocation, task reassignment, process optimization.
Be concise and actionable.
`;

    try {
      const response = await aiService.chat(
        'system',
        'workflow_optimization',
        [{ role: 'user', content: prompt }],
        {
          model: 'gpt-4o',
          systemPrompt: 'You are a workflow optimization expert. Provide specific, actionable suggestions to resolve workflow bottlenecks.',
          stream: false
        }
      );
      
      return {
        suggestion: response as string,
        confidence: 0.75
      };
    } catch (error) {
      return {
        suggestion: 'Manual review recommended. Workflow has been stuck for an extended period.',
        confidence: 0.5
      };
    }
  }

  // ==========================================================================
  // TEMPLATE MANAGEMENT
  // ==========================================================================

  private async getTemplate(code: string): Promise<WorkflowTemplate | null> {
    const { data, error } = await this.supabase
      .from('workflow_templates')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) return null;
    
    return data as WorkflowTemplate;
  }

  private async getTemplateById(id: string): Promise<WorkflowTemplate | null> {
    const { data, error } = await this.supabase
      .from('workflow_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    
    return data as WorkflowTemplate;
  }

  async getInstance(instanceId: string): Promise<WorkflowInstance | null> {
    const { data, error } = await this.supabase
      .from('workflow_instances')
      .select('*')
      .eq('id', instanceId)
      .single();

    if (error || !data) return null;
    
    return data as WorkflowInstance;
  }

  // ==========================================================================
  // WORKFLOW METRICS & ANALYTICS
  // ==========================================================================

  /**
   * Get workflow metrics for a specific instance
   */
  async getWorkflowMetrics(instanceId: string): Promise<{
    time_to_fill: number; // hours
    stages_completed: number;
    total_stages: number;
    current_stage_duration: number; // hours
    avg_stage_duration: number; // hours
    is_overdue: boolean;
  }> {
    const instance = await this.getInstance(instanceId);
    
    if (!instance) {
      throw new Error(`Workflow instance not found: ${instanceId}`);
    }

    // Get stage history
    const { data: history } = await this.supabase
      .from('workflow_stage_history')
      .select('*')
      .eq('instance_id', instanceId)
      .order('created_at', { ascending: true });

    const now = new Date();
    const startedAt = new Date(instance.started_at);
    const timeToFill = (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60); // hours

    // Calculate current stage duration
    const lastTransition = history && history.length > 0 ? history[history.length - 1] : null;
    const currentStageStart = lastTransition 
      ? new Date(lastTransition.created_at)
      : startedAt;
    const currentStageDuration = (now.getTime() - currentStageStart.getTime()) / (1000 * 60 * 60);

    // Calculate average stage duration
    let totalStageDuration = 0;
    if (history && history.length > 0) {
      for (const transition of history) {
        if (transition.duration_in_stage) {
          // Parse interval to hours
          const match = transition.duration_in_stage.match(/(\d+):(\d+):(\d+)/);
          if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            totalStageDuration += hours + (minutes / 60);
          }
        }
      }
    }
    const avgStageDuration = history && history.length > 0 
      ? totalStageDuration / history.length
      : 0;

    return {
      time_to_fill: timeToFill,
      stages_completed: instance.stages_completed,
      total_stages: instance.total_stages,
      current_stage_duration: currentStageDuration,
      avg_stage_duration: avgStageDuration,
      is_overdue: instance.is_overdue
    };
  }

  /**
   * Get pod performance metrics
   */
  private async getPodPerformance(podId: string, objectType: string): Promise<{
    avg_completion_time: number;
    success_rate: number;
    total_completed: number;
  }> {
    // Get completed workflows for this pod and object type
    const { data: completed } = await this.supabase
      .from('workflow_instances')
      .select('*')
      .eq('assigned_pod_id', podId)
      .eq('object_type', objectType)
      .eq('status', 'completed')
      .limit(50)
      .order('completed_at', { ascending: false });

    if (!completed || completed.length === 0) {
      return {
        avg_completion_time: 0,
        success_rate: 0,
        total_completed: 0
      };
    }

    // Calculate average completion time
    let totalTime = 0;
    for (const instance of completed) {
      const started = new Date(instance.started_at);
      const completed_time = new Date(instance.completed_at);
      totalTime += (completed_time.getTime() - started.getTime()) / (1000 * 60 * 60);
    }

    return {
      avg_completion_time: totalTime / completed.length,
      success_rate: 100, // All completed workflows are successful
      total_completed: completed.length
    };
  }

  /**
   * Get current pod workload
   */
  private async getPodWorkload(podId: string): Promise<{
    active_workflows: number;
    overdue_workflows: number;
    avg_completion_percentage: number;
  }> {
    const { data: active } = await this.supabase
      .from('workflow_instances')
      .select('*')
      .eq('assigned_pod_id', podId)
      .eq('status', 'active');

    if (!active || active.length === 0) {
      return {
        active_workflows: 0,
        overdue_workflows: 0,
        avg_completion_percentage: 0
      };
    }

    const overdueCount = active.filter(w => w.is_overdue).length;
    const totalCompletion = active.reduce((sum, w) => sum + w.completion_percentage, 0);

    return {
      active_workflows: active.length,
      overdue_workflows: overdueCount,
      avg_completion_percentage: totalCompletion / active.length
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private calculateSLADeadline(slaConfig?: SLAConfig): Date | null {
    if (!slaConfig || !slaConfig.total_duration_hours) {
      return null;
    }

    const now = new Date();
    now.setHours(now.getHours() + slaConfig.total_duration_hours);
    return now;
  }

  private async canTransition(
    template: WorkflowTemplate,
    fromStageId: string,
    toStageId: string
  ): Promise<boolean> {
    // Check if transition exists in template
    const transition = template.transitions.find(
      t => t.from_stage_id === fromStageId && t.to_stage_id === toStageId
    );
    
    // If no explicit transition defined, check if stages are sequential
    if (!transition) {
      const fromStage = template.stages.find(s => s.id === fromStageId);
      const toStage = template.stages.find(s => s.id === toStageId);
      
      if (!fromStage || !toStage) return false;
      
      // Allow moving to next sequential stage
      return toStage.order === fromStage.order + 1;
    }

    return true;
  }

  private async logStageHistory(params: {
    instance_id: string;
    from_stage_id: string | null;
    to_stage_id: string;
    transitioned_by?: string;
    transition_reason?: string;
    stage_data?: any;
  }): Promise<void> {
    await this.supabase
      .from('workflow_stage_history')
      .insert(params);
  }

  private async executeStageActions(instanceId: string, stageId: string): Promise<void> {
    // Placeholder for stage-specific actions
    // Examples: send notifications, create tasks, trigger integrations
      }

  private async logSystemEvent(instanceId: string, eventType: string, data: any): Promise<void> {
    await this.supabase
      .from('system_feedback')
      .insert({
        entity_type: 'workflow',
        entity_id: instanceId,
        action_type: eventType,
        outcome: 'success',
        performance_metrics: data
      });
  }

  private async notifyPodMembers(podId: string, instanceId: string): Promise<void> {
    // Get pod members
    const { data: members } = await this.supabase
      .from('pod_members')
      .select('user_id')
      .eq('pod_id', podId)
      .eq('is_active', true);

    if (!members) return;

    // Create notifications
    const instance = await this.getInstance(instanceId);
    
    for (const member of members) {
      await this.supabase
        .from('notifications')
        .insert({
          user_id: member.user_id,
          type: 'info',
          category: 'workflow',
          title: 'New Workflow Assignment',
          message: `New workflow assigned to your pod: ${instance?.name}`,
          related_entity_type: 'workflow',
          related_entity_id: instanceId,
          action_url: `/platform/workflows/${instanceId}`
        });
    }
  }

  private async createSLAAlert(instanceId: string): Promise<void> {
    const instance = await this.getInstance(instanceId);
    
    if (!instance) return;

    // Notify owner
    if (instance.owner_id) {
      await this.supabase
        .from('notifications')
        .insert({
          user_id: instance.owner_id,
          type: 'warning',
          category: 'workflow',
          title: 'Workflow SLA Exceeded',
          message: `Workflow "${instance.name}" has exceeded its SLA deadline`,
          related_entity_type: 'workflow',
          related_entity_id: instanceId,
          action_url: `/platform/workflows/${instanceId}`
        });
    }
  }

  private calculatePodFitScore(
    pod: any,
    performance: any,
    workload: any,
    objectData: any
  ): number {
    let score = 50; // Base score

    // Factor 1: Historical performance (40 points max)
    if (performance.total_completed > 0) {
      // Better completion time = higher score
      const timeScore = Math.max(0, 40 - (performance.avg_completion_time / 10));
      score += timeScore;
    } else {
      // New pod gets neutral score
      score += 20;
    }

    // Factor 2: Current workload (30 points max)
    const workloadPenalty = Math.min(30, workload.active_workflows * 3);
    score -= workloadPenalty;

    // Factor 3: Overdue workflows (20 points penalty max)
    const overduePenalty = Math.min(20, workload.overdue_workflows * 10);
    score -= overduePenalty;

    // Factor 4: Type match (10 points bonus)
    if (objectData && pod.type) {
      // Bonus for matching pod type
      const typeMatch = objectData.type === pod.type;
      if (typeMatch) score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let workflowEngineInstance: WorkflowEngine | null = null;

export function getWorkflowEngine(): WorkflowEngine {
  if (!workflowEngineInstance) {
    workflowEngineInstance = new WorkflowEngine();
  }
  return workflowEngineInstance;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function startRecruitingWorkflow(
  jobId: string,
  createdBy: string,
  podId?: string
): Promise<WorkflowInstance> {
  const engine = getWorkflowEngine();
  return engine.startWorkflow({
    templateCode: 'standard_recruiting',
    objectType: 'job',
    objectId: jobId,
    ownerId: createdBy,
    assignedPodId: podId
  });
}

export async function startOnboardingWorkflow(
  employeeId: string,
  createdBy: string
): Promise<WorkflowInstance> {
  const engine = getWorkflowEngine();
  return engine.startWorkflow({
    templateCode: 'employee_onboarding',
    objectType: 'employee',
    objectId: employeeId,
    ownerId: createdBy
  });
}

export async function startApprovalWorkflow(
  objectType: 'leave_request' | 'expense_claim',
  objectId: string,
  submittedBy: string
): Promise<WorkflowInstance> {
  const engine = getWorkflowEngine();
  return engine.startWorkflow({
    templateCode: 'approval_chain',
    objectType,
    objectId,
    ownerId: submittedBy
  });
}

