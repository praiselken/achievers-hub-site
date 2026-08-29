/**
 * The payment journey, playable end to end without Stripe.
 *
 * The client needs to walk the whole thing — free, trial, checkout, paying,
 * renewal date, cancelling, lapsing — before any of it is switched on for real.
 * This is the same trick the rest of demo mode uses: a session-scoped store that
 * behaves like the database without being it. Nothing here reaches Supabase or
 * Stripe, and nothing survives closing the tab.
 *
 * Real money never comes through this file. `isDemoMode()` gates every entry
 * point in src/lib/billing.ts and src/lib/subscription.ts, so a signed-in
 * account cannot land in here by accident.
 */

import type { Subscription, SubscriptionStatus } from './subscription';
import { clampSeats, TRIAL_DAYS, TRIAL_PLAN, type PlanId } from './plans';

const KEY = 'ah_demo_subscription';

const DAY = 86_400_000;

/**
 * Where the demonstration starts.
 *
 * Free Starter, deliberately: the point is to show the journey from the
 * beginning, not to drop the client in the middle of it already paying.
 */
const DEMO_START: Subscription = {
  planId: 'free',
  status: 'none',
  seats: 1,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  trialEndsAt: null,
  hasBillingAccount: false,
};

/** The session-storage shape. Dates go in and out as ISO strings. */
interface StoredSubscription {
  planId: PlanId;
  status: SubscriptionStatus;
  seats: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
  hasBillingAccount: boolean;
}

function toStored(sub: Subscription): StoredSubscription {
  return {
    planId: sub.planId,
    status: sub.status,
    seats: sub.seats,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    trialEndsAt: sub.trialEndsAt?.toISOString() ?? null,
    hasBillingAccount: sub.hasBillingAccount,
  };
}

function fromStored(stored: StoredSubscription): Subscription {
  return {
    ...stored,
    currentPeriodEnd: stored.currentPeriodEnd ? new Date(stored.currentPeriodEnd) : null,
    trialEndsAt: stored.trialEndsAt ? new Date(stored.trialEndsAt) : null,
  };
}

export function readDemoSubscription(): Subscription {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return DEMO_START;
    return fromStored(JSON.parse(raw) as StoredSubscription);
  } catch {
    // Malformed or unavailable storage — start the journey over rather than
    // showing the client an error they cannot act on.
    return DEMO_START;
  }
}

function write(sub: Subscription): Subscription {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(toStored(sub)));
  } catch {
    // Storage unavailable. The journey will not persist between pages, which is
    // a poor demo but not a broken one.
  }
  return sub;
}

/** Wipe the demo journey. Called when leaving demo mode, and by "Start again". */
export function clearDemoBilling(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}

/* ------------------------------------------------------------------ *
 * The journey
 * ------------------------------------------------------------------ */

/** Free Starter → seven-day trial, no card. */
export function demoStartTrial(): Subscription {
  return write({
    ...DEMO_START,
    planId: TRIAL_PLAN,
    status: 'trialing',
    trialEndsAt: new Date(Date.now() + TRIAL_DAYS * DAY),
  });
}

/**
 * What the webhook would write after a successful first payment.
 *
 * A month's access from now, which is what a monthly subscription started today
 * would give. Stripe's own dates are calculated from the billing anchor, so a
 * real one can differ by a day; near enough for a walkthrough.
 */
export function demoCompletePayment(planId: PlanId, seats: number): Subscription {
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  return write({
    planId,
    status: 'active',
    seats: clampSeats(planId, seats),
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    trialEndsAt: null,
    hasBillingAccount: true,
  });
}

/** Cancelled in the portal: paid up to the period end, then back to free. */
export function demoCancel(): Subscription {
  const current = readDemoSubscription();
  return write({ ...current, cancelAtPeriodEnd: true });
}

/** Changed their mind before the period ended — Stripe's portal allows this. */
export function demoResume(): Subscription {
  const current = readDemoSubscription();
  return write({ ...current, cancelAtPeriodEnd: false });
}

