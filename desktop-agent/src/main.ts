import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import { ActivityTracker } from './tracker/activity';
import { ScreenshotCapture } from './tracker/screenshots';
import { ApplicationTracker, ApplicationUsage } from './tracker/applications';
import { DataSync } from './sync/uploader';
import { ConfigManager } from './config/manager';
import { AuthManager } from './auth/manager';
import { showLoginWindow } from './windows/login';
import { AttendanceTracker } from './tracker/attendance';
import { OutlookIntegration, OutlookMetrics } from './integrations/outlook';
import { TeamsIntegration, TeamsMetrics } from './integrations/teams';

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let activityTracker: ActivityTracker;
let screenshotCapture: ScreenshotCapture;
let appTracker: ApplicationTracker;
let attendanceTracker: AttendanceTracker;
let teamsIntegration: TeamsIntegration | null = null;
let outlookIntegration: OutlookIntegration | null = null;
let latestTeamsMetrics: TeamsMetrics | null = null;
let latestOutlookMetrics: OutlookMetrics | null = null;
let dataSync: DataSync;
let config: ConfigManager;
let authManager: AuthManager;

const recentApplications: ApplicationUsage[] = [];

async function createTray() {
  const iconPath = path.join(__dirname, '../assets/icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'InTime Productivity Agent',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Status: Active',
      enabled: false
    },
    {
      label: 'Last Sync: Just now',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Open Dashboard',
      click: () => {
        require('electron').shell.openExternal(config.get('dashboardUrl'));
      }
    },
    {
      label: 'Settings',
      click: () => {
        createSettingsWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'Pause Tracking',
      click: () => {
        pauseTracking();
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('InTime Productivity Agent');
  tray.setContextMenu(contextMenu);
}

function createSettingsWindow() {
  if (mainWindow) {
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'InTime Agent Settings'
  });

  mainWindow.loadFile(path.join(__dirname, '../assets/settings.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function pauseTracking() {
  activityTracker?.pause();
  screenshotCapture?.pause();
  appTracker?.pause();
  console.log('Tracking paused');
}

function resumeTracking() {
  activityTracker?.resume();
  screenshotCapture?.resume();
  appTracker?.resume();
  console.log('Tracking resumed');
}

async function prepareAuthToken() {
  const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDevelopment) {
    // In dev mode, use the test token approach
    if (dataSync) {
      dataSync.setAccessToken('test-key');
    }
    return;
  }

  if (!authManager || !dataSync) {
    return;
  }

  try {
    const token = await authManager.getAccessToken();
    if (token) {
      dataSync.setAccessToken(token);
    }
  } catch (error) {
    console.error('Failed to refresh auth token:', error);
  }
}

async function initializeTracking() {
  const rawConfig = config.getAll();
  const sanitizedConfig = {
    ...rawConfig,
    apiKey: rawConfig.apiKey ? '[set]' : '',
    supabaseAnonKey: rawConfig.supabaseAnonKey ? '[hidden]' : '',
  };
  console.log('🛠 Agent config loaded:', sanitizedConfig);
  
  activityTracker = new ActivityTracker();
  screenshotCapture = new ScreenshotCapture({
    interval: config.get('screenshotInterval') || 10 * 60 * 1000,
    quality: config.get('screenshotQuality') || 50
  });
  appTracker = new ApplicationTracker();
  teamsIntegration = new TeamsIntegration(appTracker);
  teamsIntegration.on('metrics', (metrics) => {
    latestTeamsMetrics = metrics;
  });
  attendanceTracker = new AttendanceTracker(activityTracker);

  if (process.platform === 'win32') {
    outlookIntegration = new OutlookIntegration();
    outlookIntegration.on('metrics', (metrics) => {
      latestOutlookMetrics = metrics;
      console.log('📧 Outlook metrics updated:', metrics);
    });
    outlookIntegration.start();
  }

  dataSync = new DataSync({
    apiUrl: config.get('apiUrl'),
    syncInterval: config.get('syncInterval') || 5 * 60 * 1000
  });

  attendanceTracker.on('clock-in', (payload) => {
    console.log('🕒 Auto clock-in detected:', payload);
  });

  attendanceTracker.on('clock-out', (payload) => {
    console.log('🕔 Auto clock-out recorded:', payload);
  });

  // Ensure we start with a valid token
  await prepareAuthToken();

  // Start tracking
  activityTracker.start();
  appTracker.start();
  
  if (config.get('screenshotsEnabled')) {
    screenshotCapture.start();
  }

  dataSync.on('sync', (payload) => {
    console.log('Syncing data:', payload);
  });

  activityTracker.on('activity', async (activityData) => {
    await prepareAuthToken();

    console.log('Activity captured, syncing...', activityData);
    const attendance = attendanceTracker.getCurrentRecord();
    const success = await dataSync.syncData({
      activity: activityData,
      attendance,
      outlook: latestOutlookMetrics,
      teams: latestTeamsMetrics,
      applications: [...recentApplications],
      timestamp: new Date()
    });

    if (success) {
      recentApplications.length = 0;
    }
  });

  appTracker.on('app-usage', async (appData) => {
    recentApplications.push({ ...appData });
    if (recentApplications.length > 20) {
      recentApplications.shift();
    }
  });

  screenshotCapture.on('screenshot', async (data) => {
    await prepareAuthToken();

    console.log('📸 Screenshot captured:', data.filepath);
    try {
      const success = await dataSync.uploadScreenshot(data.filepath);
      if (success) {
        console.log('✅ Screenshot uploaded successfully');
      } else {
        console.log('❌ Screenshot upload failed');
      }
    } catch (error) {
      console.error('Screenshot upload error:', error);
    }
  });

  dataSync.start();
}

async function ensureAuthenticated() {
  const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  console.log('🔓 Development mode: attempting auto-login for', config.get('userEmail'));
  try {
    let session = await authManager.initialize();
    if (session) {
      console.log('✅ Auto-login successful');
      return;
    }
    console.log('No session returned, continuing without auth...');
  } catch (error: any) {
    console.warn('Auto-login failed:', error?.message);
  }
}

async function startAgent() {
  config = new ConfigManager();
  
  // Skip full auth for now - use direct token approach
  const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDevelopment) {
    console.log('🔓 Running in development mode - using test token');
    await createTray();
    await initializeTracking();
    console.log('InTime Productivity Agent started');
    return;
  }

  authManager = new AuthManager(config);

  authManager.on('token-changed', (token: string) => {
    if (dataSync) {
      dataSync.setAccessToken(token);
    }
  });

  await ensureAuthenticated();
  await createTray();
  await initializeTracking();

  console.log('InTime Productivity Agent started');
}

app.whenReady().then(async () => {
  try {
    await startAgent();
  } catch (error) {
    console.error('Failed to start InTime Productivity Agent:', error);
    app.quit();
  }
});

app.on('window-all-closed', (e: Event) => {
  e.preventDefault();
});

app.on('before-quit', () => {
  activityTracker?.stop();
  screenshotCapture?.stop();
  appTracker?.stop();
  attendanceTracker?.shutdown();
  outlookIntegration?.stop();
  dataSync?.stop();
});

app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: true
});

