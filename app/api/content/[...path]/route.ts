import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';
/**
 * Content Delivery API
 * Generates signed URLs for content stored in Supabase Storage
 * 
 * Usage:
 * GET /api/content/CC/cc-01-001/slides.pdf
 * GET /api/content/CC/cc-01-001/demo.mp4
 * 
 * Security:
 * - Strict regex validation on all path segments
 * - No path traversal allowed (../, ./, //)
 * - Product codes: 2-6 uppercase letters (CC, PC, BC, FW, COMMON)
 * - Topic codes: lowercase product-number-number (cc-01-001)
 * - Filenames: alphanumeric, dots, dashes, underscores only
 */
// Validation patterns (strict)
const PRODUCT_CODE_PATTERN = /^[A-Z]{2,6}$/; // CC, PC, BC, FW, COMMON
const TOPIC_CODE_PATTERN = /^[a-z]{2,6}-\d{2}-\d{3}$/; // cc-01-001, common-001
const FILENAME_PATTERN = /^[a-zA-Z0-9._-]+$/; // Safe filename characters only
/**
 * Validates path segment against security requirements
 * Prevents: path traversal, directory traversal, control characters, encoded attacks
 */
function isValidPathSegment(segment: string, pattern: RegExp, name: string): { valid: boolean; error?: string } {
  // Check for null/undefined
  if (!segment || typeof segment !== 'string') {
    return { valid: false, error: `${name} is required` };
  }
  // Check for path traversal patterns
  if (segment.includes('..') || segment.includes('./') || segment.includes('//')) {
    return { valid: false, error: `${name} contains invalid path characters` };
  }
  // Check for control characters and encoded sequences
  if (/[\x00-\x1F\x7F%]/.test(segment)) {
    return { valid: false, error: `${name} contains control characters or encoded sequences` };
  }
  // Check against allowed pattern
  if (!pattern.test(segment)) {
    return { valid: false, error: `${name} format is invalid` };
  }
  return { valid: true };
}
/**
 * Sanitizes filename by removing/replacing unsafe characters
 */
function sanitizeFilename(filename: string): string {
  // Remove any path separators
  filename = filename.replace(/[/\\]/g, '-');
  // Remove control characters
  filename = filename.replace(/[\x00-\x1F\x7F]/g, '');
  // Remove dangerous patterns
  filename = filename.replace(/\.\./g, '');
  // Only allow safe characters
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return filename;
}
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
    // SECURITY: Strict validation on all path segments
    // Validate product code
    const productValidation = isValidPathSegment(productCode, PRODUCT_CODE_PATTERN, 'Product code');
    if (!productValidation.valid) {
      logger.warn('[Content API] Invalid product code:', productCode);
      return Response.json(
        { success: false, error: productValidation.error },
        { status: 400 }
      );
    }
    // Validate topic code
    const topicValidation = isValidPathSegment(topicCode, TOPIC_CODE_PATTERN, 'Topic code');
    if (!topicValidation.valid) {
      logger.warn('[Content API] Invalid topic code:', topicCode);
      return Response.json(
        { success: false, error: topicValidation.error },
        { status: 400 }
      );
    }
    // Validate and sanitize filename
    const rawFilename = filenameParts.join('-'); // Join with dash instead of slash
    const filename = sanitizeFilename(rawFilename);
    if (!filename || !FILENAME_PATTERN.test(filename)) {
      logger.warn('[Content API] Invalid filename:', rawFilename);
      return Response.json(
        { success: false, error: 'Filename contains invalid characters' },
        { status: 400 }
      );
    }
    // Construct storage path (now guaranteed safe)
    const storagePath = `${productCode}/${topicCode}/${filename}`;
    logger.info('[Content API] Generating signed URL for:', storagePath);
    // Generate signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('guidewire-assistant-training-content')
      .createSignedUrl(storagePath, 3600);
    if (error) {
      logger.error('[Content API] Error generating signed URL:', error);
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
    logger.error('[Content API] Unexpected error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
