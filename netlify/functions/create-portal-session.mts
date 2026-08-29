/**
 * POST /api/create-portal-session
 *
 * Opens the Stripe billing portal for the signed-in account: change card,
 * download invoices, change plan, cancel.
 *
 * Cancellation lives there rather than in our own UI on purpose. It is the flow
 * Stripe keeps compliant and localised, and it means our idea of "cancelled"
 * can never disagree with Stripe's — the webhook simply hears what happened.
 */

import { paymentsConfigured, siteUrl } from '../lib/env.mts';
import { fail, json, readJson, requirePost, safeReturnUrl } from '../lib/http.mts';
import { stripe } from '../lib/stripe.mts';
import { getSubscription, userIdFromRequest } from '../lib/supabase.mts';

interface Body {
  returnPath?: unknown;
}

export default async function handler(request: Request): Promise<Response> {
  const wrongMethod = requirePost(request);
  if (wrongMethod) return wrongMethod;

  if (!paymentsConfigured()) return fail('not-configured', 503);

  const userId = await userIdFromRequest(request);
  if (!userId) return fail('signed-out', 401);

  const body = (await readJson<Body>(request)) ?? {};

  try {
    const existing = await getSubscription(userId);
    // A free or trial account has never been to Stripe, so there is no portal to
    // open. Say so plainly rather than creating an empty customer.
    if (!existing?.stripe_customer_id) return fail('no-billing-account', 404);

    const session = await stripe().billingPortal.sessions.create({
      customer: existing.stripe_customer_id,
      return_url: safeReturnUrl(siteUrl(), body.returnPath, '/dashboard/settings'),
    });

    return json({ url: session.url });
  } catch (error) {
    console.error('[portal] could not create session:', error);
    return fail('failed', 502);
  }
}
