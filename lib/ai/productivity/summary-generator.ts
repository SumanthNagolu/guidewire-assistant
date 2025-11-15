import Anthropic from '@anthropic-ai/sdk';
import { ScreenshotAnalysis } from './claude-vision-service';

export interface WorkSummary {
  timeWindow: string;
  totalProductiveMinutes: number;
  totalBreakMinutes: number;
  totalMeetingMinutes: number;
  categoryBreakdown: Record<string, number>;
  applicationBreakdown: Record<string, number>;
  aiSummary: string;
  keyAccomplishments: string[];
  improvementSuggestions: string[];
}

interface ActivityMetrics {
  productive: number;
  breaks: number;
  meetings: number;
  avgProductivityScore: number;
  avgFocusScore: number;
}

export class WorkSummaryGenerator {
  private claude: Anthropic;
  
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  
  async generateSummary(
    analyses: any[],
    timeWindow: string,
    userRole: string
  ): Promise<WorkSummary> {
    if (!analyses || analyses.length === 0) {
      return this.getEmptySummary(timeWindow);
    }
    
    // Group activities by category and application
    const categoryBreakdown = this.groupByCategory(analyses);
    const applicationBreakdown = this.groupByApplication(analyses);
    
    // Calculate productivity metrics
    const metrics = this.calculateMetrics(analyses);
    
    // Generate natural language summary using Claude Haiku (cheaper)
    const aiSummary = await this.generateNaturalSummary(
      analyses,
      categoryBreakdown,
      userRole,
      timeWindow
    );
    
    // Identify key accomplishments
    const accomplishments = this.extractAccomplishments(analyses);
    
    // Generate improvement suggestions
    const suggestions = this.generateSuggestions(metrics, userRole, analyses);
    
    return {
      timeWindow,
      totalProductiveMinutes: metrics.productive,
      totalBreakMinutes: metrics.breaks,
      totalMeetingMinutes: metrics.meetings,
      categoryBreakdown,
      applicationBreakdown,
      aiSummary,
      keyAccomplishments: accomplishments,
      improvementSuggestions: suggestions
    };
  }
  
  private groupByCategory(analyses: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    analyses.forEach(analysis => {
      const category = analysis.work_category || 'unknown';
      // Each analysis represents ~30 seconds = 0.5 minutes
      breakdown[category] = (breakdown[category] || 0) + 0.5;
    });
    
    return breakdown;
  }
  
  private groupByApplication(analyses: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    analyses.forEach(analysis => {
      const app = analysis.application_detected || 'Unknown';
      // Each analysis represents ~30 seconds = 0.5 minutes
      breakdown[app] = (breakdown[app] || 0) + 0.5;
    });
    
    return breakdown;
  }
  
  private calculateMetrics(analyses: any[]): ActivityMetrics {
    let productive = 0;
    let breaks = 0;
    let meetings = 0;
    let totalProductivityScore = 0;
    let totalFocusScore = 0;
    
    analyses.forEach(analysis => {
      const category = analysis.work_category || 'research';
      const productivityScore = analysis.productivity_score || 50;
      const focusScore = analysis.focus_score || 50;
      
      // Each analysis is ~30 seconds = 0.5 minutes
      if (category === 'break' || category === 'idle') {
        breaks += 0.5;
      } else if (category === 'meeting') {
        meetings += 0.5;
        productive += 0.5; // Meetings count as productive
      } else {
        productive += 0.5;
      }
      
      totalProductivityScore += productivityScore;
      totalFocusScore += focusScore;
    });
    
    return {
      productive: Math.round(productive),
      breaks: Math.round(breaks),
      meetings: Math.round(meetings),
      avgProductivityScore: Math.round(totalProductivityScore / analyses.length),
      avgFocusScore: Math.round(totalFocusScore / analyses.length)
    };
  }
  
  private async generateNaturalSummary(
    analyses: any[],
    breakdown: Record<string, number>,
    role: string,
    timeWindow: string
  ): Promise<string> {
    try {
      // Create a timeline of activities
      const timeline = this.createTimeline(analyses);
      
      // Prepare context for Claude
      const topCategories = Object.entries(breakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat, mins]) => `${cat}: ${Math.round(mins)} min`)
        .join(', ');
      
