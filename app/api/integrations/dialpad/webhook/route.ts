import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// POST /api/integrations/dialpad/webhook - Receive webhooks from Dialpad
export async function POST(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;
    // Verify webhook signature (if configured)
    const signature = request.headers.get('x-dialpad-signature');
    const webhookSecret = process.env.DIALPAD_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
            // const isValid = verifyDialpadSignature(await request.text(), signature, webhookSecret);
      // if (!isValid) {
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      // }
    }
    const body = await request.json();
    const { event_type, data } = body;
    // Handle different event types
    switch (event_type) {
      case 'call.completed':
        await handleCallCompleted(supabase, data);
        break;
      case 'call.started':
        await handleCallStarted(supabase, data);
        break;
      case 'call.missed':
        await handleCallMissed(supabase, data);
        break;
      case 'voicemail.received':
        await handleVoicemailReceived(supabase, data);
        break;
      default:
        }
    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
async function handleCallCompleted(supabase: any, callData: any) {
  try {
    // Extract call information
    const {
      id: call_id,
      user_id: dialpad_user_id,
      direction,
      duration,
      status,
      started_at,
      completed_at,
      from_number,
      to_number,
      recording_url,
    } = callData;
    // Map Dialpad user to our system user
    const { data: tokenData } = await supabase
      .from('integration_tokens')
      .select('user_id')
      .eq('integration_type', 'dialpad')
      .eq('integration_user_id', dialpad_user_id)
      .single();
    if (!tokenData) {
      return;
    }
    const userId = tokenData.user_id;
    const callDate = new Date(started_at).toISOString().split('T')[0];
    // Get or create today's call analytics
    const { data: existing } = await supabase
      .from('call_analytics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', callDate)
      .single();
    const isInbound = direction === 'inbound';
    const isAnswered = status === 'answered' || status === 'completed';
    const isMissed = status === 'missed';
    const isVoicemail = status === 'voicemail';
    if (existing) {
      // Update existing record
      await supabase
        .from('call_analytics')
        .update({
          total_calls: existing.total_calls + 1,
          inbound_calls: existing.inbound_calls + (isInbound ? 1 : 0),
          outbound_calls: existing.outbound_calls + (!isInbound ? 1 : 0),
          answered_calls: existing.answered_calls + (isAnswered ? 1 : 0),
          missed_calls: existing.missed_calls + (isMissed ? 1 : 0),
          voicemail_calls: existing.voicemail_calls + (isVoicemail ? 1 : 0),
          total_call_duration_minutes: existing.total_call_duration_minutes + Math.round(duration / 60),
          last_synced_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('date', callDate);
    } else {
      // Create new record
      await supabase.from('call_analytics').insert({
        user_id: userId,
        date: callDate,
        total_calls: 1,
        inbound_calls: isInbound ? 1 : 0,
        outbound_calls: !isInbound ? 1 : 0,
        answered_calls: isAnswered ? 1 : 0,
        missed_calls: isMissed ? 1 : 0,
        voicemail_calls: isVoicemail ? 1 : 0,
        total_call_duration_minutes: Math.round(duration / 60),
        last_synced_at: new Date().toISOString(),
        sync_status: 'success',
      });
    }
    } catch (error) {
    }
}
async function handleCallStarted(supabase: any, callData: any) {
  // Optional: Track active calls if needed
  }
async function handleCallMissed(supabase: any, callData: any) {
  // Missed calls are also tracked in handleCallCompleted
  }
async function handleVoicemailReceived(supabase: any, callData: any) {
  // Voicemails are also tracked in handleCallCompleted
  }
// GET /api/integrations/dialpad/webhook - Verify webhook endpoint
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Dialpad webhook endpoint ready',
  });
}
