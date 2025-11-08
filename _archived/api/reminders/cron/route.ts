import { NextResponse } from 'next/server';
import { sendStalledLearnerReminders } from '@/modules/reminders/service';

const UNAUTHORIZED_RESPONSE = NextResponse.json(
  { success: false, message: 'Unauthorized' },
  { status: 401 }
);

export async function POST(request: Request) {
  const secret = process.env.REMINDER_CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { success: false, message: 'REMINDER_CRON_SECRET is not configured.' },
      { status: 500 }
    );
  }

  const providedSecret =
    request.headers.get('x-cron-secret') ??
    request.headers.get('authorization')?.replace(/Bearer\s+/i, '') ??
    '';

  if (providedSecret !== secret) {
    return UNAUTHORIZED_RESPONSE;
  }

  try {
    const summary = await sendStalledLearnerReminders();

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error running reminder job.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

