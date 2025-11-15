/**
 * CRM → WORKFLOW ENGINE INTEGRATION
 * Job Handler - Automatic workflow orchestration for recruiting
 * 
 * When job is created:
 * - Starts recruiting workflow
 * - AI-powered pod assignment
 * - Creates initial tasks
 * - Notifies pod members
 * - Begins AI auto-matching
 * 
 * Transforms manual recruiting into orchestrated, automated process
 */

import { createClient } from '@/lib/supabase/server';
import { getWorkflowEngine } from '@/lib/workflows/engine';
import { getAIService } from '@/lib/ai/unified-service';

// ============================================================================
// TYPES
// ============================================================================

interface JobCreationResult {
  workflow: any;
  pod: any;
  tasks: any[];
  success: boolean;
  message: string;
}

interface PodScore {
  pod_id: string;
  pod_name: string;
  pod_type: string;
  score: number;
  reasons: string[];
}

// ============================================================================
// JOB CREATION HANDLER
// ============================================================================

/**
 * Handle job creation and start recruiting workflow
 */
export async function onJobCreated(
  jobId: string,
  createdBy: string
): Promise<JobCreationResult> {
  const supabase = createClient();
  const workflowEngine = getWorkflowEngine();

  try {
    // 1. Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, clients(name)')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error('Job not found');
    }

    // 2. Start recruiting workflow
    const workflow = await workflowEngine.startWorkflow({
      templateCode: 'standard_recruiting',
      objectType: 'job',
      objectId: jobId,
      name: `Recruiting: ${job.title} - ${job.clients?.name || 'Client'}`,
      ownerId: createdBy
    });

    // 3. AI-powered pod assignment
    const pod = await findBestPodForJob(supabase, job);

    if (pod) {
      await workflowEngine.assignToPod(workflow.id, pod.id);
    }

    // 4. Create initial tasks
    const tasks = await createInitialTasks(supabase, {
      workflowId: workflow.id,
      jobId: jobId,
      podId: pod?.id,
      requiredSubmissions: job.required_submissions || 5,
      deadline: job.deadline
    });

    // 5. Notify pod members
    if (pod) {
      await notifyPodMembers(supabase, pod.id, {
        type: 'new_job_assignment',
        title: 'New Job Assignment',
        message: `New job: ${job.title} - ${job.clients?.name || 'Client'}`,
        priority: job.priority || 'medium',
        actionUrl: `/employee/jobs/${jobId}`,
        jobId: jobId
      });
    }

    // 6. Start AI auto-matching (async)
    startAutoMatching(supabase, {
      jobId: jobId,
      podId: pod?.id,
      requiredSkills: job.required_skills || []
    }).catch(err => {
      console.error('Auto-matching error:', err);
    });

    // 7. Log for learning system
    await supabase
      .from('system_feedback')
      .insert({
        entity_type: 'job',
        entity_id: jobId,
        action_type: 'job_created_workflow_started',
        outcome: 'success',
        performance_metrics: {
          workflow_id: workflow.id,
          pod_id: pod?.id,
          pod_name: pod?.name
        }
      });

    return {
      workflow,
      pod,
      tasks,
      success: true,
      message: `Workflow started for job: ${job.title}`
    };

  } catch (error: any) {
        
    // Log failure
    await supabase
      .from('system_feedback')
      .insert({
        entity_type: 'job',
        entity_id: jobId,
        action_type: 'job_created_workflow_started',
        outcome: 'failure',
        performance_metrics: {
          error: error.message
        }
      });

    return {
      workflow: null,
      pod: null,
      tasks: [],
      success: false,
      message: `Failed to start workflow: ${error.message}`
    };
  }
}

// ============================================================================
// APPLICATION STATUS CHANGE HANDLER
// ============================================================================

/**
 * Handle application status changes and advance workflow accordingly
 */
