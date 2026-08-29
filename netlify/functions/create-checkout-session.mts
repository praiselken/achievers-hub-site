/**
 * POST /api/create-checkout-session
 *
 * Turns "this signed-in person wants the Family plan for three children" into a
 * Stripe Checkout URL. The browser is then handed to Stripe, so no card detail
 * ever reaches this codebase.
 *
 * The request body names a plan and a seat count and nothing else. Prices come
 * from the environment (netlify/lib/plans.mts) and the customer comes from the
 * caller's own session token — never from the body — so the worst a tampered
 * request can do is buy a plan we actually sell, for an account that is
 * actually theirs.
 *
 * Note that this endpoint does NOT grant access. Nothing is unlocked until
 * Stripe confirms payment to stripe-webhook.mts, because a browser that reaches
 * the success page has not necessarily paid, and a browser that never reaches
 * it may well have.
 */

import { paymentsConfigured, siteUrl } from '../lib/env.mts';
import { fail, json, readJson, requirePost, safeReturnUrl } from '../lib/http.mts';
import { clampSeats, isPayablePlan, lineItemsFor, PlanNotPricedError } from '../lib/plans.mts';
import { findOrCreateCustomer, stripe } from '../lib/stripe.mts';
import { emailForUser, getSubscription, serviceClient, userIdFromRequest } from '../lib/supabase.mts';

interface Body {
  planId?: unknown;
  seats?: unknown;
  returnPath?: unknown;
}

export default async function handler(request: Request): Promise<Response> {
  const wrongMethod = requirePost(request);
  if (wrongMethod) return wrongMethod;

  if (!paymentsConfigured()) return fail('not-configured', 503);

  const userId = await userIdFromRequest(request);
  if (!userId) return fail('signed-out', 401);

  const body = await readJson<Body>(request);
  if (!body || !isPayablePlan(body.planId)) return fail('unknown-plan', 400);

  const planId = body.planId;
  const seats = clampSeats(planId, body.seats);
  const site = siteUrl();

  try {
    const existing = await getSubscription(userId);
    const customerId = await findOrCreateCustomer({
      userId,
      existingCustomerId: existing?.stripe_customer_id ?? null,
      email: await emailForUser(userId),
    });

    // Remember the customer before sending anyone to Stripe. If they abandon
    // checkout we still know who they are next time, and the webhook can match
    // an event to an account even if it arrives before we hear anything else.
    await serviceClient()
      .from('subscriptions')
      .upsert(
        { user_id: userId, stripe_customer_id: customerId, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );

    // Somebody who already pays does not need a second subscription — send them
    // to the portal, where they can change plan or seat count against the one
    // they have. Buying twice is a refund request waiting to happen.
    if (existing?.stripe_subscription_id && ['active', 'past_due'].includes(existing.status)) {
      const portal = await stripe().billingPortal.sessions.create({
        customer: customerId,
        return_url: safeReturnUrl(site, body.returnPath, '/dashboard/settings'),
      });
      return json({ url: portal.url });
    }

    const session = await stripe().checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: lineItemsFor(planId, seats),
      // Both of these end up on the Stripe objects, so the webhook can tell
      // which account and which bundle a payment belongs to.
      client_reference_id: userId,
      subscription_data: {
        metadata: { supabase_user_id: userId, plan_id: planId, seats: String(seats) },
      },
      metadata: { supabase_user_id: userId, plan_id: planId, seats: String(seats) },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      // The success page only says "thanks" — see the note at the top of the file.
      success_url: `${safeReturnUrl(site, body.returnPath, '/dashboard')}?checkout=success`,
      cancel_url: `${site.replace(/\/+$/, '')}/pricing?checkout=cancelled`,
    });

    if (!session.url) return fail('failed', 502);
    return json({ url: session.url });
  } catch (error) {
    if (error instanceof PlanNotPricedError) {
      console.error('[checkout] plan has no price configured:', error.message);
      return fail('not-configured', 503);
    }
    console.error('[checkout] could not create session:', error);
    return fail('failed', 502);
  }
}
