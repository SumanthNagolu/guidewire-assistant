import sgMail from '@sendgrid/mail';
import { loggers } from '@/lib/logger';
import { eventBus } from '@/lib/events/event-bus';
import { cache } from '@/lib/redis';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Email types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
}

export interface EmailRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject?: string;
  template?: string;
  data?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  scheduledFor?: Date;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  type?: string;
  disposition?: 'attachment' | 'inline';
}

// Email Service
export class EmailService {
  private static instance: EmailService;
  private templates: Map<string, EmailTemplate> = new Map();

  private constructor() {
    this.initializeTemplates();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Initialize email templates
  private initializeTemplates() {
    // Welcome email
    this.templates.set('welcome', {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to IntimeSolutions!',
      htmlContent: `
        <h1>Welcome {{firstName}}!</h1>
        <p>We're excited to have you join IntimeSolutions.</p>
        <p>Your account has been created with the role: {{role}}</p>
        <a href="{{loginUrl}}">Login to your account</a>
      `,
      variables: ['firstName', 'role', 'loginUrl'],
    });

    // Course completion
    this.templates.set('course_completion', {
      id: 'course_completion',
      name: 'Course Completion',
      subject: 'Congratulations on completing {{courseName}}!',
      htmlContent: `
        <h1>Congratulations {{firstName}}!</h1>
        <p>You've successfully completed {{courseName}}.</p>
        <p>Your certificate is attached to this email.</p>
        <p>Score: {{score}}%</p>
      `,
      variables: ['firstName', 'courseName', 'score'],
    });

    // Interview invitation
    this.templates.set('interview_invitation', {
      id: 'interview_invitation',
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {{jobTitle}} at {{company}}',
      htmlContent: `
        <h2>Interview Invitation</h2>
        <p>Dear {{candidateName}},</p>
        <p>You've been selected for an interview for the {{jobTitle}} position at {{company}}.</p>
        <p><strong>Date:</strong> {{interviewDate}}</p>
        <p><strong>Time:</strong> {{interviewTime}}</p>
        <p><strong>Location:</strong> {{location}}</p>
        <p>Please confirm your availability by clicking the link below:</p>
        <a href="{{confirmUrl}}">Confirm Interview</a>
      `,
      variables: ['candidateName', 'jobTitle', 'company', 'interviewDate', 'interviewTime', 'location', 'confirmUrl'],
    });

    // Daily productivity summary
    this.templates.set('productivity_summary', {
      id: 'productivity_summary',
      name: 'Daily Productivity Summary',
      subject: 'Your Productivity Summary - {{date}}',
      htmlContent: `
        <h2>Daily Productivity Report</h2>
        <p>Hi {{firstName}},</p>
        <p>Here's your productivity summary for {{date}}:</p>
        <ul>
          <li>Active Time: {{activeTime}}</li>
          <li>Productivity Score: {{score}}/100</li>
          <li>Top Applications: {{topApps}}</li>
        </ul>
        <p>{{insights}}</p>
      `,
      variables: ['firstName', 'date', 'activeTime', 'score', 'topApps', 'insights'],
    });
  }

  // Send email
  async sendEmail(request: EmailRequest): Promise<void> {
    try {
      // Build email message
      const msg = await this.buildMessage(request);

      // Send via SendGrid
      await sgMail.send(msg);

      // Log success
      loggers.system.info('Email sent', {
        to: request.to,
        template: request.template,
        subject: msg.subject,
      });

      // Emit event
      await eventBus.emit('email:sent', {
        to: request.to,
        template: request.template,
        timestamp: new Date(),
      });

    } catch (error) {
      loggers.system.error('Email send failed', error);
      
      // Retry logic
      await this.scheduleRetry(request);
      
      throw error;
    }
  }

  // Build email message
  private async buildMessage(request: EmailRequest): Promise<any> {
    let html = request.html;
    let text = request.text;
    let subject = request.subject;

    // Use template if specified
    if (request.template) {
      const template = this.templates.get(request.template);
      if (template) {
        html = this.renderTemplate(template.htmlContent, request.data || {});
        text = text || this.stripHtml(html);
        subject = this.renderTemplate(template.subject, request.data || {});
      }
    }

    // Build SendGrid message
    const msg: any = {
      to: request.to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: subject || 'IntimeSolutions Notification',
      html,
      text,
    };

    // Add CC/BCC if provided
    if (request.cc) msg.cc = request.cc;
    if (request.bcc) msg.bcc = request.bcc;

    // Add attachments
    if (request.attachments) {
      msg.attachments = request.attachments.map(att => ({
        filename: att.filename,
        content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
        type: att.type,
        disposition: att.disposition || 'attachment',
      }));
    }

    // Schedule if needed
    if (request.scheduledFor) {
      msg.sendAt = Math.floor(request.scheduledFor.getTime() / 1000);
    }

    return msg;
  }

  // Render template with variables
  private renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;
    
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });
    
    return rendered;
  }

  // Strip HTML tags
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  // Schedule retry for failed email
  private async scheduleRetry(request: EmailRequest): Promise<void> {
    // In production, use proper queue
    setTimeout(() => {
      this.sendEmail(request).catch(error => {
        loggers.system.error('Email retry failed', error);
      });
    }, 60000); // Retry after 1 minute
  }

  // Send bulk emails
  async sendBulkEmails(
    recipients: string[],
    template: string,
    commonData: Record<string, any>,
    personalizedData?: Record<string, Record<string, any>>
  ): Promise<void> {
    // Batch recipients (SendGrid limit)
    const batchSize = 1000;
    const batches = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    // Send each batch
    for (const batch of batches) {
      const messages = batch.map(recipient => {
        const data = {
          ...commonData,
          ...(personalizedData?.[recipient] || {}),
        };

        return this.buildMessage({
          to: recipient,
          template,
          data,
        });
      });

      try {
        await sgMail.send(await Promise.all(messages));
        
        loggers.system.info('Bulk email batch sent', {
          recipients: batch.length,
          template,
        });
      } catch (error) {
        loggers.system.error('Bulk email batch failed', error);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Track email events (webhook handler)
  async handleWebhook(events: any[]): Promise<void> {
    for (const event of events) {
      switch (event.event) {
        case 'delivered':
          await this.trackDelivery(event);
          break;
        case 'open':
          await this.trackOpen(event);
          break;
        case 'click':
          await this.trackClick(event);
          break;
        case 'bounce':
          await this.handleBounce(event);
          break;
        case 'spam_report':
          await this.handleSpamReport(event);
          break;
      }
    }
  }

  // Track email delivery
  private async trackDelivery(event: any): Promise<void> {
    await eventBus.emit('email:delivered', {
      email: event.email,
      timestamp: new Date(event.timestamp * 1000),
    });
  }

  // Track email open
  private async trackOpen(event: any): Promise<void> {
    await eventBus.emit('email:opened', {
      email: event.email,
      timestamp: new Date(event.timestamp * 1000),
    });
  }

  // Track link click
  private async trackClick(event: any): Promise<void> {
    await eventBus.emit('email:clicked', {
      email: event.email,
      url: event.url,
      timestamp: new Date(event.timestamp * 1000),
    });
  }

  // Handle bounce
  private async handleBounce(event: any): Promise<void> {
    loggers.system.warn('Email bounced', {
      email: event.email,
      reason: event.reason,
    });

    // Mark email as invalid
    await cache.set(`email:invalid:${event.email}`, true, 86400 * 30); // 30 days
  }

  // Handle spam report
  private async handleSpamReport(event: any): Promise<void> {
    loggers.system.error('Spam report received', {
      email: event.email,
    });

    // Add to suppression list
    await cache.set(`email:suppressed:${event.email}`, true, 86400 * 365); // 1 year
  }
}

// Export singleton
export const emailService = EmailService.getInstance();
