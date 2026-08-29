/**
 * What the signed-in account is currently entitled to.
 *
 * Reads the `subscriptions` table (migration 0003). That row is written by the
 * Stripe webhook, never by the browser — the one exception is starting the
 * no-card trial, which the insert policy pins down field by field.
 *
 * This module is a *convenience*, not a security boundary. Hiding a tab is a
 * courtesy to the user; the thing that actually protects paid content is
 * row-level security on the tables behind it. Gate the UI here, but do not
 * assume it is the only thing standing between a free account and paid data.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { isDemoMode } from './demoMode';
import { demoStartTrial, readDemoSubscription } from './demoBilling';
import { PLANS, TRIAL_DAYS, TRIAL_PLAN, type PlanId, type Tier } from './plans';

export type SubscriptionStatus =
  | 'none'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'unpaid';

export interface Subscription {
  planId: PlanId;
  status: SubscriptionStatus;
  seats: number;
  /** When paid access lapses. Null on free, and on a trial (use trialEndsAt). */
  currentPeriodEnd: Date | null;
  /** Cancelled, but paid up until `currentPeriodEnd`. */
  cancelAtPeriodEnd: boolean;
  trialEndsAt: Date | null;
  /** Whether Stripe has a customer for this account, i.e. the portal will open. */
  hasBillingAccount: boolean;
}

/** What an account with no row at all gets. Also the fallback on any error. */
export const FREE_SUBSCRIPTION: Subscription = {
  planId: 'free',
  status: 'none',
  seats: 1,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  trialEndsAt: null,
  hasBillingAccount: false,
};

// Demo mode plays the whole journey — free, trial, paying, cancelled — from a
// session-scoped store rather than the database. See src/lib/demoBilling.ts.

/* ------------------------------------------------------------------ *
 * Entitlement
 * ------------------------------------------------------------------ */

/**
 * True while the subscription should unlock paid features.
 *
 * `past_due` deliberately counts. Stripe retries a failed card for days, and
 * locking a student out mid-revision over a expired card does more damage than
 * the few pounds at stake. The membership panel nags instead; the webhook flips
 * the row to `unpaid` or `canceled` when Stripe finally gives up.
 */
export function isEntitled(sub: Subscription, now = new Date()): boolean {
  switch (sub.status) {
    case 'trialing':
      return sub.trialEndsAt !== null && sub.trialEndsAt > now;
    case 'active':
    case 'past_due':
      // A cancelled-but-paid subscription keeps working to the end of the period.
      return sub.currentPeriodEnd === null || sub.currentPeriodEnd > now;
    default:
      return false;
  }
}

/** What the account can actually reach right now, once expiry is taken into account. */
export function currentTier(sub: Subscription, now = new Date()): Tier {
  return isEntitled(sub, now) ? PLANS[sub.planId].tier : 'free';
}

export function hasTier(sub: Subscription, tier: Tier, now = new Date()): boolean {
  if (tier === 'free') return true;
  return currentTier(sub, now) === tier;
}

/** Shorthand for the common check: is the full student product unlocked? */
export function hasComplete(sub: Subscription, now = new Date()): boolean {
  return currentTier(sub, now) === 'complete';
}

/** Whole days left on a trial, rounded up. Null when not on one. */
export function trialDaysLeft(sub: Subscription, now = new Date()): number | null {
  if (sub.status !== 'trialing' || !sub.trialEndsAt) return null;
  const ms = sub.trialEndsAt.getTime() - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / 86_400_000);
}

/** True once a trial has been used up — the point at which we ask for payment. */
export function trialExpired(sub: Subscription, now = new Date()): boolean {
  return sub.status === 'trialing' && sub.trialEndsAt !== null && sub.trialEndsAt <= now;
}

/* ------------------------------------------------------------------ *
 * Loading
 * ------------------------------------------------------------------ */

interface SubscriptionRow {
  plan_id: string;
  status: string;
  seats: number;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
}

const STATUSES: SubscriptionStatus[] = [
  'none', 'trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid',
];

