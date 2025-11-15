import { createClient } from '@/lib/supabase/server';
import { cache, cacheKeys } from '@/lib/redis';
import { AIUseCase } from './orchestrator';

// Context types
export interface UserContext {
  userId: string;
  name?: string;
  role?: string;
  preferences?: Record<string, any>;
  history?: any[];
}

export interface TopicContext {
  topicId: string;
  title: string;
  description?: string;
  prerequisites?: string[];
  completionStatus?: number;
}

export interface JobContext {
  jobId: string;
  title: string;
  requirements?: string[];
  clientName?: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface ProductivityContext {
  sessionId: string;
  duration?: number;
  activityLevel?: number;
  applications?: string[];
  patterns?: any[];
}

// Context Manager
export class AIContextManager {
  // Build context based on use case
  async buildContext(
    useCase: AIUseCase,
    params: Record<string, any>
  ): Promise<Record<string, any>> {
    switch (useCase) {
      case 'mentor':
        return this.buildMentorContext(params);
      case 'guru':
        return this.buildGuruContext(params);
      case 'recruiter':
        return this.buildRecruiterContext(params);
      case 'productivity':
        return this.buildProductivityContext(params);
      case 'ceo_insights':
        return this.buildCEOContext(params);
      case 'interview_bot':
        return this.buildInterviewContext(params);
      case 'employee_bot':
        return this.buildEmployeeContext(params);
      default:
        return params;
    }
  }

  // Mentor context - learning specific
  private async buildMentorContext(params: any) {
    const supabase = await createClient();
    const context: any = { ...params };

    // Get user's learning profile
    if (params.userId) {
      const cached = await cache.get(cacheKeys.userProfile(params.userId));
      if (cached) {
        context.learningProfile = cached;
      } else {
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', params.userId)
          .single();
        
        if (profile) {
          context.learningProfile = profile;
          await cache.set(cacheKeys.userProfile(params.userId), profile, 3600);
        }
      }

      // Get progress
      const { data: progress } = await supabase
        .from('topic_completions')
        .select('topic_id, progress_percentage, completed_at')
        .eq('user_id', params.userId)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      context.recentProgress = progress;

      // Get struggle patterns
      const { data: struggles } = await supabase
        .from('learning_struggles')
        .select('*')
        .eq('user_id', params.userId)
        .eq('resolved', false);
      
      context.currentStruggles = struggles;
    }

    // Get topic context
    if (params.topicId) {
      const { data: topic } = await supabase
        .from('topics')
        .select(`
          *,
          topic_content_items(*)
        `)
        .eq('id', params.topicId)
        .single();
      
      context.currentTopic = topic;

      // Get prerequisites completion
      if (topic?.prerequisites?.length) {
        const { data: prereqCompletions } = await supabase
          .from('topic_completions')
          .select('topic_id, completed_at')
          .eq('user_id', params.userId)
          .in('topic_id', topic.prerequisites);
        
        context.prerequisiteStatus = prereqCompletions;
      }
    }

    return context;
  }

  // Guru context - technical expertise
  private async buildGuruContext(params: any) {
    const supabase = await createClient();
    const context: any = { ...params };

    // Get product context
    if (params.productId) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.productId)
        .single();
      
      context.product = product;
    }

    // Get user's expertise level
    if (params.userId) {
      const { data: completions } = await supabase
        .from('topic_completions')
        .select('topic_id')
        .eq('user_id', params.userId)
        .eq('completed_at', 'not null');
      
      context.completedTopics = completions?.length || 0;
      context.expertiseLevel = this.calculateExpertiseLevel(completions?.length || 0);
    }

    // Get related documentation
    if (params.question) {
      // In production, this would search vector embeddings
      context.relevantDocs = await this.searchDocumentation(params.question);
    }

