/**
 * TRIKALA PLATFORM ORCHESTRATOR
 * The central nervous system that connects all modules
 * This is what makes it a "living organism"
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cache, cacheKeys } from '@/lib/redis';
import { loggers } from '@/lib/logger';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import { unifiedAIService } from '@/lib/ai/unified-service';

export interface ModuleEvent {
  type: string;
  source: string;
  target: string[];
  payload: any;
}

export class PlatformOrchestrator {
  private static instance: PlatformOrchestrator;
  private supabase = createClient();
  private adminClient = createAdminClient();
  
  private constructor() {
    this.initializeEventListeners();
  }
  
  static getInstance(): PlatformOrchestrator {
    if (!PlatformOrchestrator.instance) {
      PlatformOrchestrator.instance = new PlatformOrchestrator();
    }
    return PlatformOrchestrator.instance;
  }
  
  /**
   * Initialize real-time event listeners for cross-module communication
   */
  private async initializeEventListeners() {
    // Listen for system events
    const channel = this.supabase
      .channel('system_events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'system_events' },
        async (payload) => {
          await this.handleSystemEvent(payload.new);
        }
      )
      .subscribe();
      
    loggers.system.info('Platform Orchestrator initialized - listening for system events');
  }
  
  /**
   * Handle system events and route to appropriate handlers
   */
  private async handleSystemEvent(event: any) {
    loggers.system.info(`Processing event: ${event.event_type} from ${event.source_module}`);
    
    switch (event.event_type) {
      case 'academy_completed':
        await this.handleAcademyCompletion(event);
        break;
      case 'employee_hired':
        await this.handleEmployeeHired(event);
        break;
      case 'candidate_placed':
        await this.handleCandidatePlaced(event);
        break;
      case 'productivity_milestone':
        await this.handleProductivityMilestone(event);
        break;
      case 'workflow_completed':
        await this.handleWorkflowCompleted(event);
        break;
      default:
        loggers.system.warn(`Unhandled event type: ${event.event_type}`);
    }
    
    // Mark event as processed
    await this.markEventProcessed(event.id);
  }
  
  /**
   * INTEGRATION: Academy → HR Pipeline
   * When student completes academy, prepare for HR onboarding
   */
  async handleAcademyCompletion(event: any) {
    const { user_id, product_id, completed_at } = event.payload;
    
    try {
      // 1. Update user role from student to employee candidate
      await this.promoteUserRole(user_id, 'student', 'employee');
      
      // 2. Create HR onboarding record
      const onboarding = await this.createHROnboarding(user_id, {
        academy_completed_at: completed_at,
        product_specialization: product_id,
        status: 'pending_placement'
      });
      
      // 3. Notify HR team
      await this.sendNotification('hr', {
        type: 'new_graduate',
        user_id,
        message: 'New academy graduate ready for placement'
      });
      
      // 4. Start productivity tracking setup
      await this.initializeProductivityTracking(user_id);
      
      // 5. Create placement workflow
      await this.createWorkflow('placement', {
        user_id,
        source: 'academy',
        priority: 'high'
      });
      
      loggers.system.info(`Academy completion handled for user ${user_id}`);
    } catch (error) {
      loggers.system.error('Error handling academy completion:', error);
    }
  }
  
  /**
   * INTEGRATION: HR → Productivity Pipeline
   * When employee is hired, set up productivity tracking
   */
  async handleEmployeeHired(event: any) {
    const { user_id, hire_date, department_id } = event.payload;
    
    try {
      // 1. Create productivity profile
      await this.adminClient
        .from('productivity_profiles')
        .upsert({
          user_id,
          department_id,
          tracking_enabled: true,
          start_date: hire_date
        });
      
      // 2. Set up default productivity goals
      await this.setProductivityGoals(user_id, department_id);
      
      // 3. Initialize AI assistant for employee
      await unifiedAIService.getOrCreateConversation(user_id, 'employee_bot', {
        department_id,
        hire_date
      });
      
      // 4. Create training recommendations
      await this.generateTrainingPlan(user_id, department_id);
      
      loggers.system.info(`Employee onboarding handled for user ${user_id}`);
    } catch (error) {
      loggers.system.error('Error handling employee hire:', error);
    }
  }
  
  /**
   * INTEGRATION: CRM → Academy Pipeline
   * When candidate is placed, enroll in relevant training
   */
  async handleCandidatePlaced(event: any) {
    const { candidate_id, job_id, client_id } = event.payload;
    
    try {
      // 1. Get job requirements
      const { data: job } = await this.adminClient
        .from('jobs')
        .select('*, clients(*)')
        .eq('id', job_id)
        .single();
      
      // 2. Create academy enrollment based on job requirements
      const enrollment = await this.createAcademyEnrollment(candidate_id, {
        product_id: this.mapJobToProduct(job),
        fast_track: true,
        client_specific: true
      });
      
      // 3. Create customized learning path
      await this.createCustomLearningPath(candidate_id, job.requirements);
      
      loggers.system.info(`Candidate placement handled for ${candidate_id}`);
    } catch (error) {
      loggers.system.error('Error handling candidate placement:', error);
    }
  }
  
  /**
   * INTEGRATION: Productivity → AI Insights
   * Generate insights when productivity milestones are reached
   */
  async handleProductivityMilestone(event: any) {
    const { user_id, milestone_type, metrics } = event.payload;
    
    try {
      // 1. Generate AI insights
      const insights = await aiOrchestrator.route({
        useCase: 'productivity',
        prompt: `Analyze productivity milestone: ${milestone_type}`,
        context: { user_id, metrics }
      });
      
      // 2. Store insights
      await this.storeInsights(user_id, insights);
      
      // 3. Update user achievements
      await this.updateAchievements(user_id, milestone_type);
      
      // 4. Trigger gamification rewards
      await this.awardPoints(user_id, milestone_type);
      
      loggers.system.info(`Productivity milestone handled for user ${user_id}`);
    } catch (error) {
      loggers.system.error('Error handling productivity milestone:', error);
    }
  }
  
  /**
   * CEO DASHBOARD: Aggregate all metrics
   */
  async getCEODashboardData() {
    const [
      academyMetrics,
      hrMetrics,
      productivityMetrics,
      crmMetrics,
      workflowMetrics,
      revenueMetrics
    ] = await Promise.all([
      this.getAcademyMetrics(),
      this.getHRMetrics(),
      this.getProductivityMetrics(),
      this.getCRMMetrics(),
      this.getWorkflowMetrics(),
      this.getRevenueMetrics()
    ]);
    
    // Generate AI insights on the aggregated data
    const aiInsights = await aiOrchestrator.route({
      useCase: 'ceo_insights',
      prompt: 'Generate executive summary and strategic recommendations',
      context: {
        academyMetrics,
        hrMetrics,
        productivityMetrics,
        crmMetrics,
        workflowMetrics,
        revenueMetrics
      }
    });
    
    return {
      timestamp: new Date(),
      metrics: {
        academy: academyMetrics,
        hr: hrMetrics,
        productivity: productivityMetrics,
        crm: crmMetrics,
        workflow: workflowMetrics,
        revenue: revenueMetrics
      },
      insights: aiInsights.content,
      recommendations: this.generateStrategicRecommendations(aiInsights)
    };
  }
  
  /**
   * UNIFIED USER OPERATIONS
   */
  async getUserCompleteProfile(userId: string) {
    // Check cache first
    const cached = await cache.get(`user:complete:${userId}`);
    if (cached) return cached;
    
    // Get from database function
    const { data, error } = await this.adminClient
      .rpc('get_user_complete_profile', { p_user_id: userId });
    
    if (error) {
      loggers.system.error('Error getting user profile:', error);
      return null;
    }
    
    // Cache for 5 minutes
    await cache.set(`user:complete:${userId}`, data, 300);
    
    return data;
  }
  
  /**
   * Helper methods
   */
  private async promoteUserRole(userId: string, fromRole: string, toRole: string) {
    const { data: roles } = await this.adminClient
      .from('roles')
      .select('id, code')
      .in('code', [fromRole, toRole]);
    
    const fromRoleId = roles?.find(r => r.code === fromRole)?.id;
    const toRoleId = roles?.find(r => r.code === toRole)?.id;
    
    if (fromRoleId && toRoleId) {
      // Remove old role
      await this.adminClient
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', fromRoleId);
      
      // Add new role
      await this.adminClient
        .from('user_roles')
        .insert({ user_id: userId, role_id: toRoleId });
    }
  }
  
  private async createHROnboarding(userId: string, details: any) {
    return await this.adminClient
      .from('hr_onboarding')
      .insert({
        user_id: userId,
        ...details,
        created_at: new Date()
      })
      .select()
      .single();
  }
  
  private async initializeProductivityTracking(userId: string) {
    return await this.adminClient
      .from('productivity_settings')
      .insert({
        user_id: userId,
        tracking_enabled: true,
        screenshot_interval: 600, // 10 minutes
        created_at: new Date()
      });
  }
  
  private async createWorkflow(type: string, params: any) {
    return await this.adminClient
      .from('workflow_instances')
      .insert({
        template_id: await this.getWorkflowTemplateId(type),
        object_type: type,
        object_id: params.user_id,
        status: 'active',
        metadata: params
      });
  }
  
  private async sendNotification(target: string, notification: any) {
    return await this.adminClient
      .from('notifications')
      .insert({
        target_role: target,
        ...notification,
        created_at: new Date()
      });
  }
  
  private async setProductivityGoals(userId: string, departmentId: string) {
    const defaultGoals = {
      daily_active_hours: 6,
      weekly_productivity_score: 75,
      monthly_improvement_target: 5
    };
    
    return await this.adminClient
      .from('productivity_goals')
      .insert({
        user_id: userId,
        department_id: departmentId,
        goals: defaultGoals,
        created_at: new Date()
      });
  }
  
  private async generateTrainingPlan(userId: string, departmentId: string) {
    // Use AI to generate personalized training plan
    const plan = await aiOrchestrator.route({
      useCase: 'mentor',
      prompt: 'Generate training plan for new employee',
      context: { userId, departmentId }
    });
    
    return await this.adminClient
      .from('training_plans')
      .insert({
        user_id: userId,
        plan: plan.content,
        created_at: new Date()
      });
  }
  
  private mapJobToProduct(job: any): string {
    // Map job requirements to Guidewire product
    if (job.title?.includes('Claim')) return 'CC';
    if (job.title?.includes('Policy')) return 'PC';
    if (job.title?.includes('Billing')) return 'BC';
    return 'COMMON';
  }
  
  private async createAcademyEnrollment(userId: string, params: any) {
    return await this.adminClient
      .from('academy_enrollments')
      .insert({
        user_id: userId,
        ...params,
        created_at: new Date()
      });
  }
  
  private async createCustomLearningPath(userId: string, requirements: any) {
    const path = await aiOrchestrator.route({
      useCase: 'mentor',
      prompt: 'Create custom learning path based on job requirements',
      context: { userId, requirements }
    });
    
    return await this.adminClient
      .from('learning_paths')
      .insert({
        user_id: userId,
        path: path.content,
        created_at: new Date()
      });
  }
  
  private async handleWorkflowCompleted(event: any) {
    const { workflow_id, result } = event.payload;
    
    // Update workflow status
    await this.adminClient
      .from('workflow_instances')
      .update({
        status: 'completed',
        completed_at: new Date(),
        result
      })
      .eq('id', workflow_id);
  }
  
  private async storeInsights(userId: string, insights: any) {
    return await this.adminClient
      .from('ai_insights')
      .insert({
        user_id: userId,
        insights,
        created_at: new Date()
      });
  }
  
  private async updateAchievements(userId: string, achievement: string) {
    return await this.adminClient
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_type: achievement,
        achieved_at: new Date()
      });
  }
  
  private async awardPoints(userId: string, achievement: string) {
    const points = this.calculatePoints(achievement);
    
    return await this.adminClient
      .rpc('award_points', {
        p_user_id: userId,
        p_points: points,
        p_reason: achievement
      });
  }
  
  private calculatePoints(achievement: string): number {
    const pointsMap: Record<string, number> = {
      'productivity_streak': 50,
      'perfect_week': 100,
      'milestone_reached': 75,
      'goal_achieved': 60
    };
    return pointsMap[achievement] || 25;
  }
  
  private async markEventProcessed(eventId: string) {
    return await this.adminClient
      .from('system_events')
      .update({
        status: 'processed',
        processed_at: new Date(),
        processed_by: ['platform_orchestrator']
      })
      .eq('id', eventId);
  }
  
  private async getWorkflowTemplateId(type: string): Promise<string> {
    const { data } = await this.adminClient
      .from('workflow_templates')
      .select('id')
      .eq('code', type)
      .single();
    
    return data?.id || '';
  }
  
  /**
   * Metrics aggregation methods
   */
  private async getAcademyMetrics() {
    const { data } = await this.adminClient
      .from('topic_completions')
      .select('*, topics(*), user_profiles(*)')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return {
      active_students: new Set(data?.map(d => d.user_id)).size || 0,
      completions_30d: data?.length || 0,
      avg_time_per_topic: data?.reduce((acc, d) => acc + d.time_spent_minutes, 0) / (data?.length || 1),
      popular_topics: this.getTopItems(data?.map(d => d.topics?.title) || [], 5)
    };
  }
  
  private async getHRMetrics() {
    const { data: employees } = await this.adminClient
      .from('user_profiles')
      .select('*')
      .not('employee_id', 'is', null);
    
    return {
      total_employees: employees?.length || 0,
      active_employees: employees?.filter(e => e.employment_status === 'active').length || 0,
      new_hires_30d: employees?.filter(e => 
        new Date(e.hire_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length || 0,
      departments: new Set(employees?.map(e => e.department_id)).size || 0
    };
  }
  
  private async getProductivityMetrics() {
    const { data } = await this.adminClient
      .from('productivity_scores')
      .select('*')
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return {
      avg_productivity_score: data?.reduce((acc, d) => acc + d.overall_score, 0) / (data?.length || 1),
      total_tracked_hours: data?.reduce((acc, d) => acc + (d.active_time_score || 0), 0) / 60,
      productivity_trend: this.calculateTrend(data?.map(d => ({ date: d.date, value: d.overall_score })) || [])
    };
  }
  
  private async getCRMMetrics() {
    const [candidates, jobs, placements] = await Promise.all([
      this.adminClient.from('candidates').select('*', { count: 'exact' }),
      this.adminClient.from('jobs').select('*').eq('status', 'active'),
      this.adminClient.from('placements').select('*').gte('start_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    ]);
    
    return {
      total_candidates: candidates.count || 0,
      active_jobs: jobs.data?.length || 0,
      placements_30d: placements.data?.length || 0,
      placement_rate: (placements.data?.length || 0) / (candidates.count || 1) * 100
    };
  }
  
  private async getWorkflowMetrics() {
    const { data } = await this.adminClient
      .from('workflow_instances')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return {
      active_workflows: data?.filter(w => w.status === 'active').length || 0,
      completed_workflows: data?.filter(w => w.status === 'completed').length || 0,
      avg_completion_time: this.calculateAvgCompletionTime(data || []),
      bottlenecks: this.identifyBottlenecks(data || [])
    };
  }
  
  private async getRevenueMetrics() {
    const { data: placements } = await this.adminClient
      .from('placements')
      .select('*')
      .gte('start_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const monthlyRevenue = placements?.reduce((acc, p) => {
      const margin = (p.bill_rate - p.pay_rate) * 160; // Monthly hours
      return acc + margin;
    }, 0) || 0;
    
    return {
      monthly_revenue: monthlyRevenue,
      avg_margin: placements?.reduce((acc, p) => acc + (p.bill_rate - p.pay_rate), 0) / (placements?.length || 1),
      revenue_per_placement: monthlyRevenue / (placements?.length || 1),
      projected_annual: monthlyRevenue * 12
    };
  }
  
  private generateStrategicRecommendations(insights: any): string[] {
    const recommendations = [];
    
    // Parse AI insights and generate actionable recommendations
    if (insights.content.includes('productivity')) {
      recommendations.push('Focus on productivity improvements in underperforming departments');
    }
    if (insights.content.includes('training')) {
      recommendations.push('Expand training programs to address skill gaps');
    }
    if (insights.content.includes('placement')) {
      recommendations.push('Optimize placement process to reduce time-to-fill');
    }
    
    return recommendations;
  }
  
  private getTopItems(items: string[], limit: number): string[] {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item);
  }
  
  private calculateTrend(data: Array<{ date: string; value: number }>): string {
    if (data.length < 2) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((acc, d) => acc + d.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, d) => acc + d.value, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.1) return 'improving';
    if (secondAvg < firstAvg * 0.9) return 'declining';
    return 'stable';
  }
  
  private calculateAvgCompletionTime(workflows: any[]): number {
    const completed = workflows.filter(w => w.completed_at);
    if (completed.length === 0) return 0;
    
    const totalTime = completed.reduce((acc, w) => {
      const start = new Date(w.started_at).getTime();
      const end = new Date(w.completed_at).getTime();
      return acc + (end - start);
    }, 0);
    
    return totalTime / completed.length / (1000 * 60 * 60); // Convert to hours
  }
  
  private identifyBottlenecks(workflows: any[]): string[] {
    const stuckWorkflows = workflows.filter(w => 
      w.status === 'active' && 
      new Date(w.started_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    const stages = stuckWorkflows.map(w => w.current_stage_id);
    const stageCounts = stages.reduce((acc, stage) => {
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(stageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([stage]) => stage);
  }
}

export const platformOrchestrator = PlatformOrchestrator.getInstance();
