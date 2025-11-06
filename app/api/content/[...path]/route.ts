import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

/**
 * Content Delivery API
 * Generates signed URLs for content stored in Supabase Storage
 * 
 * Usage:
 * GET /api/content/CC/cc-01-001/slides.pdf
 * GET /api/content/CC/cc-01-001/demo.mp4
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { path: pathSegments } = await params;

    // Path format: [product_code, topic_code, filename]
    // Example: CC/cc-01-001/slides.pdf
    if (!pathSegments || pathSegments.length < 3) {
      return Response.json(
        { success: false, error: 'Invalid path. Format: /api/content/{product}/{topic}/{filename}' },
        { status: 400 }
      );
    }

    const [productCode, topicCode, ...filenameParts] = pathSegments;
    const filename = filenameParts.join('/'); // Handle filenames with slashes

    // Construct storage path
    const storagePath = `${productCode}/${topicCode}/${filename}`;

    console.log('[Content API] Generating signed URL for:', storagePath);

    // Generate signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('course-content')
      .createSignedUrl(storagePath, 3600);

    if (error) {
      console.error('[Content API] Error generating signed URL:', error);
      return Response.json(
        { 
          success: false, 
          error: 'Failed to generate content URL',
          details: error.message 
        },
        { status: 500 }
      );
    }

    if (!data?.signedUrl) {
      return Response.json(
        { success: false, error: 'Signed URL not generated' },
        { status: 500 }
      );
    }

    // Return signed URL with cache headers
    return Response.json(
      {
        success: true,
        data: {
          signedUrl: data.signedUrl,
          path: storagePath,
          expiresIn: 3600, // 1 hour
        },
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=3000', // Cache for 50 minutes (before URL expires)
        },
      }
    );
  } catch (error) {
    console.error('[Content API] Unexpected error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

