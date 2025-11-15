import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
/**
 * Simple endpoint to receive screenshots and save to DB
 * NO AI PROCESSING - just storage for batch processing
 */
export async function POST(request: NextRequest) {
  try {
    const { image, timestamp, userId: userIdentifier, application } = await request.json();
    if (!image || !userIdentifier) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    const adminClient = createAdminClient();
    // Get user ID (support email or UUID)
    let userId = userIdentifier;
    if (userIdentifier.includes('@')) {
      const { data: profile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('email', userIdentifier)
        .single();
      if (profile) {
        userId = profile.id;
      }
    }
    // Upload screenshot to storage
    const filename = `${userId}/${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('productivity-screenshots')
      .upload(filename, Buffer.from(image, 'base64'), {
        contentType: 'image/jpeg',
        upsert: true
      });
    if (uploadError) {
      return NextResponse.json({ 
        error: 'Failed to upload screenshot' 
      }, { status: 500 });
    }
    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('productivity-screenshots')
      .getPublicUrl(filename);
    // Save to database with status 'pending' for batch processing
    const { data: screenshot, error: dbError } = await adminClient
      .from('productivity_screenshots')
      .insert({
        user_id: userId,
        screenshot_url: publicUrl,
        storage_path: filename,
        captured_at: timestamp || new Date().toISOString(),
        application_detected: application,
        processing_status: 'pending', // Mark for batch processing
        file_size: Math.round(image.length * 0.75) // Approximate size
      })
      .select()
      .single();
    if (dbError) {
      return NextResponse.json({ 
        error: 'Failed to save screenshot metadata' 
      }, { status: 500 });
    }
    // Update presence tracking (first_seen_at and last_seen_at)
    const capturedDate = timestamp ? new Date(timestamp) : new Date();
    const currentDate = capturedDate.toISOString().split('T')[0];
    const capturedTime = capturedDate.toISOString();
    // Get existing presence for today and recent screenshots for idle detection
    const { data: existingPresence } = await adminClient
      .from('productivity_presence')
      .select('first_seen_at, last_seen_at')
      .eq('user_id', userId)
      .eq('date', currentDate)
      .maybeSingle();
    // Check for idle time - get last few screenshots to compare
    const { data: recentScreenshots } = await adminClient
      .from('productivity_screenshots')
      .select('screenshot_url, captured_at, application_detected')
      .eq('user_id', userId)
      .order('captured_at', { ascending: false })
      .limit(3);
    // Simple idle detection: if application hasn't changed in last 3 screenshots
    const isLikelyIdle = recentScreenshots && recentScreenshots.length >= 3 &&
      recentScreenshots.every(s => s.application_detected === application);
    // Calculate idle minutes if screenshots are identical
    let idleMinutesToAdd = 0;
    if (isLikelyIdle && existingPresence?.last_seen_at) {
      const minutesSinceLastActivity = Math.floor(
        (new Date(capturedTime).getTime() - new Date(existingPresence.last_seen_at).getTime()) / 60000
      );
      if (minutesSinceLastActivity >= 1) {
        idleMinutesToAdd = minutesSinceLastActivity;
      }
    }
    // Update presence with timestamps
    const { error: presenceError } = await adminClient
      .from('productivity_presence')
      .upsert({
        user_id: userId,
        date: currentDate,
        first_seen_at: existingPresence?.first_seen_at || capturedTime, // Keep first, don't overwrite
        last_seen_at: capturedTime, // Always update to latest
        current_status: isLikelyIdle ? 'idle' : 'active',
        status_updated_at: capturedTime,
        work_pattern: {
          ...(existingPresence?.work_pattern || {}),
          idle_periods: isLikelyIdle ? [
            ...(existingPresence?.work_pattern?.idle_periods || []),
            { start: existingPresence?.last_seen_at, end: capturedTime, minutes: idleMinutesToAdd }
          ] : (existingPresence?.work_pattern?.idle_periods || [])
        }
      }, {
        onConflict: 'user_id,date'
      });
    if (presenceError) {
      // Non-critical, continue
    } else {
      }
    return NextResponse.json({
      success: true,
      screenshotId: screenshot.id,
      status: 'pending',
      message: 'Screenshot queued for batch AI processing'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}
