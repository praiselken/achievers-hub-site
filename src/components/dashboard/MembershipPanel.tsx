/**
 * The account's membership, in Settings.
 *
 * Shows what they are on, when it renews or lapses, and gives them the two
 * things a subscriber ever needs: a way to start paying, and a way to stop.
 * Cancelling deliberately opens Stripe's own portal rather than a button here —
 * see netlify/functions/create-portal-session.mts for why.
 */

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import {
  BillingFailure,
  billingErrorMessage,
  openBillingPortal,
  paymentsAvailable,
} from '../../lib/billing';
import { isDemoMode } from '../../lib/demoMode';
import { completeRememberedDemoPurchase, DEMO_SCENARIOS } from '../../lib/demoBilling';
import { formatPence, monthlyTotalPence, PLANS, TRIAL_DAYS } from '../../lib/plans';
import {
  isEntitled,
  startTrial,
  trialDaysLeft,
  trialExpired,
  useSubscription,
} from '../../lib/subscription';

const CARD = 'bg-white rounded-2xl p-6 border border-slate-200';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function MembershipPanel() {
  const { subscription, loading, refresh } = useSubscription();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const justPaid = params.get('checkout') === 'success';
  const [confirming, setConfirming] = useState(justPaid);

  // Stripe redirects the browser back the moment payment succeeds, which can be
  // a beat before the webhook has written the row. Re-read a few times rather
  // than showing someone who has just paid that they are still on Free Starter.
  //
  // The demonstration has already settled its own state, so it shows the same
  // beat once and moves on — there is no provider to wait for, and ten seconds
  // of "confirming with our payment provider" would be telling the client
  // something untrue about a journey they are reviewing.
  useEffect(() => {
    if (!justPaid) return;
    // Coming back from a real Stripe Payment Link, this is the only signal we
    // get — there is no webhook behind a Payment Link. No-op for the built-in
    // stand-in, which has already written its own state.
    if (isDemoMode()) completeRememberedDemoPurchase();
    const attemptsNeeded = isDemoMode() ? 1 : 5;
    const gap = isDemoMode() ? 1200 : 2000;
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      await refresh();
      if (attempts >= attemptsNeeded) {
        clearInterval(timer);
        setConfirming(false);
      }
    }, gap);
    return () => clearInterval(timer);
  }, [justPaid, refresh]);

  async function manage() {
    setError('');
    setBusy(true);
    try {
      await openBillingPortal('/dashboard/settings');
    } catch (failure) {
      setError(billingErrorMessage(failure instanceof BillingFailure ? failure.reason : 'failed'));
    } finally {
      setBusy(false);
    }
  }

  async function beginTrial() {
    setError('');
    setBusy(true);
    const result = await startTrial();
    setBusy(false);
    if (result.ok) {
      await refresh();
      setNotice(`Your ${TRIAL_DAYS}-day trial has started. No payment details needed.`);
      return;
    }
    setError(
      result.reason === 'already-used'
        ? 'This account has already used its free trial.'
        : result.reason === 'signed-out'
          ? 'Please sign in again to start your trial.'
          : 'The trial could not be started just now. Please try again shortly.',
    );
  }

  if (loading) {
    return (
      <div className={CARD} style={{ boxShadow: 'var(--shadow-soft)' }}>
        <p className="text-sm text-[var(--color-ink-300)]">Loading your membership…</p>
      </div>
    );
  }

  const plan = PLANS[subscription.planId];
  const entitled = isEntitled(subscription);
  const daysLeft = trialDaysLeft(subscription);
  const expired = trialExpired(subscription);

  return (
    <div className={CARD} style={{ boxShadow: 'var(--shadow-soft)' }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--color-ink-700)]">Membership</p>
          <p className="mt-1 font-display text-xl font-bold text-[var(--color-ink-900)]">
            {entitled ? plan.name : 'Free Starter'}
          </p>
        </div>
        {entitled && subscription.status !== 'trialing' && (
          <p className="text-sm font-semibold text-[var(--color-ink-500)]">
            {formatPence(monthlyTotalPence(subscription.planId, subscription.seats))} a month
            {subscription.seats > plan.includedSeats && ` · ${subscription.seats} students`}
          </p>
        )}
      </div>

      <div className="mt-4 text-sm leading-6 text-[var(--color-ink-500)]">
        {subscription.status === 'past_due' ? (
          <p className="flex items-start gap-2 font-semibold text-[var(--color-accent-600)]">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            Your last payment did not go through. Access continues for now — please update your card so
            it is not interrupted.
          </p>
        ) : daysLeft !== null && daysLeft > 0 ? (
          <p className="flex items-start gap-2">
            <Clock size={17} className="mt-0.5 shrink-0 text-[var(--color-primary-600)]" aria-hidden="true" />
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left of your free trial. No payment details are
            held and nothing will be charged when it ends.
          </p>
        ) : expired ? (
          <p>
            Your free trial has finished and the account has returned to Free Starter, so your progress
            and history are all still here.
          </p>
        ) : entitled && subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd ? (
          <p>
            Cancelled. Paid access continues until {formatDate(subscription.currentPeriodEnd)}, after
            which the account returns to Free Starter.
          </p>
        ) : entitled && subscription.currentPeriodEnd ? (
          <p className="flex items-start gap-2">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[var(--color-success-500)]" aria-hidden="true" />
            Renews automatically on {formatDate(subscription.currentPeriodEnd)}. Cancel any time.
          </p>
        ) : (
          <p>
            Free Starter has no time limit. {PLANS.student_complete.name} unlocks the full personalised
            plan, past-paper analysis and linked adult views.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {subscription.hasBillingAccount && (
          <button
            type="button"
            onClick={manage}
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-[var(--color-ink-700)] transition hover:bg-slate-50 disabled:opacity-60"
          >
            {busy ? 'Opening…' : 'Manage or cancel'}
          </button>
        )}

        {!entitled && subscription.status === 'none' && (
          <button
            type="button"
            onClick={beginTrial}
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-primary-300)] px-5 py-2.5 text-sm font-bold text-[var(--color-primary-700)] transition hover:bg-[var(--color-primary-50)] disabled:opacity-60"
          >
            Start the {TRIAL_DAYS}-day free trial
          </button>
        )}

        {(!entitled || subscription.status === 'trialing') && (
          <Link
            to={paymentsAvailable() ? '/checkout?plan=student_complete' : '/pricing'}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--color-accent-600)]"
          >
            {paymentsAvailable() ? 'Choose a membership' : 'See plans'}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        )}
      </div>

      {isDemoMode() && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-amber-900">
            Demonstration controls
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-900/80">
            States the journey would otherwise take days to reach. Nothing here is saved or charged.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_SCENARIOS.filter((scenario) => scenario.available(subscription)).map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                title={scenario.hint}
                onClick={async () => {
                  scenario.run();
                  await refresh();
                  setNotice(scenario.hint);
                }}
                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {confirming && (
        <p className="mt-4 text-sm font-semibold text-[var(--color-ink-500)]">
          Thank you. Confirming your membership with our payment provider…
        </p>
      )}
      {notice && <p className="mt-4 text-sm font-semibold text-[var(--color-success-600)]">{notice}</p>}
      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-[var(--color-accent-600)]">
          {error}
        </p>
      )}
    </div>
  );
}