      const prompt = `Generate a professional, concise work summary for a ${role.replace('_', ' ')}.

**Time Period**: ${timeWindow}
**Activity Breakdown**: ${topCategories}
**Timeline**: ${JSON.stringify(timeline.slice(0, 10))}

**Instructions**:
1. Write 2-3 sentences summarizing main activities
2. Focus on accomplishments and progress
3. Mention key tools/applications used
4. Keep tone professional and positive
5. Be specific about what was done, not just "working"

**Example Good Summary**:
"Focused on client proposal development using PowerPoint and Excel, spending 45 minutes creating financial projections. Reviewed 3 candidate profiles on LinkedIn and scheduled 2 interviews via email. Brief meeting to discuss Q4 pipeline strategy."

**Example Bad Summary**:
"User was working on various tasks throughout the period."

Generate the summary now (2-3 sentences max):`;
      
      const response = await this.claude.messages.create({
        model: "claude-3-haiku-20240307", // Using Haiku for cost efficiency
        max_tokens: 200,
        temperature: 0.5,
        messages: [{ role: "user", content: prompt }]
      });
      
      let summary = response.content[0].text.trim();
      
      // Clean up any quotes or formatting
      summary = summary.replace(/^["']|["']$/g, '');
      
      return summary;
    } catch (error) {
            
      // Fallback to template-based summary
      const topCategory = Object.entries(breakdown)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (!topCategory) {
        return `No significant activity detected during this ${timeWindow} period.`;
      }
      
      const [category, minutes] = topCategory;
      return `Spent ${Math.round(minutes)} minutes on ${category.replace('_', ' ')} activities.`;
    }
  }
  
  private createTimeline(analyses: any[]): Array<{time: string, activity: string, app: string}> {
    return analyses
      .slice(0, 20) // Limit to last 20 for summary
      .map(analysis => ({
        time: new Date(analysis.analyzed_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        activity: analysis.activity_description || 'Working',
        app: analysis.application_detected || 'Unknown'
      }));
  }
  
  private extractAccomplishments(analyses: any[]): string[] {
    const accomplishments: string[] = [];
    
    // Look for high-productivity activities
    const productiveActivities = analyses
      .filter(a => (a.productivity_score || 0) >= 75)
      .filter(a => a.work_category !== 'break' && a.work_category !== 'idle');
    
    if (productiveActivities.length > 0) {
      // Group by project/client context
      const byContext: Record<string, any[]> = {};
      
      productiveActivities.forEach(activity => {
        const context = activity.project_context || activity.client_context || 'general';
        if (!byContext[context]) {
          byContext[context] = [];
        }
        byContext[context].push(activity);
      });
      
      // Create accomplishment statements
      Object.entries(byContext).forEach(([context, activities]) => {
        if (activities.length >= 3) { // At least 90 seconds of focused work
          const mainActivity = activities[0].activity_description;
          if (mainActivity && context !== 'general') {
            accomplishments.push(`Focused work on ${context}: ${mainActivity}`);
          }
        }
      });
    }
    
    // Limit to top 3 accomplishments
    return accomplishments.slice(0, 3);
  }
  
  private generateSuggestions(
    metrics: ActivityMetrics,
    userRole: string,
    analyses: any[]
  ): string[] {
    const suggestions: string[] = [];
    
    // Check productivity score
    if (metrics.avgProductivityScore < 60) {
      suggestions.push('Consider blocking dedicated focus time to increase productivity');
    }
    
    // Check focus score
    if (metrics.avgFocusScore < 60) {
      suggestions.push('Try minimizing context switching by closing unnecessary applications');
    }
    
    // Check break time
    const breakRatio = metrics.breaks / (metrics.productive + metrics.breaks);
    if (breakRatio < 0.1 && metrics.productive > 60) {
      suggestions.push('Remember to take regular breaks to maintain sustained productivity');
    }
    
    // Role-specific suggestions
    if (userRole === 'bench_resource') {
      const learningTime = analyses.filter(a => 
        ['training', 'certification', 'practice', 'learning'].includes(a.work_category)
      ).length * 0.5;
      
      if (learningTime < 30) {
        suggestions.push('Aim for at least 30 minutes of focused learning time per day');
      }
    }
    
    if (userRole === 'sales_executive') {
      const clientTime = analyses.filter(a => 
        a.work_category === 'client_communication'
      ).length * 0.5;
      
      if (clientTime < 20) {
        suggestions.push('Increase client engagement time to boost pipeline development');
      }
    }
    
    // Limit to top 3 suggestions
    return suggestions.slice(0, 3);
  }
  
  private getEmptySummary(timeWindow: string): WorkSummary {
    return {
      timeWindow,
      totalProductiveMinutes: 0,
      totalBreakMinutes: 0,
      totalMeetingMinutes: 0,
      categoryBreakdown: {},
      applicationBreakdown: {},
      aiSummary: `No activity data available for this ${timeWindow} period.`,
      keyAccomplishments: [],
      improvementSuggestions: []
    };
  }
}



