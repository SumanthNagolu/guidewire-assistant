import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    const { email, password } = loginSchema.parse(payload);
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session || !data.user) {
      return NextResponse.json(
        {
          success: false,
          message: error?.message ?? 'Authentication failed',
        },
        { status: 401 }
      );
    }
    const { session, user } = data;
    return NextResponse.json({
      success: true,
      token: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          issues: error.issues,
        },
        { status: 400 }
      );
    }
    logger.error('Auth login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
