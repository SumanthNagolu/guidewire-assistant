import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    let userId: string;
    // Check for test-key first
    if (authHeader.includes('test-key')) {
      // Testing mode - use the admin user (admin@intimesolutions.com)
      const { data: adminProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('email', 'admin@intimesolutions.com')
        .single();
      if (!adminProfile) {
        // Fallback to first user if admin not found
        const { data: profiles } = await adminClient
          .from('user_profiles')
          .select('id')
          .limit(1)
          .single();
        if (!profiles) {
          return NextResponse.json({ error: 'No user found for testing' }, { status: 404 });
    }
        userId = profiles.id;
      } else {
        userId = adminProfile.id;
      }
    } else {
      // Normal authentication flow
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
      }
      userId = user.id;
    }
    const { image, timestamp, filename } = await request.json();
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    const buffer = Buffer.from(image, 'base64');
    const filepath = `${userId}/${Date.now()}_${filename || 'screenshot.jpg'}`;
    const { error: uploadError } = await adminClient.storage
      .from('productivity-screenshots')
      .upload(filepath, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      });
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    const { data: signedData, error: signedError } = await adminClient.storage
      .from('productivity-screenshots')
      .createSignedUrl(filepath, 60 * 60 * 24);
    if (signedError) {
      throw new Error(`Signed URL error: ${signedError.message}`);
    }
    await adminClient.from('productivity_screenshots').insert({
      user_id: userId,
      screenshot_url: filepath,
      captured_at: timestamp,
      file_size: buffer.length
    });
    return NextResponse.json({
      success: true,
      message: 'Screenshot uploaded successfully',
      url: signedData?.signedUrl,
      path: filepath
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
