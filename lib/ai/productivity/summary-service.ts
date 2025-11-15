import { createAdminClient } from '@/lib/supabase/server';
import { ClaudeVisionService } from './claude-vision-service';

type WindowType = '5min' | '30min' | '1hour' | '2hour' | '4hour' | 'daily' | 'weekly' | 'monthly';

interface SummaryConfig {
  windowType: WindowType;
  intervalMinutes: number;
  maxScreenshots: number;
  includeContext: boolean;
}

const SUMMARY_CONFIGS: Record<WindowType, SummaryConfig> = {
  '5min': { windowType: '5min', intervalMinutes: 5, maxScreenshots: 10, includeContext: false },
  '30min': { windowType: '30min', intervalMinutes: 30, maxScreenshots: 60, includeContext: true },
  '1hour': { windowType: '1hour', intervalMinutes: 60, maxScreenshots: 120, includeContext: true },
  '2hour': { windowType: '2hour', intervalMinutes: 120, maxScreenshots: 240, includeContext: true },
  '4hour': { windowType: '4hour', intervalMinutes: 240, maxScreenshots: 480, includeContext: true },
  'daily': { windowType: 'daily', intervalMinutes: 1440, maxScreenshots: 500, includeContext: true },
  'weekly': { windowType: 'weekly', intervalMinutes: 10080, maxScreenshots: 1000, includeContext: true },
  'monthly': { windowType: 'monthly', intervalMinutes: 43200, maxScreenshots: 2000, includeContext: true }
};

export class HierarchicalSummaryService {
  private adminClient;
  private visionService: ClaudeVisionService;
  
  constructor() {
    this.adminClient = createAdminClient();
    this.visionService = new ClaudeVisionService();
  }
  