export async function onApplicationStatusChange(
  applicationId: string,
  newStatus: string,
  changedBy: string
): Promise<void> {
  const supabase = createClient();
  const workflowEngine = getWorkflowEngine();

  try {
    // Get application and related job
    const { data: application } = await supabase
      .from('applications')
      .select('*, jobs(*)')
      .eq('id', applicationId)
      .single();

    if (!application) {
      throw new Error('Application not found');
    }

    // Get workflow instance for this job
    const { data: workflow } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('object_type', 'job')
      .eq('object_id', application.job_id)
      .single();

    if (!workflow) {
            return;
    }

    // Map application status to workflow stage
    const stageMapping: Record<string, string> = {
      'sourced': 'sourcing',
      'screened': 'screening',
      'submitted': 'submission',
      'client_review': 'client_review',
      'client_interview_scheduled': 'interview_scheduling',
      'interviewing': 'interviewing',
      'offer_extended': 'offer',
      'offer_accepted': 'onboarding',
      'placed': 'placed'
    };

    const targetStage = stageMapping[newStatus];

    if (targetStage && workflow.current_stage_id !== targetStage) {
      // Advance workflow
      await workflowEngine.advanceStage({
        instanceId: workflow.id,
        toStageId: targetStage,
        userId: changedBy,
        reason: `Application status changed to: ${newStatus}`,
        stageData: {
          application_id: applicationId,
          status: newStatus
        }
      });
    }

    // Check SLA
    const slaOk = await workflowEngine.checkSLA(workflow.id);
    
    if (!slaOk) {
      // Send alert to manager
      await supabase
        .from('notifications')
        .insert({
          user_id: workflow.owner_id,
          type: 'warning',
          category: 'workflow',
          title: 'SLA At Risk',
          message: `Job "${application.jobs?.title}" is approaching SLA deadline`,
          related_entity_type: 'job',
          related_entity_id: application.job_id,
          action_url: `/employee/jobs/${application.job_id}`
        });
    }

  } catch (error: any) {
      }
}

// ============================================================================
// POD MATCHING (AI-POWERED)
// ============================================================================

/**
 * Find best pod for job using AI scoring
 */
async function findBestPodForJob(supabase: any, job: any): Promise<any | null> {
  // Get all active recruiting pods
  const { data: pods } = await supabase
    .from('pods')
    .select('*')
    .in('type', ['recruiting', 'bench_sales', 'sourcing'])
    .eq('is_active', true);

  if (!pods || pods.length === 0) {
        return null;
  }

  // Score each pod
  const scores: PodScore[] = await Promise.all(
    pods.map(async (pod: any) => {
      const score = await calculatePodFitScore(supabase, pod, job);
      return score;
    })
  );

  // Sort by score (descending)
  scores.sort((a, b) => b.score - a.score);

  // Log AI decision
  await supabase
    .from('system_feedback')
    .insert({
      entity_type: 'job',
      entity_id: job.id,
      action_type: 'ai_pod_assignment',
      outcome: 'success',
      performance_metrics: {
        selected_pod: scores[0].pod_name,
        selected_score: scores[0].score,
        alternatives: scores.slice(1, 3)
      }
    });

  // Return best pod
  return pods.find((p: any) => p.id === scores[0].pod_id);
}

/**
 * Calculate how well a pod fits a job
 */
async function calculatePodFitScore(
  supabase: any,
  pod: any,
  job: any
): Promise<PodScore> {
  let score = 50; // Base score
  const reasons: string[] = [];

  // Factor 1: Historical performance for similar jobs (40 points max)
  const { data: completedJobs } = await supabase
    .from('workflow_instances')
    .select('*')
    .eq('assigned_pod_id', pod.id)
    .eq('object_type', 'job')
    .eq('status', 'completed')
    .limit(20);

  if (completedJobs && completedJobs.length > 0) {
    // Calculate success rate and speed
    const avgCompletionTime = completedJobs.reduce((sum: number, w: any) => {
      const started = new Date(w.started_at);
      const completed = new Date(w.completed_at);
      return sum + ((completed.getTime() - started.getTime()) / (1000 * 60 * 60 * 24));
    }, 0) / completedJobs.length;

    // Better performance = higher score
    if (avgCompletionTime < 15) {
      score += 40;
      reasons.push('Excellent historical performance (avg 15 days)');
    } else if (avgCompletionTime < 21) {
      score += 30;
      reasons.push('Good historical performance (avg 21 days)');
    } else {
      score += 20;
      reasons.push('Moderate historical performance');
    }
  } else {
    score += 20; // Neutral score for new pods
    reasons.push('New pod - no historical data');
  }

  // Factor 2: Current workload (30 points max)
  const { count: activeWorkflows } = await supabase
    .from('workflow_instances')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_pod_id', pod.id)
    .eq('status', 'active');

  const workloadPenalty = Math.min(30, (activeWorkflows || 0) * 3);
  score -= workloadPenalty;
  
  if (workloadPenalty > 20) {
    reasons.push(`High workload (${activeWorkflows} active jobs)`);
  } else {
    reasons.push(`Manageable workload (${activeWorkflows} active jobs)`);
  }

  // Factor 3: Overdue workflows (20 points penalty max)
  const { count: overdueCount } = await supabase
    .from('workflow_instances')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_pod_id', pod.id)
    .eq('is_overdue', true);

  const overduePenalty = Math.min(20, (overdueCount || 0) * 10);
  score -= overduePenalty;

  if (overdueCount && overdueCount > 0) {
    reasons.push(`${overdueCount} overdue workflows`);
  }

  // Factor 4: Pod type match (10 points bonus)
  if (pod.type === 'recruiting' || pod.type === 'sourcing') {
    score += 10;
    reasons.push('Pod type matches job requirement');
  }

  // Ensure score is in valid range
  score = Math.max(0, Math.min(100, score));

  return {
    pod_id: pod.id,
    pod_name: pod.name,
    pod_type: pod.type,
    score,
    reasons
  };
}

