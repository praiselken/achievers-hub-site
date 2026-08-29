/**
 * /checkout?plan=family&seats=3
 *
 * The last screen before Stripe. Its job is to state, without ambiguity, what
 * is about to be charged and how often — the Family card promises "exact total
 * shown before payment", and the Subscription Terms say a membership starts
 * only once the subscriber has reviewed the checkout information.
 *
 * It handles four states: signed out, already subscribed, payments not open
 * yet, and ready to pay. No card fields appear here or anywhere else in the
 * app; the button hands the browser to Stripe.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock, Minus, Plus } from 'lucide-react';
import { Container } from '../components/marketing/Container';
import { supabase } from '../lib/supabase';
import { isDemoMode } from '../lib/demoMode';
import {
  BillingFailure,
  billingErrorMessage,
  openBillingPortal,
  paymentsAvailable,
  rememberCheckoutIntent,
  startCheckout,
} from '../lib/billing';
import { clampSeats, formatPence, isPlanId, monthlyTotalPence, PLANS, TRIAL_DAYS, type PlanId } from '../lib/plans';
import { isEntitled, useSubscription } from '../lib/subscription';

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const requested = params.get('plan');
  const planId: PlanId = isPlanId(requested) && requested !== 'free' ? requested : 'student_complete';
  const plan = PLANS[planId];

  const [seats, setSeats] = useState(() =>
    clampSeats(planId, Number(params.get('seats')) || plan.includedSeats),
  );
  // Null means "still asking". Demo mode and an unconfigured Supabase both have
  // an answer straight away, so only the real lookup needs the effect below.
  const [signedIn, setSignedIn] = useState<boolean | null>(() =>
    isDemoMode() ? true : supabase ? null : false,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const { subscription, loading: subLoading } = useSubscription();
  const alreadySubscribed = isEntitled(subscription) && subscription.status !== 'trialing';

  useEffect(() => {
    if (isDemoMode() || !supabase) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSignedIn(!!data.session);
    });
    return () => { cancelled = true; };
  }, []);

  const total = useMemo(() => monthlyTotalPence(planId, seats), [planId, seats]);
  const canPickSeats = plan.extraSeatPence !== null && plan.maxSeats > plan.includedSeats;

  async function pay() {
    setError('');
    setBusy(true);
    try {
      // Resolves only on failure — success navigates away to Stripe.
      await startCheckout({ planId, seats, returnPath: '/dashboard/settings' });
    } catch (failure) {
      const reason = failure instanceof BillingFailure ? failure.reason : 'failed';
      if (reason === 'signed-out') {
        rememberCheckoutIntent({ planId, seats });
        navigate('/login');
        return;
      }
      setError(billingErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function manage() {
    setError('');
    setBusy(true);
    try {
      await openBillingPortal('/checkout');
    } catch (failure) {
      setError(billingErrorMessage(failure instanceof BillingFailure ? failure.reason : 'failed'));
    } finally {
      setBusy(false);
    }
  }

  function signInFirst() {
    rememberCheckoutIntent({ planId, seats });
    navigate('/login');
  }

  return (
    <main className="mkt flex-1 bg-[#fbfafc] py-16 lg:py-24">
      <Container className="max-w-3xl">
        <p className="text-sm font-extrabold text-[var(--color-primary-600)]">Review your membership</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-[var(--color-ink-900)]">
          {plan.name}
        </h1>
        <p className="mt-3 leading-7 text-[var(--color-ink-500)]">{plan.description}</p>

        <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[var(--color-ink-700)]">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--color-success-500)]" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>

          {canPickSeats && (
            <div className="mt-8 border-t border-slate-100 pt-7">
              <p className="text-sm font-extrabold text-[var(--color-ink-900)]">How many students?</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-ink-500)]">
                The first {plan.includedSeats} are included. Each additional student is{' '}
                {formatPence(plan.extraSeatPence ?? 0)} per month.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSeats((n) => clampSeats(planId, n - 1))}
                  disabled={seats <= plan.includedSeats}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-[var(--color-ink-700)] transition hover:bg-slate-50 disabled:opacity-40"
                  aria-label="One fewer student"
                >
                  <Minus size={18} aria-hidden="true" />
                </button>
                <span className="min-w-8 text-center font-display text-2xl font-extrabold text-[var(--color-ink-900)]" aria-live="polite">
                  {seats}
                </span>
                <button
                  type="button"
                  onClick={() => setSeats((n) => clampSeats(planId, n + 1))}
                  disabled={seats >= plan.maxSeats}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-[var(--color-ink-700)] transition hover:bg-slate-50 disabled:opacity-40"
                  aria-label="One more student"
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-7">
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink-500)]">Total each month</p>
              <p className="mt-1 font-display text-4xl font-extrabold text-[var(--color-ink-900)]">
                {formatPence(total)}
              </p>
            </div>
            <p className="max-w-xs text-xs leading-5 text-[var(--color-ink-500)]">
              Billed monthly and renews automatically until cancelled. Cancel any time — access continues
              to the end of the period you have paid for.
            </p>
          </div>

          <div className="mt-8">
            {subLoading || signedIn === null ? (
              <p className="text-sm text-[var(--color-ink-500)]">Checking your account…</p>
            ) : alreadySubscribed ? (
              <>
                <p className="text-sm font-semibold leading-6 text-[var(--color-ink-700)]">
                  You already have {PLANS[subscription.planId].name}. Change plan, update your card or cancel
                  from the billing portal.
                </p>
                <button
                  type="button"
                  onClick={manage}
                  disabled={busy}
                  className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--color-primary-300)] bg-white px-6 py-3 font-bold text-[var(--color-primary-700)] transition hover:bg-[var(--color-primary-50)] disabled:opacity-60"
                >
                  {busy ? 'Opening…' : 'Manage membership'}
                </button>
              </>
            ) : !paymentsAvailable() ? (
              <>
                <p className="text-sm leading-6 text-[var(--color-ink-500)]">
                  Paid membership is not open yet. You can start the {TRIAL_DAYS}-day trial with no payment
                  details, or keep using Free Starter for as long as you like.
                </p>
                <Link
                  to="/start-free-trial"
                  className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-6 py-3 font-bold text-white transition hover:bg-[var(--color-accent-600)]"
                >
                  Start the free trial <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </>
            ) : signedIn ? (
              <button
                type="button"
                onClick={pay}
                disabled={busy}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-6 py-3 font-bold text-white transition hover:bg-[var(--color-accent-600)] disabled:opacity-60 sm:w-auto"
              >
                <Lock size={16} aria-hidden="true" />
                {busy ? 'Taking you to Stripe…' : `Continue to payment — ${formatPence(total)} a month`}
              </button>
            ) : (
              <>
                <p className="text-sm leading-6 text-[var(--color-ink-500)]">
                  Sign in or create an account first, and we will bring you straight back here.
                </p>
                <button
                  type="button"
                  onClick={signInFirst}
                  className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-6 py-3 font-bold text-white transition hover:bg-[var(--color-accent-600)]"
                >
                  Sign in to continue <ArrowRight size={17} aria-hidden="true" />
                </button>
              </>
            )}

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-[var(--color-accent-50)] px-4 py-3 text-sm font-semibold text-[var(--color-accent-600)]">
                {error}
              </p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-6 text-[var(--color-ink-500)]">
          Payments are handled by Stripe. We never see or store your card number. See the{' '}
          <Link to="/subscription-terms" className="font-semibold underline">Subscription Terms</Link>{' '}
          for cancellation and refund rights.{' '}
          <Link to="/pricing" className="font-semibold underline">Compare plans</Link>.
        </p>
      </Container>
    </main>
  );
}
