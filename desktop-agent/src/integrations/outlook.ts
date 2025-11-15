import { EventEmitter } from 'events';
import { execFile } from 'child_process';
import * as os from 'os';

const POWERSHELL_COMMAND = `
$ErrorActionPreference = 'Stop'
try {
  $outlook = New-Object -ComObject Outlook.Application
  $namespace = $outlook.GetNameSpace('MAPI')
  $today = (Get-Date).Date

  $inbox = $namespace.GetDefaultFolder(6)
  $sent = $namespace.GetDefaultFolder(5)
  $calendar = $namespace.GetDefaultFolder(9)

  $received = ($inbox.Items | Where-Object { $_.ReceivedTime -ge $today }).Count
  $sentCount = ($sent.Items | Where-Object { $_.SentOn -ge $today }).Count
  $meetings = ($calendar.Items | Where-Object { $_.Start -ge $today -and $_.Start -lt $today.AddDays(1) }).Count

  @{ sent = $sentCount; received = $received; meetings = $meetings } | ConvertTo-Json -Compress
} catch {
  @{ error = $_.Exception.Message } | ConvertTo-Json -Compress
}
`;

export interface OutlookMetrics {
  sentToday: number;
  receivedToday: number;
  meetingsToday: number;
  timestamp: string;
}

export class OutlookIntegration extends EventEmitter {
  private interval: NodeJS.Timeout | null = null;
  private latest: OutlookMetrics | null = null;
  private readonly pollIntervalMs: number;

  constructor(pollIntervalMs = 10 * 60 * 1000) {
    super();
    this.pollIntervalMs = pollIntervalMs;
  }

  public start() {
    if (os.platform() !== 'win32') {
      console.log('Outlook integration only runs on Windows. Skipping.');
      return;
    }

    this.poll();
    this.interval = setInterval(() => this.poll(), this.pollIntervalMs);
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  public getLatest(): OutlookMetrics | null {
    return this.latest;
  }

  private poll() {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', POWERSHELL_COMMAND],
      { timeout: 20000 },
      (error, stdout) => {
        if (error) {
          console.warn('Failed to collect Outlook metrics', error.message);
          return;
        }

        const output = stdout?.trim();
        if (!output) {
          return;
        }

        try {
          const parsed = JSON.parse(output);
          if (parsed?.error) {
            console.warn('Outlook metrics reported error:', parsed.error);
            return;
          }

          this.latest = {
            sentToday: Number(parsed?.sent) || 0,
            receivedToday: Number(parsed?.received) || 0,
            meetingsToday: Number(parsed?.meetings) || 0,
            timestamp: new Date().toISOString(),
          };

          this.emit('metrics', this.latest);
        } catch (parseError) {
          console.warn('Failed to parse Outlook metrics output', parseError);
        }
      }
    );
  }
}


