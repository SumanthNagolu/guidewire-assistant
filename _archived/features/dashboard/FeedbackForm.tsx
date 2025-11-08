'use client';

import { useState, useTransition } from 'react';
import { submitWeeklyFeedbackAction } from '@/modules/feedback/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type FeedbackFormProps = {
  lastSubmittedAt?: string | null;
};

export function FeedbackForm({ lastSubmittedAt }: FeedbackFormProps) {
  const [isPending, startTransition] = useTransition();
  const [sentiment, setSentiment] = useState('');
  const [confidence, setConfidence] = useState('');
  const [biggestWin, setBiggestWin] = useState('');
  const [blocker, setBlocker] = useState('');
  const [helpRequested, setHelpRequested] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('sentiment', sentiment);
    formData.append('confidence_level', confidence);
    formData.append('biggest_win', biggestWin);
    formData.append('biggest_blocker', blocker);
    formData.append('help_requested', helpRequested);

    startTransition(async () => {
      const result = await submitWeeklyFeedbackAction(formData);

      if (!result.success) {
        toast.error(result.message ?? 'Unable to submit feedback.');
        return;
      }

      toast.success(result.message ?? 'Feedback saved.');
      setBiggestWin('');
      setBlocker('');
      setHelpRequested('');
      setSentiment('');
      setConfidence('');
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>How was your momentum this week?</Label>
          <Select
            value={sentiment}
            onValueChange={setSentiment}
            required
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a vibe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="positive">🚀 On fire</SelectItem>
              <SelectItem value="neutral">⚖️ Steady</SelectItem>
              <SelectItem value="negative">🛑 Stalled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Confidence in hitting your next milestone?</Label>
          <Select
            value={confidence}
            onValueChange={setConfidence}
            required
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pick a level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High – I&apos;m ready</SelectItem>
              <SelectItem value="medium">Medium – I&apos;m getting there</SelectItem>
              <SelectItem value="low">Low – I need support</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="biggest_win">Biggest win</Label>
        <Textarea
          id="biggest_win"
          placeholder="What breakthrough or lesson stood out this week?"
          value={biggestWin}
          onChange={(event) => setBiggestWin(event.target.value)}
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="biggest_blocker">Biggest blocker (optional)</Label>
        <Textarea
          id="biggest_blocker"
          placeholder="Where did you get stuck?"
          value={blocker}
          onChange={(event) => setBlocker(event.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="help_requested">How can we help? (optional)</Label>
        <Textarea
          id="help_requested"
          placeholder="Ask for resources, demos, or a mentor nudge."
          value={helpRequested}
          onChange={(event) => setHelpRequested(event.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {lastSubmittedAt
            ? `Last check-in: ${new Date(lastSubmittedAt).toLocaleString()}`
            : 'No feedback yet—kick off your first weekly check-in.'}
        </p>
        <Button type="submit" disabled={isPending} className="sm:w-auto">
          {isPending ? 'Submitting…' : 'Submit weekly check-in'}
        </Button>
      </div>
    </form>
  );
}

export default FeedbackForm;


