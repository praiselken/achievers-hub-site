/**
 * The browser half of the payment gateway.
 *
 * Nothing here touches a card. Both calls ask a Netlify function for a
 * short-lived Stripe URL and then hand the browser over to Stripe, which is
 * what keeps card details out of this codebase entirely.
 *
 * Server half: netlify/functions/create-checkout-session.mts and
 * netlify/functions/create-portal-session.mts.
 */

import { supabase } from './supabase';
import { isDemoMode } from './demoMode';
import { clampSeats, PLANS, type PlanId } from './plans';

/**
 * Whether to offer paid membership at all.
 *
 * Off unless explicitly switched on, because the Stripe account is the
 * client's to open and until it exists a "Subscribe" button would take a real
 * parent to a real dead end. With this off the pricing page still sells the
 * plans, but the buttons route to the no-card trial and to signup instead.
 *
 * Set VITE_PAYMENTS_ENABLED=true once the Stripe keys are on Netlify.
 */
export const paymentsEnabled: boolean =
  String(import.meta.env.VITE_PAYMENTS_ENABLED ?? '').toLowerCase() === 'true';

/**
 * Whether to show the paid journey at all.
 *
 * Demo mode counts, so the client can walk the whole thing — pricing, checkout,
 * membership, cancelling — before any of it is switched on for real. In demo the
 * journey is played out locally and never reaches Stripe; see demoBilling.ts.
 *
 * A function rather than a constant because the demo flag lives in session
 * storage and can be set after this module is imported.
 */
export function paymentsAvailable(): boolean {
  return paymentsEnabled || isDemoMode();
}

/** Netlify rewrites /api/* to the functions (see public/_redirects). */
const API_BASE = '/api';

export type BillingError =
  /** VITE_PAYMENTS_ENABLED is off, or the server has no Stripe keys. */
  | 'not-configured'
  /** No signed-in session — send them to /login first. */
  | 'signed-out'
  /** This account has no Stripe customer, so there is nothing to manage yet. */
  | 'no-billing-account'
  /** Network, Stripe outage, anything else. */
  | 'failed';

export class BillingFailure extends Error {
  reason: BillingError;

  constructor(reason: BillingError, message?: string) {
    super(message ?? reason);
    this.name = 'BillingFailure';
    this.reason = reason;
  }
}

async function accessToken(): Promise<string> {
  if (!supabase) throw new BillingFailure('signed-out');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new BillingFailure('signed-out');
  return session.access_token;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  if (!paymentsEnabled) throw new BillingFailure('not-configured');

  const token = await accessToken();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new BillingFailure('failed', 'Could not reach the payment service.');
  }

  const payload = (await response.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };

  if (!response.ok) {
    const reason: BillingError =
      response.status === 401 ? 'signed-out'
      : response.status === 503 ? 'not-configured'
      : payload.error === 'no-billing-account' ? 'no-billing-account'
      : 'failed';
    throw new BillingFailure(reason, payload.error);
  }
  return payload as T;
}

export interface CheckoutOptions {
  planId: PlanId;
  /** Family plans only. Ignored — and re-clamped — by the server. */
  seats?: number;
  /** Where Stripe should send the browser back to on success. */
  returnPath?: string;
}

/**
 * Send the browser to Stripe Checkout.
 *
 * Resolves only if something went wrong; on success the page has navigated
 * away, so nothing after the redirect runs.
 */
export async function startCheckout(options: CheckoutOptions): Promise<never | void> {
  if (isDemoMode()) {
    // The demonstration stands in for Stripe's hosted page. It collects nothing
    // and charges nothing — see src/pages/demo/DemoPaymentPage.tsx.
    const seats = clampSeats(options.planId, options.seats ?? 1);
    window.location.assign(`/demo/payment?plan=${options.planId}&seats=${seats}`);
    return;
  }

  const { url } = await post<{ url: string }>('create-checkout-session', {
    planId: options.planId,
    seats: clampSeats(options.planId, options.seats ?? 1),
    returnPath: options.returnPath ?? '/dashboard',
  });

  window.location.assign(url);
}

/**
 * Send the browser to the Stripe billing portal, where a subscriber can change
 * their card, download invoices or cancel.
 *
 * Cancelling is deliberately Stripe's own screen rather than a button here: it
 * is the flow Stripe keeps compliant, and it means "cancel" can never get out
 * of step with what Stripe actually did.
 */
export async function openBillingPortal(returnPath = '/dashboard/settings'): Promise<never | void> {
  if (isDemoMode()) {
    window.location.assign(`/demo/billing-portal?return=${encodeURIComponent(returnPath)}`);
    return;
  }

  const { url } = await post<{ url: string }>('create-portal-session', { returnPath });
  window.location.assign(url);
}

/* ------------------------------------------------------------------ *
 * Remembering what someone was buying when we interrupted them
 * ------------------------------------------------------------------ */

const INTENT_KEY = 'ah_checkout_intent';

export interface CheckoutIntent {
  planId: PlanId;
  seats: number;
}

/**
 * Hold on to the plan someone chose before we sent them off to sign in.
 *
 * Session storage rather than local: a plan someone abandoned last week should
 * not ambush them the next time they open the site. AuthRouter picks this up
 * after sign-in and takes them back to the checkout page.
 */
export function rememberCheckoutIntent(intent: CheckoutIntent): void {
  try {
    sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent));
  } catch {
    // Storage unavailable — they land on the dashboard and can pick the plan
    // again from Settings. Worth no more than that.
  }
}

/** Read and clear the remembered plan. Returns null if there wasn't one. */
export function takeCheckoutIntent(): CheckoutIntent | null {
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    sessionStorage.removeItem(INTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutIntent>;
    if (typeof parsed.planId !== 'string' || !(parsed.planId in PLANS)) return null;
    return {
      planId: parsed.planId as PlanId,
      seats: clampSeats(parsed.planId as PlanId, Number(parsed.seats) || 1),
    };
  } catch {
    return null;
  }
}

/** Wording for each failure, in the client's plain-English register. */
export function billingErrorMessage(reason: BillingError): string {
  switch (reason) {
    case 'not-configured':
      return 'Paid membership is not open yet. You can keep using Achievers Hub free in the meantime.';
    case 'signed-out':
      return 'Please sign in before choosing a membership.';
    case 'no-billing-account':
      return 'There is no paid membership on this account yet, so there is nothing to manage.';
    default:
      return 'Something went wrong reaching our payment provider. Please try again in a moment.';
  }
}