function fromRow(row: SubscriptionRow): Subscription {
  return {
    planId: row.plan_id in PLANS ? (row.plan_id as PlanId) : 'free',
    status: STATUSES.includes(row.status as SubscriptionStatus)
      ? (row.status as SubscriptionStatus)
      : 'none',
    seats: row.seats ?? 1,
    currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end) : null,
    cancelAtPeriodEnd: !!row.cancel_at_period_end,
    trialEndsAt: row.trial_ends_at ? new Date(row.trial_ends_at) : null,
    hasBillingAccount: !!row.stripe_customer_id,
  };
}

const COLUMNS =
  'plan_id, status, seats, current_period_end, cancel_at_period_end, trial_ends_at, stripe_customer_id';

/**
 * Read the current account's subscription.
 *
 * Never throws and never leaves the caller without an answer: anything that
 * goes wrong resolves to Free Starter, which is the safe direction to fail in.
 */
export async function loadSubscription(): Promise<Subscription> {
  if (isDemoMode()) return readDemoSubscription();
  if (!supabase) return FREE_SUBSCRIPTION;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return FREE_SUBSCRIPTION;
    const { data } = await supabase
      .from('subscriptions')
      .select(COLUMNS)
      .eq('user_id', user.id)
      .maybeSingle();
    return data ? fromRow(data as SubscriptionRow) : FREE_SUBSCRIPTION;
  } catch {
    // Table missing (migration 0003 not run yet), offline, project suspended —
    // all of them mean "we cannot prove they have paid", so: free.
    return FREE_SUBSCRIPTION;
  }
}

/** Read a linked child's subscription, for the parent dashboard. Read-only by RLS. */
export async function loadSubscriptionFor(userId: string): Promise<Subscription> {
  if (isDemoMode()) return readDemoSubscription();
  if (!supabase) return FREE_SUBSCRIPTION;
  try {
    const { data } = await supabase
      .from('subscriptions')
      .select(COLUMNS)
      .eq('user_id', userId)
      .maybeSingle();
    return data ? fromRow(data as SubscriptionRow) : FREE_SUBSCRIPTION;
  } catch {
    return FREE_SUBSCRIPTION;
  }
}

export interface UseSubscription {
  subscription: Subscription;
  loading: boolean;
  /** Re-read from the database. Call after returning from Stripe. */
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscription {
  const [subscription, setSubscription] = useState<Subscription>(FREE_SUBSCRIPTION);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await loadSubscription();
    setSubscription(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadSubscription().then((next) => {
      if (cancelled) return;
      setSubscription(next);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { subscription, loading, refresh };
}

/* ------------------------------------------------------------------ *
 * The no-card trial
 * ------------------------------------------------------------------ */

export type StartTrialResult =
  | { ok: true; subscription: Subscription }
  | { ok: false; reason: 'signed-out' | 'already-used' | 'unavailable' };

/**
 * Start the seven-day trial.
 *
 * Deliberately not a Stripe trial. The pricing page and the Subscription Terms
 * both promise no payment details and no automatic charge at the end, so there
 * is no card, no Stripe subscription and nothing to cancel — the row simply
 * stops entitling anything once `trial_ends_at` passes.
 *
 * The database allows exactly one of these per account and will not let the
 * browser write any other shape of row. See migration 0003.
 */
export async function startTrial(): Promise<StartTrialResult> {
  if (isDemoMode()) return { ok: true, subscription: demoStartTrial() };
  if (!supabase) return { ok: false, reason: 'unavailable' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'signed-out' };

  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 86_400_000);
  const { error } = await supabase.from('subscriptions').insert({
    user_id: user.id,
    plan_id: TRIAL_PLAN,
    status: 'trialing',
    seats: 1,
    trial_ends_at: trialEndsAt.toISOString(),
  });

  if (error) {
    // 23505 is a duplicate primary key: this account has had its trial, or has
    // moved on to a paid plan. Either way the answer is the same.
    if (error.code === '23505') return { ok: false, reason: 'already-used' };
    return { ok: false, reason: 'unavailable' };
  }

  return {
    ok: true,
    subscription: {
      ...FREE_SUBSCRIPTION,
      planId: TRIAL_PLAN,
      status: 'trialing',
      trialEndsAt,
    },
  };
}
