import { EventEmitter } from 'events';
import activeWin from 'active-win';

export interface ApplicationUsage {
  appName: string;
  windowTitle: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
}

export class ApplicationTracker extends EventEmitter {
  private interval: NodeJS.Timeout | null = null;
  private paused: boolean = false;
  private currentApp: ApplicationUsage | null = null;
  private appHistory: ApplicationUsage[] = [];
  private checkInterval: number = 2000; // 2 seconds

  constructor() {
    super();
  }

  private async getCurrentActiveWindow() {
    try {
      const window = await activeWin();
      if (!window) return null;

      return {
        appName: window.owner.name,
        windowTitle: window.title,
        processId: window.owner.processId
      };
    } catch (error) {
      console.error('Error getting active window:', error);
      return null;
    }
  }

  private async trackApplication() {
    const activeWindow = await this.getCurrentActiveWindow();
    
    if (!activeWindow) return;

    // Check if app has changed
    if (this.currentApp && 
        (this.currentApp.appName !== activeWindow.appName || 
         this.currentApp.windowTitle !== activeWindow.windowTitle)) {
      // End previous app session
      this.currentApp.endTime = new Date();
      this.appHistory.push({ ...this.currentApp });
      this.emit('app-changed', this.currentApp);
      this.currentApp = null;
    }

    // Start new app session if needed
    if (!this.currentApp) {
      this.currentApp = {
        appName: activeWindow.appName,
        windowTitle: activeWindow.windowTitle,
        startTime: new Date(),
        duration: 0
      };
    } else {
      // Update duration
      const now = Date.now();
      const start = this.currentApp.startTime.getTime();
      this.currentApp.duration = Math.floor((now - start) / 1000);
    }

    this.emit('app-usage', this.currentApp);
  }

  public start() {
    if (this.interval) return;

    this.interval = setInterval(async () => {
      if (!this.paused) {
        await this.trackApplication();
      }
    }, this.checkInterval);

    console.log('Application tracking started');
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (this.currentApp) {
      this.currentApp.endTime = new Date();
      this.appHistory.push({ ...this.currentApp });
    }

    console.log('Application tracking stopped');
  }

  public pause() {
    this.paused = true;
  }

  public resume() {
    this.paused = false;
  }

  public getAppHistory(): ApplicationUsage[] {
    return [...this.appHistory];
  }

  public getAppSummary() {
    const summary: Record<string, number> = {};
    
    this.appHistory.forEach(usage => {
      if (!summary[usage.appName]) {
        summary[usage.appName] = 0;
      }
      summary[usage.appName] += usage.duration;
    });

    return summary;
  }

  public clearHistory() {
    this.appHistory = [];
  }
}