// ============================================================================
// TASK CREATION
// ============================================================================

/**
 * Create initial tasks for new job workflow
 */
async function createInitialTasks(
  supabase: any,
  params: {
    workflowId: string;
    jobId: string;
    podId?: string;
    requiredSubmissions: number;
    deadline?: string;
  }
): Promise<any[]> {
  const tasks = [];

  // Task 1: Sourcing
  const sourcingDueDate = new Date();
  sourcingDueDate.setDate(sourcingDueDate.getDate() + 3);

  const { data: sourcingTask } = await supabase
    .from('tasks')
    .insert({
      workflow_instance_id: params.workflowId,
      title: `Source ${params.requiredSubmissions} candidates`,
      description: `Find and add ${params.requiredSubmissions} qualified candidates to this job`,
      task_type: 'sourcing',
      assigned_to_pod_id: params.podId,
      status: 'pending',
      priority: 'high',
      due_date: sourcingDueDate.toISOString()
    })
    .select()
    .single();

  if (sourcingTask) tasks.push(sourcingTask);

  // Task 2: Initial screening
  const screeningDueDate = new Date();
  screeningDueDate.setDate(screeningDueDate.getDate() + 5);

  const { data: screeningTask } = await supabase
    .from('tasks')
    .insert({
      workflow_instance_id: params.workflowId,
      title: 'Screen sourced candidates',
      description: 'Conduct initial phone screens with sourced candidates',
      task_type: 'screening',
      assigned_to_pod_id: params.podId,
      status: 'pending',
      priority: 'medium',
      due_date: screeningDueDate.toISOString()
    })
    .select()
    .single();

  if (screeningTask) tasks.push(screeningTask);

  return tasks;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Notify pod members of new job assignment
 */
async function notifyPodMembers(
  supabase: any,
  podId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    priority: string;
    actionUrl: string;
    jobId: string;
  }
): Promise<void> {
  // Get all active pod members
  const { data: members } = await supabase
    .from('pod_members')
    .select('user_id')
    .eq('pod_id', podId)
    .eq('is_active', true);

  if (!members || members.length === 0) {
        return;
  }

  // Create notifications
  const notifications = members.map((member: any) => ({
    user_id: member.user_id,
    type: notification.priority === 'urgent' ? 'warning' : 'info',
    category: 'workflow',
    title: notification.title,
    message: notification.message,
    related_entity_type: 'job',
    related_entity_id: notification.jobId,
    action_url: notification.actionUrl
  }));

  await supabase
    .from('notifications')
    .insert(notifications);
}

// ============================================================================
// AI AUTO-MATCHING
// ============================================================================

/**
 * Start AI-powered candidate matching for job
 */
async function startAutoMatching(
  supabase: any,
  params: {
    jobId: string;
    podId?: string;
    requiredSkills: string[];
  }
): Promise<void> {
  // Get all active candidates
  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .eq('status', 'active')
    .limit(100);

  if (!candidates || candidates.length === 0) {
        return;
  }

  // Get job details
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.jobId)
    .single();

  if (!job) return;

  // Score each candidate
  const aiService = getAIService();
  
  const prompt = `Match candidates to job requirement:

Job: ${job.title}
Required Skills: ${params.requiredSkills.join(', ')}
Experience: ${job.required_experience || 0} years

Candidates:
${candidates.slice(0, 20).map((c: any) => `- ${c.first_name} ${c.last_name}: ${c.current_title}, Skills: ${c.skills?.join(', ') || 'N/A'}`).join('\n')}

Rank top 5 candidates by fit (1-5, with brief reason for each). Return JSON:
[{"candidate_id": "...", "rank": 1, "reason": "..."}]`;

  try {
    const response = await aiService.chat(
      'system',
      'workflow_optimization',
      [{ role: 'user', content: prompt }],
      {
        model: 'gpt-4o',
        systemPrompt: 'You are a recruiting AI that matches candidates to jobs. Be objective and skills-focused.',
        stream: false
      }
    ) as string;

    const matches = JSON.parse(response);

    // Log matches for recruiter review
    for (const match of matches.slice(0, 5)) {
      await supabase
        .from('system_feedback')
        .insert({
          entity_type: 'job',
          entity_id: params.jobId,
          action_type: 'ai_candidate_match',
          outcome: 'success',
          performance_metrics: {
            candidate_id: match.candidate_id,
            rank: match.rank,
            reason: match.reason
          }
        });
    }

  } catch (error) {
      }
}

