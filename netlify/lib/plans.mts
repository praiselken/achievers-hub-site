/**
 * What each plan actually costs — the server's copy, and the only one that
 * decides what Stripe charges.
 *
 * The browser sends a plan id and a seat count. It never sends a price, an
 * amount or a Stripe price identifier, because a browser can say anything. The
 * price ids live in Netlify environment variables so the client can move
 * between test and live mode, or reprice, without a code change.
 *
 * Keep the plan ids in step with src/lib/plans.ts and with the plan_id check
 * constraint in supabase/migrations/0003_add_subscriptions.sql.
 */

import type Stripe from 'stripe';

export type PlanId = 'free' | 'student_complete' | 'family' | 'tutor';

interface PlanPricing {
  /** Environment variable holding the recurring Stripe price for the base plan. */
  basePriceEnv: string;
  /** How many students the base price covers. */
  includedSeats: number;
  /** Price for each student beyond the included ones, where the plan allows it. */
  extraSeatPriceEnv?: string;
  maxSeats: number;
}

const PRICING: Record<Exclude<PlanId, 'free'>, PlanPricing> = {
  student_complete: {
    basePriceEnv: 'STRIPE_PRICE_STUDENT_COMPLETE',
    includedSeats: 1,
    maxSeats: 1,
  },
  family: {
    basePriceEnv: 'STRIPE_PRICE_FAMILY_BASE',
    includedSeats: 2,
    extraSeatPriceEnv: 'STRIPE_PRICE_FAMILY_EXTRA_STUDENT',
    maxSeats: 5,
  },
  tutor: {
    basePriceEnv: 'STRIPE_PRICE_TUTOR',
    includedSeats: 25,
    maxSeats: 25,
  },
};

export function isPayablePlan(value: unknown): value is Exclude<PlanId, 'free'> {
  return typeof value === 'string' && value in PRICING;
}

/** Clamp whatever the browser asked for into what the plan actually permits. */
export function clampSeats(planId: Exclude<PlanId, 'free'>, seats: unknown): number {
  const plan = PRICING[planId];
  const requested = typeof seats === 'number' && Number.isFinite(seats) ? Math.trunc(seats) : plan.includedSeats;
  return Math.min(plan.maxSeats, Math.max(plan.includedSeats, requested));
}

export class PlanNotPricedError extends Error {}

/**
 * The Stripe line items for a plan at a given seat count.
 *
 * Family becomes two lines — the base price for the first two students, and a
 * quantity of the extra-student price for the rest — so the invoice reads the
 * way the pricing page describes it rather than as one opaque total.
 *
 * Throws PlanNotPricedError when the price id is missing from the environment,
 * which is the ordinary state of affairs before the client's Stripe account
 * exists. The caller turns that into a 503.
 */
export function lineItemsFor(
  planId: Exclude<PlanId, 'free'>,
  seats: number,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const plan = PRICING[planId];

  const basePrice = process.env[plan.basePriceEnv]?.trim();
  if (!basePrice) throw new PlanNotPricedError(plan.basePriceEnv);

  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    { price: basePrice, quantity: 1 },
  ];

  const extraSeats = Math.max(0, seats - plan.includedSeats);
  if (extraSeats > 0) {
    if (!plan.extraSeatPriceEnv) throw new PlanNotPricedError(`${planId} does not sell extra seats`);
    const extraPrice = process.env[plan.extraSeatPriceEnv]?.trim();
    if (!extraPrice) throw new PlanNotPricedError(plan.extraSeatPriceEnv);
    items.push({ price: extraPrice, quantity: extraSeats });
  }

  return items;
}

/**
 * Work back from a Stripe subscription to a plan id and seat count.
 *
 * The webhook needs this because Stripe tells us what *prices* renewed, not
 * what we call the bundle. Metadata on the subscription is the primary answer;
 * matching the price ids is the fallback for a subscription created outside the
 * app — from the Stripe dashboard, say, when someone is helped over the phone.
 */
export function planFromSubscription(
  subscription: Stripe.Subscription,
): { planId: PlanId; seats: number } {
  const fromMetadata = subscription.metadata?.plan_id;
  if (isPayablePlan(fromMetadata)) {
    const seats = Number(subscription.metadata?.seats);
    return {
      planId: fromMetadata,
      seats: Number.isFinite(seats) ? clampSeats(fromMetadata, seats) : PRICING[fromMetadata].includedSeats,
    };
  }

  const priceIds = new Set(
    subscription.items.data
      .map((item) => item.price?.id)
      .filter((id): id is string => !!id),
  );

  for (const planId of Object.keys(PRICING) as Array<Exclude<PlanId, 'free'>>) {
    const plan = PRICING[planId];
    const basePrice = process.env[plan.basePriceEnv]?.trim();
    if (!basePrice || !priceIds.has(basePrice)) continue;

    let seats = plan.includedSeats;
    const extraPrice = plan.extraSeatPriceEnv ? process.env[plan.extraSeatPriceEnv]?.trim() : undefined;
    if (extraPrice) {
      const extraItem = subscription.items.data.find((item) => item.price?.id === extraPrice);
      if (extraItem) seats += extraItem.quantity ?? 0;
    }
    return { planId, seats: clampSeats(planId, seats) };
  }

  // A subscription we cannot recognise must not silently unlock the product.
  return { planId: 'free', seats: 1 };
}
