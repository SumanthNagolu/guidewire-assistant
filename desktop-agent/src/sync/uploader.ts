import { EventEmitter } from 'events';
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import { AttendanceRecord } from '../tracker/attendance';
import { OutlookMetrics } from '../integrations/outlook';
import { TeamsMetrics } from '../integrations/teams';

interface SyncOptions {
  apiUrl: string;
  apiKey?: string;
  syncInterval: number;
}

interface SyncData {
  activity?: any;
  attendance?: AttendanceRecord;
  outlook?: OutlookMetrics | null;
  teams?: TeamsMetrics | null;
  applications?: any;
  screenshots?: any[];
  timestamp: Date;
}

export class DataSync extends EventEmitter {
  private interval: NodeJS.Timeout | null = null;
  private options: SyncOptions;
  private api: AxiosInstance;
  private pendingData: SyncData[] = [];
  private maxRetries: number = 3;
  private currentToken: string | null = null;

  constructor(options: SyncOptions) {
    super();
    this.options = options;
    this.currentToken = options.apiKey || null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.currentToken) {
      headers['Authorization'] = `Bearer ${this.currentToken}`;
    }
    
    this.api = axios.create({
      baseURL: this.options.apiUrl,
      headers,
      timeout: 30000
    });
  }

  public setAccessToken(token: string | null) {
    this.currentToken = token;

    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  public async syncData(data: SyncData) {
    try {
      const activity = data.activity;
      console.log('📊 SYNCING DATA:', {
        status: activity?.status,
        keystrokes: activity?.keystrokes ?? 0,
        mouseClicks: activity?.mouseClicks ?? 0,
        scrollEvents: activity?.scrollEvents ?? 0,
        activeSeconds: activity ? Math.round(activity.activeTime) : 0,
        breakSeconds: activity ? Math.round(activity.breakTime ?? 0) : 0,
        idleSeconds: activity ? Math.round(activity.idleTime ?? 0) : 0,
        attendanceStatus: data.attendance?.status,
        outlookSent: data.outlook?.sentToday,
        outlookReceived: data.outlook?.receivedToday,
        teamsStatus: data.teams?.status,
        timestamp: data.timestamp
      });

      // Actually send data to server
      const response = await this.api.post('/api/productivity/sync', {
        data,
        timestamp: new Date().toISOString()
      });

      this.emit('sync-success', response.data);
      console.log('✅ Data synced successfully to database!');
      return true;
    } catch (error: any) {
      console.error('❌ Sync error:', error.message);
      this.pendingData.push(data);
      this.emit('sync-error', error);
      return false;
    }
  }

  public async uploadScreenshot(filepath: string) {
    try {
      const fileBuffer = fs.readFileSync(filepath);
      const base64 = fileBuffer.toString('base64');

      const response = await this.api.post('/api/productivity/screenshots', {
        image: base64,
        timestamp: new Date().toISOString(),
        filename: filepath.split('/').pop()
      });

      // Delete local file after successful upload
      fs.unlinkSync(filepath);
      
      this.emit('screenshot-uploaded', response.data);
      console.log('Screenshot uploaded successfully');
      return true;
    } catch (error: any) {
      console.error('Screenshot upload error:', error.message);
      this.emit('upload-error', error);
      return false;
    }
  }

  private async syncPendingData() {
    if (this.pendingData.length === 0) return;

    console.log(`Syncing ${this.pendingData.length} pending items...`);

    const toSync = [...this.pendingData];
    this.pendingData = [];

    for (const data of toSync) {
      const success = await this.syncData(data);
      if (!success) {
        // Re-add to pending if sync failed
        this.pendingData.push(data);
      }
    }
  }

  public start() {
    if (this.interval) return;

    this.interval = setInterval(async () => {
      await this.syncPendingData();
    }, this.options.syncInterval);

    console.log(`Data sync started (interval: ${this.options.syncInterval}ms)`);
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('Data sync stopped');
  }

  public async forceSync() {
    await this.syncPendingData();
  }

  public getPendingCount(): number {
    return this.pendingData.length;
  }
}

