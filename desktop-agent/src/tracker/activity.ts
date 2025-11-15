import { EventEmitter } from 'events';
import { powerMonitor } from 'electron';
// @ts-ignore
import { uIOhook, UiohookKey } from 'uiohook-napi';

export type ActivityStatus = 'active' | 'idle' | 'break';

export interface ActivityData {
  timestamp: Date;
  mouseClicks: number;      // Actual mouse button clicks
  scrollEvents: number;     // Scroll wheel/trackpad events
  keystrokes: number;
  activeTime: number;       // seconds
  idleTime: number;         // seconds (pre-break idle)
  breakTime: number;        // seconds
  status: ActivityStatus;
}

export interface BreakEvent {
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  trigger?: 'timer' | 'system-suspend';
  source?: 'keyboard' | 'mouse' | 'system-resume' | 'manual';
}

export interface ActivityInputEvent {
  type: 'mouse' | 'keyboard' | 'system-resume';
  timestamp: Date;
}

export class ActivityTracker extends EventEmitter {
  private interval: NodeJS.Timeout | null = null;
  private paused: boolean = false;
  private currentSession: ActivityData;
  private lastActivity: number = Date.now();
  private lastTick: number = Date.now();
  private mouseClicks: number = 0;
  private scrollEvents: number = 0;
  private keystrokes: number = 0;
  private idleThreshold: number = 5 * 60 * 1000; // 5 minutes
  private lastEmit: number = Date.now();
  private isOnBreak: boolean = false;
  private breakStart: number | null = null;
  
  // Debounce to filter rapid-fire events (system/programmatic)
  private lastKeyTime: number = 0;
  private lastClickTime: number = 0;
  private lastScrollTime: number = 0;
  private readonly minKeyInterval: number = 50;   // Min 50ms between keys
  private readonly minClickInterval: number = 100; // Min 100ms between clicks
  private readonly minScrollInterval: number = 200; // Min 200ms between scrolls

  constructor() {
    super();
    this.currentSession = this.createNewSession();
    this.setupListeners();
  }

  private createNewSession(): ActivityData {
    return {
      timestamp: new Date(),
      mouseClicks: 0,
      scrollEvents: 0,
      keystrokes: 0,
      activeTime: 0,
      idleTime: 0,
      breakTime: 0,
      status: 'active'
    };
  }

  private setupListeners() {
    powerMonitor.on('suspend', () => {
      if (!this.paused) {
        this.startBreak('system-suspend');
      }
    });

    powerMonitor.on('resume', () => {
      if (!this.paused) {
        this.handleActive('system-resume');
      }
    });
  }

  private startBreak(trigger: BreakEvent['trigger'] = 'timer') {
    if (this.isOnBreak) {
      return;
    }

    this.isOnBreak = true;
    this.breakStart = Date.now();
    this.currentSession.status = 'break';

    this.emit('break-start', {
      startedAt: new Date(this.breakStart),
      trigger
    } as BreakEvent);
  }

  private endBreak(source: BreakEvent['source'] = 'manual') {
    if (!this.isOnBreak) {
      return;
    }

    const endedAt = Date.now();
    const breakStart = this.breakStart ?? endedAt;
    const durationSeconds = Math.max((endedAt - breakStart) / 1000, 0);

    this.isOnBreak = false;
    this.breakStart = null;
    this.currentSession.status = 'active';

    this.emit('break-end', {
      startedAt: new Date(breakStart),
      endedAt: new Date(endedAt),
      durationSeconds,
      source
    } as BreakEvent);
  }

  private handleActive(source: BreakEvent['source']) {
    if (source === 'mouse' || source === 'keyboard' || source === 'system-resume') {
      this.emitInput(source);
    }

    this.endBreak(source);
    this.lastActivity = Date.now();
  }

  private emitInput(type: ActivityInputEvent['type']) {
    this.emit('input', {
      type,
      timestamp: new Date()
    } as ActivityInputEvent);
  }

