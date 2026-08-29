/**
 * /demo/billing-portal — where Stripe's customer portal sits in the real journey.
 *
 * The portal is the one place a subscriber can cancel, and the client should see
 * how easy that is before signing off on it: an easy exit is both the law and
 * the reason people are willing to start in the first place.
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, RotateCcw, XCircle } from 'lucide-react';
import { DemoStageShell } from './DemoStageShell';
import { demoCancel, demoResume, readDemoSubscription } from '../../lib/demoBilling';
import { formatPence, monthlyTotalPence, PLANS } from '../../lib/plans';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DemoPortalPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(readDemoSubscription);

  const returnPath = params.get('return') ?? '/dashboard/settings';
  const plan = PLANS[subscription.planId];
  const safeReturn = returnPath.startsWith('/') && !returnPath.startsWith('//')
    ? returnPath
    : '/dashboard/settings';

  return (
    <DemoStageShell
      eyebrow="Managing a membership"
      title="Stripe's customer portal"
      intro="Changing a card, downloading invoices and cancelling all happen on Stripe's own portal rather than inside Achievers Hub. This stands in for it."
      footnote={
        <>
          Stripe hosts this, keeps it compliant and translated, and tells the server what changed.
          Building our own cancel button instead would risk our idea of “cancelled” drifting from
          Stripe's — and a cancellation that does not actually stop the billing is the worst bug a
          subscription product can have.
        </>
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink-500)]">Current membership</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-[var(--color-ink-900)]">
            {plan.name}
          </p>
        </div>
        <p className="font-bold text-[var(--color-ink-700)]">
          {formatPence(monthlyTotalPence(subscription.planId, subscription.seats))} a month
        </p>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--color-ink-500)]">
        {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd
          ? `Cancelled. Access continues until ${formatDate(subscription.currentPeriodEnd)}, and no further payment is taken.`
          : subscription.currentPeriodEnd
            ? `Renews automatically on ${formatDate(subscription.currentPeriodEnd)}.`
            : 'There is no paid membership on this account yet.'}
      </p>

      <ul className="mt-6 space-y-2 text-sm leading-6 text-[var(--color-ink-500)]">
        <li className="flex items-start gap-2">
          <FileText size={16} className="mt-1 shrink-0" aria-hidden="true" />
          Invoices and receipts are listed and downloadable here.
        </li>
        <li className="flex items-start gap-2">
          <FileText size={16} className="mt-1 shrink-0" aria-hidden="true" />
          The payment card can be replaced without contacting anyone.
        </li>
      </ul>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        {subscription.cancelAtPeriodEnd ? (
          <button
            type="button"
            onClick={() => setSubscription(demoResume())}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-6 py-3 font-bold text-white transition hover:bg-[var(--color-primary-700)]"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Simulate resuming the membership
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSubscription(demoCancel())}
            disabled={!subscription.currentPeriodEnd}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-bold text-[var(--color-ink-700)] transition hover:bg-slate-50 disabled:opacity-50"
          >
            <XCircle size={16} aria-hidden="true" />
            Simulate cancelling
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(safeReturn)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-6 py-3 font-bold text-white transition hover:bg-[var(--color-accent-600)]"
        >
          Return to Achievers Hub
        </button>
      </div>
    </DemoStageShell>
  );
}
