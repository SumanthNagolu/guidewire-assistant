import { EventEmitter } from 'events';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import keytar from 'keytar';
import { ConfigManager } from '../config/manager';

const SERVICE_NAME = 'IntimeESolutions-Agent';

interface StoredSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export class AuthManager extends EventEmitter {
  private supabase: SupabaseClient;
  private config: ConfigManager;
  private session: Session | null = null;

  constructor(config: ConfigManager) {
    super();
    this.config = config;

    const supabaseUrl = this.config.get('supabaseUrl');
    const supabaseAnonKey = this.config.get('supabaseAnonKey');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  public async initialize(): Promise<Session | null> {
    console.log('🔑 Initializing auth...');
    const stored = await this.loadStoredSession();
    if (!stored) {
      console.log('No stored session found');
      return null;
    }

    console.log('Found stored session, attempting to restore...');
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Session restore timeout')), 10000);
      });

      const sessionPromise = this.supabase.auth.setSession({
        access_token: stored.access_token,
        refresh_token: stored.refresh_token,
      });

      const { data, error } = await Promise.race([sessionPromise, timeoutPromise]);

      if (error || !data.session) {
        console.error('Session restore error:', error?.message || 'No session in response');
        await this.clearStoredSession();
        return null;
      }

      this.session = data.session;
      this.config.update({
        userId: data.session.user.id,
        rememberMe: true,
        userEmail: this.config.get('userEmail') || data.session.user.email || undefined,
      });

      await this.persistSession(data.session);
      this.emitTokenChanged();
      console.log('✅ Session restored successfully for user:', data.session.user.email);
      return data.session;
    } catch (error) {
      console.error('Failed to restore session:', error);
      await this.clearStoredSession();
      return null;
    }
  }

  public async loginWithCredentials(email: string, password: string, remember: boolean): Promise<Session> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      throw new Error(error?.message || 'Invalid email or password');
    }

    this.session = data.session;

    this.config.update({
      userId: data.session.user.id,
      userEmail: email,
      rememberMe: remember,
    });

    if (remember) {
      await this.persistSession(data.session);
    } else {
      await this.clearStoredSession();
    }

    this.emitTokenChanged();
    return data.session;
  }

  public async getAccessToken(): Promise<string | null> {
    await this.ensureFreshSession();
    return this.session?.access_token || null;
  }

  public getSession(): Session | null {
    return this.session;
  }

  public async logout() {
    this.session = null;
    await this.supabase.auth.signOut();
    await this.clearStoredSession();
    this.config.update({ userId: undefined, rememberMe: false });
  }

  private async ensureFreshSession() {
    if (!this.session) {
      await this.initialize();
    }

    if (this.session?.expires_at) {
      const expiresAt = this.session.expires_at * 1000;
      const now = Date.now();
      const refreshThreshold = expiresAt - 60 * 1000; // refresh 1 minute before expiry

      if (now >= refreshThreshold) {
        await this.refreshSession();
      }
    }
  }

  private async refreshSession() {
    const refreshToken = this.session?.refresh_token || (await this.getStoredRefreshToken());
    if (!refreshToken) {
      throw new Error('No refresh token available. Please log in again.');
    }

    const { data, error } = await this.supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session) {
      await this.clearStoredSession();
      this.session = null;
      throw new Error(error?.message || 'Failed to refresh session');
    }

    this.session = data.session;

    if (this.config.get('rememberMe')) {
      await this.persistSession(data.session);
    }

    this.emitTokenChanged();
  }

  private async persistSession(session: Session) {
    const email = this.config.get('userEmail');
    if (!email) {
      return;
    }

    if (!session.refresh_token) {
      console.warn('Session does not contain refresh token; skipping persistence.');
      return;
    }

    const stored: StoredSession = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at ? session.expires_at * 1000 : undefined,
    };

    await keytar.setPassword(SERVICE_NAME, email, JSON.stringify(stored));
  }

  private async loadStoredSession(): Promise<StoredSession | null> {
    const email = this.config.get('userEmail');
    const rememberMe = this.config.get('rememberMe');

    console.log('loadStoredSession - email:', email, 'rememberMe:', rememberMe);

    if (!email || !rememberMe) {
      console.log('Skipping load - no email or rememberMe false');
      return null;
    }

    console.log('Reading from keychain...');
    const raw = await keytar.getPassword(SERVICE_NAME, email);
    if (!raw) {
      console.log('No keychain entry found');
      return null;
    }

    console.log('Keychain entry found, parsing...');
    try {
      return JSON.parse(raw) as StoredSession;
    } catch (error) {
      console.error('Failed to parse stored session:', error);
      await keytar.deletePassword(SERVICE_NAME, email);
      return null;
    }
  }

  private async getStoredRefreshToken(): Promise<string | null> {
    const stored = await this.loadStoredSession();
    return stored?.refresh_token || null;
  }

  private async clearStoredSession() {
    const email = this.config.get('userEmail');
    if (email) {
      await keytar.deletePassword(SERVICE_NAME, email);
    }
  }

  private emitTokenChanged() {
    if (this.session?.access_token) {
      this.emit('token-changed', this.session.access_token);
    }
  }
}