  public recordMouseClick() {
    if (this.paused) return;
    
    const now = Date.now();
    // Debounce: Only count if >100ms since last click (filter rapid-fire/programmatic)
    if (now - this.lastClickTime < this.minClickInterval) {
      return;
    }
    
    this.lastClickTime = now;
    this.mouseClicks++;
    this.currentSession.mouseClicks++;
    this.handleActive('mouse');
  }

  public recordScrollEvent() {
    if (this.paused) return;
    
    const now = Date.now();
    // Debounce: Only count if >200ms since last scroll
    if (now - this.lastScrollTime < this.minScrollInterval) {
      return;
    }
    
    this.lastScrollTime = now;
    this.scrollEvents++;
    this.currentSession.scrollEvents++;
    this.handleActive('mouse');
  }

  public recordKeystroke() {
    if (this.paused) return;
    
    const now = Date.now();
    // Debounce: Only count if >50ms since last key (filter key repeats/programmatic)
    if (now - this.lastKeyTime < this.minKeyInterval) {
      return;
    }
    
    this.lastKeyTime = now;
    this.keystrokes++;
    this.currentSession.keystrokes++;
    this.handleActive('keyboard');
  }

  private calculateActivityMetrics() {
    const now = Date.now();
    const deltaMs = now - this.lastTick;
    this.lastTick = now;

    const timeSinceLastActivity = now - this.lastActivity;

    if (!this.isOnBreak && timeSinceLastActivity >= this.idleThreshold) {
      this.startBreak('timer');
    }

    if (this.isOnBreak) {
      this.currentSession.breakTime += deltaMs / 1000;
      this.currentSession.status = 'break';
    } else if (timeSinceLastActivity >= 1000) {
      this.currentSession.idleTime += deltaMs / 1000;
      this.currentSession.status = 'idle';
    } else {
      this.currentSession.activeTime += deltaMs / 1000;
      this.currentSession.status = 'active';
    }

    this.currentSession.timestamp = new Date();
  }

  public start() {
    if (this.interval) return;

    this.lastTick = Date.now();
    this.lastEmit = Date.now();
    this.lastActivity = Date.now();

    // Start system-level keyboard and mouse monitoring
    try {
      // Track actual keyboard key presses only
      uIOhook.on('keydown', () => {
        this.recordKeystroke();
      });

      // Track actual mouse button clicks only (not movements!)
      uIOhook.on('click', () => {
        this.recordMouseClick();
      });

      // Track scroll wheel events separately
      uIOhook.on('wheel', () => {
        this.recordScrollEvent();
      });

      uIOhook.start();
      console.log('✅ System-level input monitoring started');
      console.log('   - Tracking: Keystrokes, Mouse Clicks, Scroll Events');
    } catch (error) {
      console.error('❌ Failed to start input monitoring:', error);
    }

    this.interval = setInterval(() => {
      if (!this.paused) {
        this.calculateActivityMetrics();

        if (Date.now() - this.lastEmit >= 60000) {
          this.emit('activity', this.getCurrentActivity());
          this.lastEmit = Date.now();
        }
      }
    }, 1000);

    console.log('Activity tracking started');
  }

  public stop() {
    try {
      uIOhook.stop();
      console.log('System-level input monitoring stopped');
    } catch (error) {
      console.error('Error stopping input monitoring:', error);
    }

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('Activity tracking stopped');
  }

  public pause() {
    this.paused = true;
    this.endBreak('manual');
  }

  public resume() {
    this.paused = false;
    this.lastActivity = Date.now();
    this.lastTick = Date.now();
    this.lastEmit = Date.now();
  }

  public getCurrentActivity(): ActivityData {
    return {
      ...this.currentSession,
      timestamp: new Date()
    };
  }

  public resetSession() {
    this.currentSession = this.createNewSession();
    this.mouseClicks = 0;
    this.scrollEvents = 0;
    this.keystrokes = 0;
    this.lastActivity = Date.now();
    this.lastTick = Date.now();
    this.lastEmit = Date.now();
    this.isOnBreak = false;
    this.breakStart = null;
  }
}

