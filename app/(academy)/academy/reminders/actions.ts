'use server';
import { createClient } from '@/lib/supabase/server';
type ReminderActionResponse = {
  success: boolean;
  message?: string;
  optedIn: boolean;
};
export async function updateReminderSettingsAction(
  formData: FormData
): Promise<ReminderActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Unauthorized', optedIn: false };
  }
  const rawOptIn = formData.get('optedIn');
  const optedIn = rawOptIn === 'true';
  const now = new Date().toISOString();
  type ExistingSettings = {
    last_opt_in_at: string | null;
  };
  const { data: existing } = await supabase
    .from('learner_reminder_settings')
    .select('last_opt_in_at')
    .eq('user_id', user.id)
    .maybeSingle<ExistingSettings>();
  const payload = {
    user_id: user.id,
    opted_in: optedIn,
    last_opt_in_at: optedIn ? now : existing?.last_opt_in_at ?? now,
    updated_at: now,
  };
  const { error } = await (supabase
    .from('learner_reminder_settings') as any)
    .upsert(payload, { onConflict: 'user_id' });
  if (error) {
    return {
      success: false,
      optedIn: !optedIn,
      message: error.message || 'Unable to update reminder preferences.',
    };
  }
  return {
    success: true,
    optedIn,
    message: optedIn
      ? 'Reminder emails enabled. We will nudge you after 48 hours without progress.'
      : 'Reminder emails disabled. You can re-enable them anytime.',
  };
}
