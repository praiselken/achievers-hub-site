/**
 * Stripe Payment Links, for showing the real checkout before the real one works.
 *
 * A Payment Link is a Stripe-hosted checkout page with no server behind it: no
 * session token, no `subscriptions` row, no webhook. That is the whole point of
 * using one here. The proper integration
 * (netlify/functions/create-checkout-session.mts) needs a signed-in Supabase
 * user before it will talk to Stripe at all, so while Supabase is over quota
 * nobody can reach it — but a Payment Link still lets the client see the genuine
 * Stripe page, with their own branding and prices, and pay with a test card.
 *
 * These URLs are public — they are meant to be handed out — so `VITE_` is
 * correct here, unlike every other Stripe value in this project. Nothing secret
 * belongs in this file.
 *
 * They are used **only in demo mode**. Once payments are properly switched on,
 * the real function takes over and these are ignored; see docs/PAYMENTS.md.
 */

import type { PlanId } from './plans';

const CONFIGURED: Partial<Record<PlanId, string | undefined>> = {
  student_complete: import.meta.env.VITE_STRIPE_PAYMENT_LINK_STUDENT_COMPLETE as string | undefined,
  family: import.meta.env.VITE_STRIPE_PAYMENT_LINK_FAMILY as string | undefined,
  tutor: import.meta.env.VITE_STRIPE_PAYMENT_LINK_TUTOR as string | undefined,
};

/**
 * Stripe's own hosts, and nothing else.
 *
 * A typo or a half-pasted value in an environment variable should fail closed to
 * the built-in stand-in rather than send a client — or, later, a parent — to
 * whatever happens to be at the other end of a malformed URL.
 */
function isStripeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'buy.stripe.com' || url.hostname.endsWith('.stripe.com'))
    );
  } catch {
    return false;
  }
}

/** The configured Payment Link for a plan, or null to use the stand-in. */
export function paymentLinkFor(planId: PlanId): string | null {
  const configured = CONFIGURED[planId]?.trim();
  if (!configured || !isStripeUrl(configured)) return null;
  return configured;
}

/** Whether any plan has a real Stripe page behind it. */
export function hasAnyPaymentLink(): boolean {
  return (Object.keys(CONFIGURED) as PlanId[]).some((plan) => paymentLinkFor(plan) !== null);
}
