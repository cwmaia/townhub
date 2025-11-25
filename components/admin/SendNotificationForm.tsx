'use client';

import { useActionData, useTransition } from 'next/navigation';
import { Button } from '@/components/ui/button';

export type SendNotificationFormResult = {
  success?: true;
  delivered?: number;
  failed?: number;
  error?: string;
  notificationId?: string;
};

type SendNotificationFormProps = {
  locale: string;
  townId: string;
  notificationId: string;
  action: (formData: FormData) => Promise<SendNotificationFormResult>;
  disabled?: boolean;
};

export default function SendNotificationForm({
  action,
  locale,
  townId,
  notificationId,
  disabled = false,
}: SendNotificationFormProps) {
  const transition = useTransition();
  const actionData = useActionData<SendNotificationFormResult>();
  const isPending = transition.state === 'submitting';
  const feedback = actionData?.notificationId === notificationId ? actionData : null;

  return (
    <div className="space-y-2">
      {feedback?.success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          ✅ Sent to {feedback.delivered ?? 0} device{feedback.delivered === 1 ? '' : 's'}
          {feedback.failed ? ` (${feedback.failed} failed)` : null}
        </div>
      )}
      {feedback?.error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          ❌ {feedback.error}
        </div>
      )}
      <form action={action} className="flex justify-end" suppressHydrationWarning>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="townId" value={townId} />
        <input type="hidden" name="id" value={notificationId} />
        <Button type="submit" className="rounded-full" disabled={disabled || isPending}>
          {isPending ? 'Sending…' : disabled ? 'Sent' : 'Send now'}
        </Button>
      </form>
    </div>
  );
}
