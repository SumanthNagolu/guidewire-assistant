import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import screenshot from 'screenshot-desktop';

interface ScreenshotOptions {
  interval: number; // in milliseconds
  quality: number; // 0-100
}

export class ScreenshotCapture extends EventEmitter {
  private interval: NodeJS.Timeout | null = null;
  private paused: boolean = false;
  private options: ScreenshotOptions;
  private storageDir: string;

  constructor(options: ScreenshotOptions) {
    super();
    this.options = options;
    this.storageDir = path.join(os.tmpdir(), 'intime-screenshots');
    this.ensureStorageDir();
  }

  private ensureStorageDir() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  private async captureScreenshot(): Promise<string | null> {
    try {
      const filename = `screenshot_${Date.now()}.jpg`;
      const filepath = path.join(this.storageDir, filename);

      // Capture primary screen (screen 0) - macOS has screens 0, 1, 2, etc.
      // For multi-screen, we capture screen 0 (primary display)
      // Future enhancement: capture all screens and stitch them
      const imgBuffer = await screenshot({
        format: 'jpg',
        quality: Math.max(10, Math.min(100, this.options.quality)),
        screen: 0 // Primary screen only for now
      } as any);
      
      if (!imgBuffer) {
        console.error('Failed to capture screenshot');
        return null;
      }

      // Save to file
      fs.writeFileSync(filepath, imgBuffer);
      
      this.emit('screenshot', {
        filepath,
        timestamp: new Date(),
        size: fs.statSync(filepath).size
      });

      return filepath;
    } catch (error) {
      console.error('Screenshot capture error:', error);
      return null;
    }
  }

  private detectActivityLevel(screenshot: any): number {
    // Simple activity detection (you'd implement image diff here)
    // For now, return random value
    return Math.floor(Math.random() * 100);
  }

  public start() {
    if (this.interval) return;

    this.interval = setInterval(async () => {
      if (!this.paused) {
        await this.captureScreenshot();
      }
    }, this.options.interval);

    console.log(`Screenshot capture started (interval: ${this.options.interval}ms)`);
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('Screenshot capture stopped');
  }

  public pause() {
    this.paused = true;
  }

  public resume() {
    this.paused = false;
  }

  public cleanupOldScreenshots(olderThanHours: number = 24) {
    const now = Date.now();
    const cutoff = now - (olderThanHours * 60 * 60 * 1000);

    fs.readdirSync(this.storageDir).forEach(file => {
      const filepath = path.join(this.storageDir, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtimeMs < cutoff) {
        fs.unlinkSync(filepath);
        console.log(`Deleted old screenshot: ${file}`);
      }
    });
  }
}