    return context;
  }

  // Recruiter context - job and candidate info
  private async buildRecruiterContext(params: any) {
    const supabase = await createClient();
    const context: any = { ...params };

    // Get job details
    if (params.jobId) {
      const { data: job } = await supabase
        .from('jobs')
        .select(`
          *,
          clients(name, industry)
        `)
        .eq('id', params.jobId)
        .single();
      
      context.job = job;

      // Get similar successful placements
      if (job) {
        const { data: placements } = await supabase
          .from('placements')
          .select(`
            *,
            applications(candidate_id, candidates(*))
          `)
          .eq('job_type', job.job_type)
          .eq('status', 'active')
          .limit(5);
        
        context.successfulPlacements = placements;
      }
    }

    // Get candidate details
    if (params.candidateId) {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', params.candidateId)
        .single();
      
      context.candidate = candidate;

      // Get candidate's application history
      const { data: applications } = await supabase
        .from('applications')
        .select(`
          *,
          jobs(title, client_id)
        `)
        .eq('candidate_id', params.candidateId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      context.applicationHistory = applications;
    }

    // Market conditions
    context.marketConditions = await this.getMarketConditions(params.location, params.skills);

    return context;
  }

  // Productivity context - activity analysis
  private async buildProductivityContext(params: any) {
    const supabase = await createClient();
    const context: any = { ...params };

    // Get user's role and baseline
    if (params.userId) {
      const { data: employee } = await supabase
        .from('employee_records')
        .select('role, department_id')
        .eq('user_id', params.userId)
        .single();
      
      context.employeeRole = employee;

      // Get team baseline
      if (employee?.department_id) {
        const { data: baseline } = await supabase
          .from('productivity_baselines')
          .select('*')
          .eq('department_id', employee.department_id)
          .eq('role', employee.role)
          .single();
        
        context.baseline = baseline;
      }
    }

    // Get recent patterns
    const { data: patterns } = await supabase
      .from('productivity_patterns')
      .select('*')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    context.recentPatterns = patterns;

    // Get context summaries
    const summaries = await Promise.all([
      cache.get(cacheKeys.productivitySummary(params.userId, '1hour')),
      cache.get(cacheKeys.productivitySummary(params.userId, '1day')),
      cache.get(cacheKeys.productivitySummary(params.userId, '1week')),
    ]);

    context.summaries = {
      hourly: summaries[0],
      daily: summaries[1],
      weekly: summaries[2],
    };

    return context;
  }

  // CEO context - cross-functional data
  private async buildCEOContext(params: any) {
    const supabase = await createClient();
    const context: any = { ...params };

    // Get key metrics
    const [
      revenue,
      placements,
      productivity,
      training,
      pipeline,
    ] = await Promise.all([
      this.getRevenueMetrics(),
      this.getPlacementMetrics(),
      this.getProductivityMetrics(),
      this.getTrainingMetrics(),
      this.getPipelineMetrics(),
    ]);

    context.metrics = {
      revenue,
      placements,
      productivity,
      training,
      pipeline,
    };

    // Get alerts and anomalies
    const { data: alerts } = await supabase
      .from('system_alerts')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: true });
    
    context.activeAlerts = alerts;

    // Get predictions
    const { data: predictions } = await supabase
      .from('ml_predictions')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('confidence', { ascending: false });
    
    context.predictions = predictions;

    return context;
  }

  // Interview context - candidate evaluation
  private async buildInterviewContext(params: any) {
    const context: any = { ...params };

    // Get job requirements
    if (params.jobId) {
      const supabase = await createClient();
      const { data: job } = await supabase
        .from('jobs')
        .select('title, requirements, skills_required')
        .eq('id', params.jobId)
        .single();
      
      context.jobRequirements = job;
    }

    // Get interview rubric
    if (params.level) {
      context.rubric = this.getInterviewRubric(params.level);
    }

    // Get question bank
    if (params.skills) {
      context.questionBank = await this.getQuestionBank(params.skills, params.level);
    }

    return context;
  }

  // Employee context - company info
  private async buildEmployeeContext(params: any) {
    const supabase = await createClient();
    const context: any = { ...params };

    // Get employee info
    if (params.userId) {
      const { data: employee } = await supabase
        .from('employee_records')
        .select(`
          *,
          departments(name),
          user_profiles(first_name, last_name)
        `)
        .eq('user_id', params.userId)
        .single();
      
      context.employee = employee;
    }

    // Get relevant policies
    if (params.query) {
      const policies = await this.searchPolicies(params.query);
      context.relevantPolicies = policies;
    }

    // Get FAQ
    const { data: faq } = await supabase
      .from('employee_faq')
      .select('question, answer')
      .order('view_count', { ascending: false })
      .limit(10);
    
    context.commonQuestions = faq;

    return context;
  }

  // Helper methods
  private calculateExpertiseLevel(completedTopics: number): string {
    if (completedTopics >= 50) return 'expert';
    if (completedTopics >= 30) return 'advanced';
    if (completedTopics >= 15) return 'intermediate';
    if (completedTopics >= 5) return 'beginner';
    return 'novice';
  }

  private async searchDocumentation(query: string): Promise<any[]> {
    // In production, use vector search
    return [];
  }

  private async getMarketConditions(location?: string, skills?: string[]): Promise<any> {
    // Would fetch from external APIs or cached data
    return {
      averageRate: 75,
      demand: 'high',
      supply: 'medium',
      trend: 'increasing',
    };
  }

  private async getRevenueMetrics(): Promise<any> {
    // Aggregate revenue data
    const supabase = await createClient();
    // Implementation would aggregate from placements, invoices, etc.
    return {
      mtd: 450000,
      qtd: 1200000,
      ytd: 3500000,
      growth: 15,
    };
  }

  private async getPlacementMetrics(): Promise<any> {
    // Aggregate placement data
    return {
      active: 45,
      thisMonth: 12,
      avgTimeToFill: 18,
      successRate: 0.73,
    };
  }

  private async getProductivityMetrics(): Promise<any> {
    // Aggregate productivity data
    return {
      avgScore: 78,
      trend: 'improving',
      topPerformers: 15,
      needsAttention: 3,
    };
  }

  private async getTrainingMetrics(): Promise<any> {
    // Aggregate training data
    return {
      activeStudents: 127,
      completionRate: 0.68,
      avgTimeToComplete: 45,
      placementRate: 0.72,
    };
  }

  private async getPipelineMetrics(): Promise<any> {
    // Aggregate pipeline data
    return {
      openJobs: 34,
      activeCandidates: 289,
      interviewsScheduled: 45,
      offersExtended: 8,
    };
  }

  private getInterviewRubric(level: string): any {
    // Return evaluation criteria based on level
    const rubrics = {
      junior: {
        technical: 0.4,
        problemSolving: 0.3,
        communication: 0.2,
        potential: 0.1,
      },
      mid: {
        technical: 0.5,
        problemSolving: 0.25,
        communication: 0.15,
        leadership: 0.1,
      },
      senior: {
        technical: 0.4,
        problemSolving: 0.2,
        communication: 0.2,
        leadership: 0.2,
      },
    };
    return rubrics[level] || rubrics.mid;
  }

  private async getQuestionBank(skills: string[], level: string): Promise<any[]> {
    // Would fetch from question database
    return [
      {
        skill: skills[0],
        questions: [
          'Explain the concept...',
          'How would you implement...',
          'What are the trade-offs...',
        ],
      },
    ];
  }

  private async searchPolicies(query: string): Promise<any[]> {
    // Would search policy documents
    return [
      {
        title: 'Leave Policy',
        relevance: 0.95,
        summary: 'Annual leave entitlement and procedures...',
      },
    ];
  }
}

// Export singleton
export const aiContextManager = new AIContextManager();
