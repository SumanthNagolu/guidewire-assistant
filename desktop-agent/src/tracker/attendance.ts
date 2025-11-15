import { EventEmitter } from 'events';
import { ActivityData, ActivityInputEvent, ActivityTracker } from './activity';

export type AttendanceStatus = 'off' | 'working' | 'break' | 'completed';

export interface AttendanceRecord {
  date: string;
  clockIn: Date | null;
  clockOut: Date | null;
  firstActivity: Date | null;
  lastActivity: Date | null;
  totalActiveSeconds: number;
  totalBreakSeconds: number;
  totalIdleSeconds: number;
  overtimeSeconds: number;
  status: AttendanceStatus;
}

interface SnapshotTotals {
  activeTime: number;
  breakTime: number;
  idleTime: number;
}

export class AttendanceTracker extends EventEmitter {
  private record: AttendanceRecord;
  private readonly activityTracker: ActivityTracker;
  private readonly autoClockOutThreshold = 30 * 60 * 1000; // 30 minutes
  private lastSnapshot: SnapshotTotals = { activeTime: 0, breakTime: 0, idleTime: 0 };
  private clockOutTimer: NodeJS.Timeout | null = null;

  constructor(activityTracker: ActivityTracker) {
    super();
    this.activityTracker = activityTracker;
    this.record = this.createNewRecord();
    this.attachListeners();
  }

  private createNewRecord(): AttendanceRecord {
    const today = new Date().toISOString().split('T')[0];
    return {
      date: today,
      clockIn: null,
      clockOut: null,
      firstActivity: null,
      lastActivity: null,
      totalActiveSeconds: 0,
      totalBreakSeconds: 0,
      totalIdleSeconds: 0,
      overtimeSeconds: 0,
      status: 'off',
    };
  }

  private attachListeners() {
    this.activityTracker.on('input', (event: ActivityInputEvent) => {
      this.handleInputEvent(event);
    });

    this.activityTracker.on('activity', (data: ActivityData) => {
      this.handleActivitySnapshot(data);
    });

    this.activityTracker.on('break-start', () => {
      if (this.record.status === 'working') {
        this.updateStatus('break');
      }
    });

    this.activityTracker.on('break-end', () => {
      if (this.record.status === 'break') {
        this.updateStatus('working');
      }
    });
  }

  private handleInputEvent(event: ActivityInputEvent) {
    this.maybeStartNewDay(event.timestamp);

    if (!this.record.clockIn) {
      this.record.clockIn = event.timestamp;
      this.record.firstActivity = event.timestamp;
      this.updateStatus('working');
      this.emit('clock-in', { timestamp: event.timestamp } as const);
    }

    this.record.lastActivity = event.timestamp;
    if (!this.record.firstActivity) {
      this.record.firstActivity = event.timestamp;
    }

    this.resetClockOutTimer();
  }

  private handleActivitySnapshot(data: ActivityData) {
    this.maybeStartNewDay(data.timestamp);

    const deltaActive = Math.max(data.activeTime - this.lastSnapshot.activeTime, 0);
    const deltaBreak = Math.max(data.breakTime - this.lastSnapshot.breakTime, 0);
    const deltaIdle = Math.max(data.idleTime - this.lastSnapshot.idleTime, 0);

    this.lastSnapshot = {
      activeTime: data.activeTime,
      breakTime: data.breakTime,
      idleTime: data.idleTime,
    };

    this.record.totalActiveSeconds += deltaActive;
    this.record.totalBreakSeconds += deltaBreak;
    this.record.totalIdleSeconds += deltaIdle;
    this.record.lastActivity = data.timestamp;

    if (this.record.clockIn && !this.record.firstActivity && data.activeTime > 0) {
      this.record.firstActivity = data.timestamp;
    }

    if (this.record.status !== 'completed') {
      if (data.status === 'break') {
        this.updateStatus('break');
      } else if (this.record.clockIn) {
        this.updateStatus('working');
      }
    }

    const standardShiftSeconds = 8 * 60 * 60;
    this.record.overtimeSeconds = Math.max(this.record.totalActiveSeconds - standardShiftSeconds, 0);

    this.emit('attendance-update', { ...this.record });
  }

  private maybeStartNewDay(timestamp: Date) {
    if (this.record.date === timestamp.toISOString().split('T')[0]) {
      return;
    }

    this.finalizeRecord('manual');
    this.record = this.createNewRecord();
    this.lastSnapshot = { activeTime: 0, breakTime: 0, idleTime: 0 };
  }

  private updateStatus(status: AttendanceStatus) {
    if (this.record.status !== status) {
      this.record.status = status;
      this.emit('status-change', { status } as const);
    }
  }

  private resetClockOutTimer() {
    if (this.clockOutTimer) {
      clearTimeout(this.clockOutTimer);
    }

    this.clockOutTimer = setTimeout(() => {
      this.finalizeRecord('auto');
    }, this.autoClockOutThreshold);
  }

  private finalizeRecord(reason: 'auto' | 'manual' | 'shutdown') {
    if (this.record.status === 'completed') {
      return;
    }

    const clockOutTime = new Date();
    this.record.clockOut = clockOutTime;
    this.record.lastActivity = this.record.lastActivity || clockOutTime;
    this.updateStatus('completed');

    if (this.clockOutTimer) {
      clearTimeout(this.clockOutTimer);
      this.clockOutTimer = null;
    }

    this.emit('clock-out', { timestamp: clockOutTime, reason } as const);
  }

  public shutdown() {
    this.finalizeRecord('shutdown');
  }

  public getCurrentRecord(): AttendanceRecord {
    return {
      ...this.record,
      clockIn: this.record.clockIn ? new Date(this.record.clockIn) : null,
      clockOut: this.record.clockOut ? new Date(this.record.clockOut) : null,
      firstActivity: this.record.firstActivity ? new Date(this.record.firstActivity) : null,
      lastActivity: this.record.lastActivity ? new Date(this.record.lastActivity) : null,
    };
  }
}


