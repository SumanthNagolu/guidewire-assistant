import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { ClaudeVisionService } from '@/lib/ai/productivity/claude-vision-service';
import { WorkSummaryGenerator } from '@/lib/ai/productivity/summary-generator';
import { HierarchicalSummaryService } from '@/lib/ai/productivity/summary-service';
const claudeVision = new ClaudeVisionService();
const summaryGenerator = new WorkSummaryGenerator();
const hierarchicalSummaryService = new HierarchicalSummaryService();
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { image, timestamp, userId: userIdentifier, application } = await request.json();
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    if (!userIdentifier) {
      return NextResponse.json({ error: 'No userId provided' }, { status: 400 });
    }
    const adminClient = createAdminClient();
    // Get user profile for role-specific analysis
    // Support both email and UUID lookup
    let profile, profileError, userId;
    // Check if userIdentifier is an email or UUID
    const isEmail = userIdentifier.includes('@');
    if (isEmail) {
      const result = await adminClient
        .from('user_profiles')
        .select('id, industry_role, user_tags, first_name, last_name, email')
        .eq('email', userIdentifier)
        .single();
      profile = result.data;
      profileError = result.error;
      // Get actual UUID for database operations
      userId = profile?.id || userIdentifier;
    } else {
      const result = await adminClient
        .from('user_profiles')
        .select('id, industry_role, user_tags, first_name, last_name, email')
        .eq('id', userIdentifier)
        .single();
      profile = result.data;
      profileError = result.error;
      userId = userIdentifier;
    }
    if (profileError || !profile) {
      return NextResponse.json({ 
        error: 'User not found', 
        details: profileError?.message,
        searchedFor: userIdentifier
      }, { status: 404 });
    }
    
    // Upload screenshot to Supabase storage
    const screenshotFilename = `${userId}/${Date.now()}.jpg`;
    const imageBuffer = Buffer.from(image, 'base64');
    const { error: uploadError } = await adminClient.storage
      .from('productivity-screenshots')
      .upload(screenshotFilename, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    if (uploadError) {
      // Continue with analysis even if upload fails
    }
    // Save screenshot record to database
    const { data: screenshot, error: screenshotError } = await adminClient
      .from('productivity_screenshots')
      .insert({
        user_id: userId,
        screenshot_url: screenshotFilename,
        captured_at: timestamp,
        ai_processed: false,
        processing_status: 'processing',
        file_size: imageBuffer.length
      })
      .select()
      .single();
    if (screenshotError) {
      return NextResponse.json({ error: 'Failed to save screenshot' }, { status: 500 });
    }
    // Analyze with Claude Vision
    const analysisStartTime = Date.now();
    const analysis = await claudeVision.analyzeScreenshot(
      image,
      profile.industry_role || 'bench_resource',
      profile.user_tags || [],
      application // Pass application name for better mock data
    );
    const analysisTime = Date.now() - analysisStartTime;
    // Store analysis results
    const { data: aiAnalysis, error: analysisError } = await adminClient
      .from('productivity_ai_analysis')
      .insert({
        screenshot_id: screenshot.id,
        user_id: userId,
        application_detected: analysis.application,
        window_title: analysis.windowTitle,
        activity_description: analysis.activity,
        work_category: analysis.category,
        productivity_score: analysis.productivityScore,
        focus_score: analysis.focusScore,
        project_context: analysis.projectContext,
        client_context: analysis.clientContext,
        detected_entities: analysis.detectedEntities,
        ai_model: 'claude-3-opus',
        ai_confidence: analysis.confidence,
        processing_time_ms: analysisTime
      })
      .select()
      .single();
    if (analysisError) {
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 });
    }
    // Update screenshot as processed
    await adminClient
      .from('productivity_screenshots')
      .update({ 
        ai_processed: true, 
        processing_status: 'completed' 
      })
      .eq('id', screenshot.id);
    // Update presence tracking with first_seen_at and last_seen_at
    const currentDate = new Date().toISOString().split('T')[0];
    const currentStatus = analysis.category === 'break' || analysis.category === 'idle' ? 'idle' : 'active';
    // Get existing presence to preserve first_seen_at
    const { data: existingPresence } = await adminClient
      .from('productivity_presence')
      .select('first_seen_at')
      .eq('user_id', userId)
      .eq('date', currentDate)
      .maybeSingle();
    const { error: presenceError } = await adminClient
      .from('productivity_presence')
      .upsert({
        user_id: userId,
        date: currentDate,
        first_seen_at: existingPresence?.first_seen_at || timestamp, // Keep first, don't overwrite
        last_seen_at: timestamp, // Always update to latest
        current_status: currentStatus,
        status_updated_at: timestamp
      }, {
        onConflict: 'user_id,date'
      });
    if (presenceError) {
      // Non-critical, continue
    }
    // Check if we should generate a summary (every 5 minutes)
    const shouldGenerateSummary = await checkSummaryInterval(userId, adminClient);
    if (shouldGenerateSummary) {
      await generateAndStoreSummary(userId, profile.industry_role || 'bench_resource', adminClient);
    }
    // Generate hierarchical summaries (async, don't wait)
    hierarchicalSummaryService.generateDueSummaries(userId).catch(error => {
      });
    const totalTime = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      analysis: {
        id: aiAnalysis.id,
        application: aiAnalysis.application_detected,
        category: aiAnalysis.work_category,
        productivityScore: aiAnalysis.productivity_score,
        activity: aiAnalysis.activity_description
      },
      summaryGenerated: shouldGenerateSummary,
      processingTime: totalTime
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
async function checkSummaryInterval(userId: string, adminClient: any): Promise<boolean> {
  try {
    const { data: lastSummary } = await adminClient
      .from('productivity_work_summaries')
      .select('generated_at')
      .eq('user_id', userId)
      .eq('time_window', '30min')
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();
    if (!lastSummary) {
      return true;
    }
    const lastGenerated = new Date(lastSummary.generated_at);
    const minutesSince = (Date.now() - lastGenerated.getTime()) / 60000;
    return minutesSince >= 5; // Generate every 5 minutes
  } catch (error) {
    return false;
  }
}
async function generateAndStoreSummary(userId: string, userRole: string, adminClient: any) {
  try {
    // Get recent analyses (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: analyses, error: analysesError } = await adminClient
      .from('productivity_ai_analysis')
      .select('*')
      .eq('user_id', userId)
      .gte('analyzed_at', thirtyMinutesAgo)
      .order('analyzed_at', { ascending: false });
    if (analysesError) {
      return;
    }
    if (!analyses || analyses.length === 0) {
      return;
    }
    // Generate summary using AI
    const summary = await summaryGenerator.generateSummary(
      analyses,
      '30min',
      userRole
    );
    // Store summary in database
    const { error: summaryError } = await adminClient
      .from('productivity_work_summaries')
      .upsert({
        user_id: userId,
        summary_date: new Date().toISOString().split('T')[0],
        time_window: '30min',
        total_productive_minutes: summary.totalProductiveMinutes,
        total_break_minutes: summary.totalBreakMinutes,
        total_meeting_minutes: summary.totalMeetingMinutes,
        category_breakdown: summary.categoryBreakdown,
        application_breakdown: summary.applicationBreakdown,
        ai_summary: summary.aiSummary,
        key_accomplishments: summary.keyAccomplishments,
        improvement_suggestions: summary.improvementSuggestions,
        generated_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id,summary_date,time_window'
      });
    if (summaryError) {
      } else {
      }
  } catch (error) {
    }
}
