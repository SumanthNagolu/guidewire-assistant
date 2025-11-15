import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface Config {
  apiUrl: string;
  apiKey: string;
  dashboardUrl: string;
  screenshotsEnabled: boolean;
  screenshotInterval: number;
  screenshotQuality: number;
  syncInterval: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  userId?: string;
  userEmail?: string;
  rememberMe?: boolean;
  teamId?: string;
}

export class ConfigManager {
  private configPath: string;
  private config: Config;

  constructor() {
    const configDir = path.join(os.homedir(), '.intime-agent');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    this.configPath = path.join(configDir, 'config.json');
    this.config = this.loadConfig();
  }

  private getDefaultConfig(): Config {
    return {
      apiUrl: process.env.API_URL || 'http://localhost:3000',
      apiKey: process.env.API_KEY || '',
      dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000/productivity',
      screenshotsEnabled: true,
      screenshotInterval: 5 * 60 * 1000, // 5 minutes
      screenshotQuality: 50,
      syncInterval: 5 * 60 * 1000, // 5 minutes
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    };
  }

  private loadConfig(): Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        const stored = JSON.parse(data) as Config;
        const merged = { ...this.getDefaultConfig(), ...stored };

        // Auto-migrate old configs pointing to production domain
        if (merged.apiUrl.includes('intimesolutions.com')) {
          merged.apiUrl = 'http://localhost:3000';
          merged.dashboardUrl = 'http://localhost:3000/productivity';
          this.saveConfig(merged);
        }

        return merged;
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
    
    const defaultConfig = this.getDefaultConfig();
    this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  private saveConfig(config: Config) {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  public get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  public set<K extends keyof Config>(key: K, value: Config[K]) {
    this.config[key] = value;
    this.saveConfig(this.config);
  }

  public getAll(): Config {
    return { ...this.config };
  }

  public update(updates: Partial<Config>) {
    this.config = { ...this.config, ...updates };
    this.saveConfig(this.config);
  }
}

