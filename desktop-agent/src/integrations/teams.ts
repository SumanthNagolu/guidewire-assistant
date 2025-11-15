import { EventEmitter } from 'events';
import { ApplicationTracker, ApplicationUsage } from '../tracker/applications';

export type TeamsSessionType = 'meeting' | 'call' | 'chat';

export interface TeamsMetrics {
  status: 'idle' | TeamsSessionType;
  activeSessionSeconds: number;
  totalMeetingSeconds: number;
  totalCallSeconds: number;
  meetingsToday: number;
  callsToday: number;
  lastWindowTitle?: string;
  timestamp: string;
}

interface TeamsSession {
  type: TeamsSessionType;
  startedAt: Date;
  windowTitle: string;
}

export class TeamsIntegration extends EventEmitter {
  private readonly tracker: ApplicationTracker;
  private currentSession: TeamsSession | null = null;
  private metrics: TeamsMetrics;
  private currentDate: string;

  constructor(tracker: ApplicationTracker) {
    super();
    this.tracker = tracker;
    this.currentDate = TeamsIntegration.getDateStamp();
    this.metrics = {
      status: 'idle',
      activeSessionSeconds: 0,
      totalMeetingSeconds: 0,
      totalCallSeconds: 0,
      meetingsToday: 0,
      callsToday: 0,
      timestamp: new Date().toISOString(),
    };

    this.attachListeners();
  }

  public getMetrics(): TeamsMetrics {
    return { ...this.metrics };
  }

  private attachListeners() {
    this.tracker.on('app-usage', (usage: ApplicationUsage) => this.handleUsage(usage));
  }

  private handleUsage(usage: ApplicationUsage) {
    const now = new Date();
    this.resetIfNewDay(now);

    if (this.isTeamsWindow(usage)) {
      const sessionType = this.getSessionType(usage.windowTitle);
      this.updateSession(sessionType, usage.windowTitle, now);
    } else {
      this.endCurrentSession('idle', now);
    }

    this.updateActiveDuration(now);
    this.metrics.timestamp = now.toISOString();
    this.emit('metrics', this.getMetrics());
  }

  private updateSession(type: TeamsSessionType, windowTitle: string, now: Date) {
    if (!this.currentSession) {
      this.currentSession = { type, startedAt: now, windowTitle };
      this.metrics.status = type;
      this.metrics.lastWindowTitle = windowTitle;
      this.emit('session-start', { type, startedAt: now, windowTitle });
      return;
    }

    if (this.currentSession.type !== type) {
      this.endCurrentSession(this.currentSession.type, now);
      this.currentSession = { type, startedAt: now, windowTitle };
      this.metrics.status = type;
      this.metrics.lastWindowTitle = windowTitle;
      this.emit('session-start', { type, startedAt: now, windowTitle });
    } else {
      this.metrics.status = type;
      this.metrics.lastWindowTitle = windowTitle;
    }
  }

  private endCurrentSession(reason: 'idle' | TeamsSessionType, now: Date) {
    if (!this.currentSession) {
      this.metrics.status = 'idle';
      this.metrics.activeSessionSeconds = 0;
      return;
    }

    const durationSeconds = Math.max(0, Math.floor((now.getTime() - this.currentSession.startedAt.getTime()) / 1000));

    if (this.currentSession.type === 'meeting') {
      this.metrics.totalMeetingSeconds += durationSeconds;
      this.metrics.meetingsToday += 1;
    }

    if (this.currentSession.type === 'call') {
      this.metrics.totalCallSeconds += durationSeconds;
      this.metrics.callsToday += 1;
    }

    this.emit('session-end', {
      type: this.currentSession.type,
      startedAt: this.currentSession.startedAt,
      endedAt: now,
      durationSeconds,
    });

    this.currentSession = null;
    this.metrics.status = reason === 'idle' ? 'idle' : this.metrics.status;
    this.metrics.activeSessionSeconds = 0;
    this.metrics.lastWindowTitle = undefined;
  }

  private updateActiveDuration(now: Date) {
    if (this.currentSession) {
      this.metrics.activeSessionSeconds = Math.max(
        0,
        Math.floor((now.getTime() - this.currentSession.startedAt.getTime()) / 1000)
      );
    } else {
      this.metrics.activeSessionSeconds = 0;
    }
  }

  private resetIfNewDay(now: Date) {
    const dateStamp = TeamsIntegration.getDateStamp(now);
    if (dateStamp !== this.currentDate) {
      this.currentDate = dateStamp;
      this.metrics.totalMeetingSeconds = 0;
      this.metrics.totalCallSeconds = 0;
      this.metrics.meetingsToday = 0;
      this.metrics.callsToday = 0;
    }
  }

  private isTeamsWindow(usage: ApplicationUsage): boolean {
    const appName = usage.appName?.toLowerCase() ?? '';
    const title = usage.windowTitle?.toLowerCase() ?? '';
    return appName.includes('teams') || title.includes('microsoft teams');
  }

  private getSessionType(windowTitle: string): TeamsSessionType {
    const title = windowTitle.toLowerCase();

    if (title.includes('meeting') || title.includes('presentation') || title.includes('calendar')) {
      return 'meeting';
    }

    if (title.includes('call') || title.includes('incoming call') || title.includes('in call')) {
      return 'call';
    }

    return 'chat';
  }

  private static getDateStamp(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }
}