/* ------------------------------------------------------------------ *
 * Scenarios
 * ------------------------------------------------------------------ *
 *
 * States a walkthrough would otherwise have to wait days to reach. These are
 * the ones worth the client seeing, because each one is a decision they may
 * want to argue with before it is live.
 */

/** The trial running out. Shows that nothing is charged and nothing is lost. */
export function demoEndTrial(): Subscription {
  const current = readDemoSubscription();
  return write({
    ...current,
    planId: TRIAL_PLAN,
    status: 'trialing',
    trialEndsAt: new Date(Date.now() - DAY),
  });
}

/** A renewal card that bounced. Access deliberately continues while Stripe retries. */
export function demoFailPayment(): Subscription {
  const current = readDemoSubscription();
  if (current.status !== 'active') return current;
  return write({ ...current, status: 'past_due' });
}

/** The end of a cancelled subscription: paid period over, back to Free Starter. */
export function demoLapse(): Subscription {
  const current = readDemoSubscription();
  return write({
    ...current,
    planId: 'free',
    status: 'canceled',
    cancelAtPeriodEnd: false,
    currentPeriodEnd: new Date(Date.now() - DAY),
  });
}

export function demoReset(): Subscription {
  clearDemoBilling();
  return DEMO_START;
}

/* ------------------------------------------------------------------ *
 * The round trip to a real Stripe Payment Link
 * ------------------------------------------------------------------ *
 *
 * A Payment Link has no webhook behind it, so when the browser comes back from
 * Stripe there is nothing to tell the demonstration what happened. We remember
 * what was being bought on the way out, and settle it on the way in.
 *
 * Session storage survives the trip to stripe.com and back — it is scoped to the
 * tab and this origin, not to the page.
 */

const PENDING_KEY = 'ah_demo_pending_purchase';

interface PendingPurchase {
  planId: PlanId;
  seats: number;
}

export function rememberDemoPurchase(purchase: PendingPurchase): void {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(purchase));
  } catch {
    // Storage unavailable. They will come back to an unchanged membership,
    // which is wrong but recoverable — the scenario buttons can set it.
  }
}

/**
 * Settle a purchase that went out to a real Stripe page.
 *
 * Returns null when there was nothing pending, which is the normal case for the
 * built-in stand-in — that writes its own state before navigating, so both
 * routes arrive at the same place.
 *
 * This trusts the return redirect, which the real integration deliberately does
 * not (see create-checkout-session.mts). That is acceptable only because this
 * path exists solely in demo mode, where there is no entitlement to give away
 * and no money involved.
 */
export function completeRememberedDemoPurchase(): Subscription | null {
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const pending = JSON.parse(raw) as Partial<PendingPurchase>;
    if (typeof pending.planId !== 'string') return null;
    return demoCompletePayment(pending.planId as PlanId, Number(pending.seats) || 1);
  } catch {
    return null;
  }
}

export interface DemoScenario {
  id: string;
  label: string;
  /** Why a reviewer would want to see this state. Shown as the button's title. */
  hint: string;
  run: () => Subscription;
  /** Whether this scenario makes sense from the current state. */
  available: (sub: Subscription) => boolean;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'end-trial',
    label: 'Jump to the end of the trial',
    hint: 'Seven days on. Nothing is charged and the account returns to Free Starter.',
    run: demoEndTrial,
    available: (sub) => sub.status === 'trialing',
  },
  {
    id: 'fail-payment',
    label: 'Simulate a failed renewal',
    hint: 'The card bounces. Access continues while Stripe retries, rather than cutting a student off mid-revision.',
    run: demoFailPayment,
    available: (sub) => sub.status === 'active',
  },
  {
    id: 'lapse',
    label: 'Jump to the end of the paid period',
    hint: 'A cancelled membership running out. Progress and history stay.',
    run: demoLapse,
    available: (sub) => sub.status === 'active' || sub.status === 'past_due',
  },
  {
    id: 'reset',
    label: 'Start again from Free Starter',
    hint: 'Clears the demonstration and returns to the beginning of the journey.',
    run: demoReset,
    available: () => true,
  },
];
