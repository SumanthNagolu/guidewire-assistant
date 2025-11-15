import { createClient } from '@/lib/supabase/server';
import { loggers } from '@/lib/logger';
import { cache } from '@/lib/redis';

// Event types
export interface SystemEvent {
  id?: string;
  type: string;
  source: string;
  data: Record<string, any>;
  timestamp: Date;
  processed?: boolean;
  processedBy?: string[];
}

// Event handler type
export type EventHandler = (event: SystemEvent) => Promise<void>;

// Event Bus Implementation
export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private asyncHandlers: Map<string, Set<EventHandler>> = new Map();

  private constructor() {
    this.initializeHandlers();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  // Initialize default handlers
  private initializeHandlers() {
    // User events
    this.on('user:created', this.handleUserCreated.bind(this));
    this.on('user:updated', this.handleUserUpdated.bind(this));
    this.on('user:role_assigned', this.handleRoleAssigned.bind(this));

    // Learning events
    this.on('topic:completed', this.handleTopicCompleted.bind(this));
    this.on('course:completed', this.handleCourseCompleted.bind(this));
    
    // Job events
    this.on('job:created', this.handleJobCreated.bind(this));
    this.on('application:submitted', this.handleApplicationSubmitted.bind(this));
    this.on('placement:created', this.handlePlacementCreated.bind(this));

    // Productivity events
    this.on('productivity:session_ended', this.handleProductivitySessionEnded.bind(this));
    
    // System events
    this.on('alert:triggered', this.handleAlertTriggered.bind(this));
  }

  // Register event handler
  on(eventType: string, handler: EventHandler, async: boolean = false): void {
    const handlers = async ? this.asyncHandlers : this.handlers;
    
    if (!handlers.has(eventType)) {
      handlers.set(eventType, new Set());
    }
    
    handlers.get(eventType)!.add(handler);
  }

  // Unregister event handler
  off(eventType: string, handler: EventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
    this.asyncHandlers.get(eventType)?.delete(handler);
  }

  // Emit event
  async emit(
    eventType: string,
    data: Record<string, any>,
    source?: string
  ): Promise<void> {
    const event: SystemEvent = {
      type: eventType,
      source: source || 'system',
      data,
      timestamp: new Date(),
      processed: false,
      processedBy: [],
    };

    // Store event
    await this.storeEvent(event);

    // Process synchronous handlers
    const syncHandlers = this.handlers.get(eventType);
    if (syncHandlers) {
      for (const handler of syncHandlers) {
        try {
          await handler(event);
          event.processedBy?.push(handler.name || 'anonymous');
        } catch (error) {
          loggers.system.error('Event handler error', {
            eventType,
            handler: handler.name,
            error,
          });
        }
      }
    }

    // Queue async handlers
    const asyncHandlers = this.asyncHandlers.get(eventType);
    if (asyncHandlers) {
      for (const handler of asyncHandlers) {
        this.queueAsyncHandler(event, handler);
      }
    }

    // Update event status
    await this.updateEventStatus(event);

    // Log event
    loggers.system.info('Event emitted', {
      type: eventType,
      source: event.source,
      handlersExecuted: event.processedBy?.length || 0,
    });
  }

  // Store event in database
  private async storeEvent(event: SystemEvent): Promise<void> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('system_events')
      .insert({
        event_type: event.type,
        source_module: event.source,
        payload: event.data,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && data) {
      event.id = data.id;
    }
  }

  // Update event status
  private async updateEventStatus(event: SystemEvent): Promise<void> {
    if (!event.id) return;

    const supabase = await createClient();

    await supabase
      .from('system_events')
      .update({
        status: 'completed',
        processed_by: event.processedBy,
        processed_at: new Date().toISOString(),
      })
      .eq('id', event.id);
  }

  // Queue async handler for background processing
  private async queueAsyncHandler(event: SystemEvent, handler: EventHandler): Promise<void> {
    // In production, this would use a proper queue (Bull, SQS, etc.)
    // For now, using setTimeout for demonstration
    setTimeout(async () => {
      try {
        await handler(event);
        loggers.system.info('Async handler completed', {
          eventType: event.type,
          handler: handler.name,
        });
      } catch (error) {
        loggers.system.error('Async handler error', {
          eventType: event.type,
          handler: handler.name,
          error,
        });
      }
    }, 0);
  }

  // Default event handlers
  private async handleUserCreated(event: SystemEvent): Promise<void> {
    const { userId, email, role } = event.data;

    // Send welcome email
    await this.emit('email:send', {
      to: email,
      template: 'welcome',
      data: { userId, role },
    }, 'event_bus');

    // Create initial notifications
    await this.emit('notification:create', {
      userId,
      type: 'welcome',
      message: 'Welcome to IntimeSolutions!',
    }, 'event_bus');

    // If student, enroll in orientation
    if (role === 'student') {
      await this.emit('enrollment:create', {
        userId,
        courseId: 'orientation',
      }, 'event_bus');
    }

    // If employee, start onboarding workflow
    if (['employee', 'recruiter', 'hr_manager'].includes(role)) {
      await this.emit('workflow:start', {
        type: 'employee_onboarding',
        userId,
      }, 'event_bus');
    }
  }

  private async handleUserUpdated(event: SystemEvent): Promise<void> {
    const { userId, updates } = event.data;

    // Clear user cache
    await cache.delete(`user:profile:${userId}`);

    // Update search index (if implemented)
    await this.emit('search:update', {
      type: 'user',
      id: userId,
      data: updates,
    }, 'event_bus');
  }

  private async handleRoleAssigned(event: SystemEvent): Promise<void> {
    const { userId, roleCode } = event.data;

    // Grant role-specific accesses
    switch (roleCode) {
      case 'admin':
        await this.emit('access:grant', {
          userId,
          resources: ['admin_panel', 'reports', 'user_management'],
        }, 'event_bus');
        break;
      
      case 'recruiter':
        await this.emit('access:grant', {
          userId,
          resources: ['ats', 'candidate_database', 'job_posting'],
        }, 'event_bus');
        break;
    }
  }

  private async handleTopicCompleted(event: SystemEvent): Promise<void> {
    const { userId, topicId, score } = event.data;

    // Award XP
    await this.emit('gamification:award_xp', {
      userId,
      amount: 100,
      source: 'topic_completion',
      sourceId: topicId,
    }, 'event_bus');

    // Check for achievements
    await this.emit('achievement:check', {
      userId,
      trigger: 'topic_completed',
      data: { topicId, score },
    }, 'event_bus');

    // Update learning path
    await this.emit('learning_path:update', {
      userId,
      completedTopic: topicId,
    }, 'event_bus');
  }

  private async handleCourseCompleted(event: SystemEvent): Promise<void> {
    const { userId, courseId } = event.data;

    // Create employee record for graduate
    await this.emit('employee:create_from_graduate', {
      userId,
      courseId,
      graduationDate: new Date(),
    }, 'event_bus');

    // Send completion certificate
    await this.emit('certificate:generate', {
      userId,
      courseId,
      type: 'completion',
    }, 'event_bus');

    // Add to talent pool
    await this.emit('talent_pool:add', {
      userId,
      skills: event.data.skills,
      availability: 'immediate',
    }, 'event_bus');
  }

  private async handleJobCreated(event: SystemEvent): Promise<void> {
    const { jobId, clientId, skills } = event.data;

    // Match candidates
    await this.emit('matching:find_candidates', {
      jobId,
      skills,
      autoMatch: true,
    }, 'event_bus');

    // Notify relevant recruiters
    await this.emit('notification:broadcast', {
      role: 'recruiter',
      type: 'new_job',
      data: { jobId, clientId },
    }, 'event_bus');

    // Start job workflow
    await this.emit('workflow:start', {
      type: 'job_fulfillment',
      jobId,
    }, 'event_bus');
  }

  private async handleApplicationSubmitted(event: SystemEvent): Promise<void> {
    const { applicationId, jobId, candidateId } = event.data;

    // AI screening
    await this.emit('ai:screen_application', {
      applicationId,
      jobId,
      candidateId,
    }, 'event_bus');

    // Update pipeline
    await this.emit('pipeline:update', {
      jobId,
      candidateId,
      stage: 'screening',
    }, 'event_bus');

    // Notify hiring team
    await this.emit('notification:team', {
      teamType: 'hiring',
      jobId,
      message: 'New application received',
      applicationId,
    }, 'event_bus');
  }

  private async handlePlacementCreated(event: SystemEvent): Promise<void> {
    const { placementId, candidateId, jobId, startDate } = event.data;

    // Update metrics
    await this.emit('metrics:update', {
      type: 'placement',
      data: { placementId, value: 1 },
    }, 'event_bus');

    // Start onboarding
    await this.emit('onboarding:start', {
      candidateId,
      placementId,
      startDate,
    }, 'event_bus');

    // Invoice generation
    await this.emit('invoice:generate', {
      placementId,
      type: 'placement_fee',
    }, 'event_bus');
  }

  private async handleProductivitySessionEnded(event: SystemEvent): Promise<void> {
    const { sessionId, userId, duration, activityLevel } = event.data;

    // AI analysis
    await this.emit('ai:analyze_productivity', {
      sessionId,
      userId,
      data: event.data,
    }, 'event_bus');

    // Update daily summary
    await this.emit('productivity:update_summary', {
      userId,
      date: new Date().toISOString().split('T')[0],
      sessionData: event.data,
    }, 'event_bus');

    // Check for alerts
    if (activityLevel < 30) {
      await this.emit('alert:low_productivity', {
        userId,
        sessionId,
        activityLevel,
      }, 'event_bus');
    }
  }

  private async handleAlertTriggered(event: SystemEvent): Promise<void> {
    const { alertType, severity, data } = event.data;

    // Log alert
    loggers.system.warn('System alert', {
      alertType,
      severity,
      data,
    });

    // Notify admins for critical alerts
    if (severity === 'critical') {
      await this.emit('notification:admin', {
        type: 'critical_alert',
        alertType,
        data,
      }, 'event_bus');
    }

    // Store in alerts table
    const supabase = await createClient();
    await supabase
      .from('system_alerts')
      .insert({
        alert_type: alertType,
        severity,
        data,
        status: 'active',
      });
  }

  // Get event history
  async getEventHistory(filters?: {
    type?: string;
    source?: string;
    dateRange?: { from: Date; to: Date };
  }): Promise<SystemEvent[]> {
    const supabase = await createClient();

    let query = supabase
      .from('system_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('event_type', filters.type);
    }

    if (filters?.source) {
      query = query.eq('source_module', filters.source);
    }

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.from.toISOString())
        .lte('created_at', filters.dateRange.to.toISOString());
    }

    const { data } = await query.limit(100);

    return data?.map(event => ({
      id: event.id,
      type: event.event_type,
      source: event.source_module,
      data: event.payload,
      timestamp: new Date(event.created_at),
      processed: event.status === 'completed',
      processedBy: event.processed_by,
    })) || [];
  }
}

// Export singleton
export const eventBus = EventBus.getInstance();
