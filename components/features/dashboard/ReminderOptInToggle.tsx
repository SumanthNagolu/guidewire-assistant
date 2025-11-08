'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { updateReminderSettingsAction } from '@/app/(dashboard)/dashboard/reminders/actions';

type ReminderOptInToggleProps = {
  initialOptedIn: boolean;
};

export function ReminderOptInToggle({ initialOptedIn }: ReminderOptInToggleProps) {
  const [optedIn, setOptedIn] = useState(initialOptedIn);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextValue = !optedIn;
    const formData = new FormData();
    formData.append('optedIn', String(nextValue));

    startTransition(async () => {
      const result = await updateReminderSettingsAction(formData);

      if (!result.success) {
        toast.error(result.message ?? 'Unable to update reminders.');
        return;
      }

      setOptedIn(result.optedIn);
      toast.success(result.message ?? 'Reminder preference updated.');
    });
  };

  return (
    <Button
      type="button"
      variant={optedIn ? 'secondary' : 'outline'}
      onClick={handleToggle}
      disabled={isPending}
      className="w-full sm:w-auto"
    >
      {isPending
        ? 'Saving…'
        : optedIn
        ? 'Disable Reminder Emails'
        : 'Enable Reminder Emails'}
    </Button>
  );
}

export default ReminderOptInToggle;

