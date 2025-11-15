import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import * as crypto from 'crypto';
/**
 * Screenshot capture endpoint
 * Receives screenshots from the lightweight capture agent
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      image, 
      userId, 
      timestamp: captureTimestamp, 
      screenHash, 
      idleDetected,
      metadata 
    } = await request.json();
    // Validate required fields
    if (!image || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: image and userId' 
      }, { status: 400 });
    }
    
    const adminClient = createAdminClient();
    // Get user by email or ID
    let user;
    if (userId.includes('@')) {
      // Lookup by email
      const { data, error } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('email', userId)
        .single();
      if (error || !data) {
        return NextResponse.json({ 
          error: 'User not found',
          details: error?.message 
        }, { status: 404 });
      }
      user = data;
    } else {
      // Use as ID directly
      user = { id: userId };
    }
    // Decode image
    const imageBuffer = Buffer.from(image, 'base64');
    // Verify hash if provided
    if (screenHash) {
      const calculatedHash = crypto
        .createHash('md5')
        .update(imageBuffer)
        .digest('hex');
      if (calculatedHash !== screenHash) {
        // Hash mismatch - potential security issue
      }
    }
    // Upload to Supabase storage
    const uploadTimestamp = Date.now();
    const filename = user.id + '/' + uploadTimestamp + '.jpg';
    const { error: uploadError } = await adminClient.storage
      .from('productivity-screenshots')
      .upload(filename, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    if (uploadError) {
      // Continue anyway - we can still save the metadata
    }
    // Save screenshot metadata
    const { data: screenshot, error: dbError } = await adminClient
      .from('productivity_screenshots')
      .insert({
        user_id: user.id,
        screenshot_url: filename,
        captured_at: captureTimestamp || new Date().toISOString(),
        processed: false,
        idle_detected: idleDetected || false,
        screen_hash: screenHash,
        file_size: imageBuffer.length,
        metadata: {
          ...metadata,
          source: 'capture-agent'
        }
      })
      .select()
      .single();
    if (dbError) {
      return NextResponse.json({ 
        error: 'Failed to save screenshot',
        details: dbError.message 
      }, { status: 500 });
    }
    // Update user presence
    const currentDate = new Date().toISOString().split('T')[0];
    await adminClient
      .from('productivity_presence')
      .upsert({
        user_id: user.id,
        date: currentDate,
        last_seen_at: timestamp || new Date().toISOString(),
        current_status: idleDetected ? 'idle' : 'active',
        status_updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      });
    // Check if we should trigger batch processing
    const shouldProcess = await checkBatchThreshold(adminClient, user.id);
    return NextResponse.json({
      success: true,
      screenshotId: screenshot.id,
      message: 'Screenshot captured successfully',
      shouldProcess
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to process screenshot',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
/**
 * Check if we should trigger batch processing
 */
async function checkBatchThreshold(adminClient: any, userId: string): Promise<boolean> {
  // Check unprocessed screenshot count
  const { count } = await adminClient
    .from('productivity_screenshots')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('processed', false);
  // Trigger if we have 10+ unprocessed screenshots
  return count >= 10;
}
/**
 * GET endpoint for checking capture status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ 
      error: 'userId is required' 
    }, { status: 400 });
  }
  const adminClient = createAdminClient();
  // Get recent capture stats
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentScreenshots, count } = await adminClient
    .from('productivity_screenshots')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('captured_at', oneHourAgo);
  const stats = {
    recentCount: count || 0,
    lastCapture: recentScreenshots?.[0]?.captured_at || null,
    unprocessedCount: recentScreenshots?.filter(s => !s.processed).length || 0,
    idleCount: recentScreenshots?.filter(s => s.idle_detected).length || 0
  };
  return NextResponse.json({
    success: true,
    stats
  });
}