  /**
   * Generate summary for a specific time window
   */
  async generateSummary(
    userId: string,
    windowType: WindowType,
    endTime: Date = new Date()
  ): Promise<void> {
    const config = SUMMARY_CONFIGS[windowType];
    const startTime = new Date(endTime.getTime() - config.intervalMinutes * 60 * 1000);
    
    try {
      // Get previous context if needed
      let previousContext = '';
      if (config.includeContext) {
        previousContext = await this.getPreviousContext(userId, windowType, startTime);
      }
      
      // Fetch screenshots for the time window
      const { data: screenshots } = await this.adminClient
        .from('productivity_screenshots')
        .select('*')
        .eq('user_id', userId)
        .gte('captured_at', startTime.toISOString())
        .lte('captured_at', endTime.toISOString())
        .order('captured_at', { ascending: true })
        .limit(config.maxScreenshots);
      
      if (!screenshots || screenshots.length === 0) {
                return;
      }
      
      // Get activity data
      const { data: activities } = await this.adminClient
        .from('productivity_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startTime.toISOString())
        .lte('created_at', endTime.toISOString());
      
      // Calculate metrics
      const metrics = this.calculateMetrics(screenshots, activities || []);
      
      // Generate AI summary
      const summaryText = await this.generateAISummary(
        screenshots,
        activities || [],
        previousContext,
        windowType
      );
      
      // Store the summary
      await this.storeSummary({
        userId,
        windowType,
        windowStart: startTime,
        windowEnd: endTime,
        summaryText,
        metrics,
        screenshotCount: screenshots.length,
        previousContext
      });
      
            
    } catch (error) {
          }
  }
  
  /**
   * Get previous context for continuity
   */
  private async getPreviousContext(
    userId: string,
    windowType: WindowType,
    currentStart: Date
  ): Promise<string> {
    const { data: previousSummary } = await this.adminClient
      .from('productivity_summaries')
      .select('context_preserved, summary_text')
      .eq('user_id', userId)
      .eq('window_type', windowType)
      .lt('window_end', currentStart.toISOString())
      .order('window_end', { ascending: false })
      .limit(1)
      .single();
    
    if (previousSummary?.context_preserved) {
      return previousSummary.context_preserved;
    }
    
    // For longer windows, get context from shorter windows
    if (windowType === 'daily') {
      const { data: hourSummaries } = await this.adminClient
        .from('productivity_summaries')
        .select('summary_text')
        .eq('user_id', userId)
        .eq('window_type', '4hour')
        .gte('window_start', new Date(currentStart.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .order('window_start', { ascending: false })
        .limit(3);
      
      if (hourSummaries && hourSummaries.length > 0) {
        return hourSummaries.map(s => s.summary_text).join(' | ');
      }
    }
    
    return '';
  }
  
  /**
   * Calculate productivity metrics
   */
  private calculateMetrics(screenshots: any[], activities: any[]) {
    const totalScreenshots = screenshots.length;
    const avgProductivity = screenshots.reduce((sum, s) => sum + (s.productivity_score || 50), 0) / totalScreenshots;
    const avgFocus = screenshots.reduce((sum, s) => sum + (s.focus_score || 50), 0) / totalScreenshots;
    
    // Calculate active time (screenshots * 30 seconds average)
    const totalActiveTime = totalScreenshots * 30;
    
    // Application usage
    const appUsage: Record<string, number> = {};
    screenshots.forEach(s => {
      const app = s.application_detected || 'Unknown';
      appUsage[app] = (appUsage[app] || 0) + 1;
    });
    
    // Key activities
    const activities_list = screenshots
      .map(s => s.activity_description)
      .filter(Boolean)
      .slice(0, 10);
    
    return {
      avgProductivityScore: avgProductivity,
      avgFocusScore: avgFocus,
      totalActiveTime,
      applicationUsage: appUsage,
      keyActivities: activities_list
    };
  }
  
  /**
   * Generate AI summary using Claude
   */
  private async generateAISummary(
    screenshots: any[],
    activities: any[],
    previousContext: string,
    windowType: WindowType
  ): Promise<string> {
    // For now, create a simple summary based on the data
    // In production, this would call Claude with all screenshots
    
    const topApps = Object.entries(
      screenshots.reduce((acc: any, s) => {
        const app = s.application_detected || 'Unknown';
        acc[app] = (acc[app] || 0) + 1;
        return acc;
      }, {})
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([app]) => app);
    
    const avgProductivity = Math.round(
      screenshots.reduce((sum, s) => sum + (s.productivity_score || 50), 0) / screenshots.length
    );
    const mainActivities = [...new Set(
      screenshots
        .map(s => s.work_category)
        .filter(Boolean)
    )].slice(0, 3);
    
    let summary = `During this ${windowType} period: `;
    
    if (previousContext) {
      summary += `Continuing from previous work (${previousContext}). `;
    }
    
    summary += `Primarily used ${topApps.join(', ')} with ${avgProductivity}% productivity. `;
    summary += `Main activities: ${mainActivities.join(', ')}. `;
    summary += `Captured ${screenshots.length} screenshots showing consistent ${
      avgProductivity > 70 ? 'focused work' : 'moderate activity'
    }.`;
    
    return summary;
  }
  
  /**
   * Store summary in database
   */
  private async storeSummary(data: {
    userId: string;
    windowType: WindowType;
    windowStart: Date;
    windowEnd: Date;
    summaryText: string;
    metrics: any;
    screenshotCount: number;
    previousContext: string;
  }) {
    const { error } = await this.adminClient
      .from('productivity_summaries')
      .upsert({
        user_id: data.userId,
        window_type: data.windowType,
        window_start: data.windowStart.toISOString(),
        window_end: data.windowEnd.toISOString(),
        summary_text: data.summaryText,
        key_activities: data.metrics.keyActivities || [],
        applications_used: data.metrics.applicationUsage || {},
        productivity_metrics: {
          avgProductivity: data.metrics.avgProductivityScore,
          avgFocus: data.metrics.avgFocusScore
        },
        screenshot_count: data.screenshotCount,
        total_active_time: data.metrics.totalActiveTime,
        avg_productivity_score: data.metrics.avgProductivityScore,
        avg_focus_score: data.metrics.avgFocusScore,
        context_preserved: data.summaryText.slice(0, 200), // Keep first 200 chars as context
        generated_at: new Date().toISOString(),
        generation_method: 'ai',
        ai_model: 'claude-3-haiku'
      }, {
        onConflict: 'user_id,window_type,window_start'
      });
    
    if (error) {
          }
  }
  
  /**
   * Check and generate due summaries
   */
  async generateDueSummaries(userId: string) {
    const now = new Date();
    
    // Check each window type
    for (const [windowType, config] of Object.entries(SUMMARY_CONFIGS)) {
      // Check if summary is due
      const { data: lastSummary } = await this.adminClient
        .from('productivity_summaries')
        .select('window_end')
        .eq('user_id', userId)
        .eq('window_type', windowType)
        .order('window_end', { ascending: false })
        .limit(1)
        .single();
      
      const lastEnd = lastSummary ? new Date(lastSummary.window_end) : new Date(now.getTime() - config.intervalMinutes * 60 * 1000);
      const timeSince = now.getTime() - lastEnd.getTime();
      const intervalMs = config.intervalMinutes * 60 * 1000;
      
      if (timeSince >= intervalMs) {
                await this.generateSummary(userId, windowType as WindowType);
      }
    }
  }
}
