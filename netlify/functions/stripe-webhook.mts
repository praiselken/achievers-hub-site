/**
 * POST /api/stripe-webhook
 *
 * The only thing in this codebase that may grant paid access.
 *
 * Everything else — the pricing page, the checkout endpoint, the success page —
 * is a request. This is the answer. A browser that lands on the success page
 * has not necessarily paid, and a browser that closes the tab mid-redirect may
 * well have, so entitlement is written here and nowhere else.
 *
 * Three things make that safe:
 *   1. Every delivery is signature-checked against STRIPE_WEBHOOK_SECRET, so
 *      only Stripe can call it.
 *   2. Every event id is recorded before it is acted on, so Stripe's retries
 *      cannot apply the same change twice.
 *   3. It writes with the service role, which is why the browser has no update
 *      policy on `subscriptions` at all.
 *
 * Set the endpoint up in Stripe at:
 *   https://<site>/api/stripe-webhook
 * subscribed to the events listed in HANDLED below.
 */

import type Stripe from 'stripe';
import { stripeWebhookSecret, supabaseServiceRoleKey, supabaseUrl } from '../lib/env.mts';
import { planFromSubscription } from '../lib/plans.mts';
import { stripe } from '../lib/stripe.mts';
import { serviceClient, userIdForCustomer } from '../lib/supabase.mts';

const HANDLED = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
] as const;

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }

  const secret = stripeWebhookSecret();
  if (!secret || !supabaseUrl() || !supabaseServiceRoleKey()) {
    // Nothing is configured yet. 503 rather than 200: Stripe will retry, so a
    // deploy that lands before the environment variables do does not silently
    // drop somebody's first payment.
    console.error('[webhook] not configured — refusing delivery so Stripe retries.');
    return new Response('Not configured', { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  // Must be the untouched body — parsing it first would break the signature.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(rawBody, signature, secret);
  } catch (error) {
    console.error('[webhook] signature verification failed:', error);
    return new Response('Invalid signature', { status: 400 });
  }

  // Claim the event before doing any work. The primary key on stripe_events
  // means a redelivery loses the race and is acknowledged without re-applying.
  const { error: claimError } = await serviceClient()
    .from('stripe_events')
    .insert({ id: event.id, type: event.type });

  if (claimError) {
    if (claimError.code === '23505') {
      return new Response('Already handled', { status: 200 });
    }
    console.error('[webhook] could not record event:', claimError);
    // 500 asks Stripe to retry, which is right: we have not done the work.
    return new Response('Could not record event', { status: 500 });
  }

  try {
    await apply(event);
  } catch (error) {
    console.error(`[webhook] failed to apply ${event.type} (${event.id}):`, error);
    // Release the claim so the retry is allowed to try again.
    await serviceClient().from('stripe_events').delete().eq('id', event.id);
    return new Response('Handler failed', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}

async function apply(event: Stripe.Event): Promise<void> {
  if (!(HANDLED as readonly string[]).includes(event.type)) return;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    // A one-off payment or an abandoned session has no subscription to sync.
    if (!subscriptionId) return;

    const subscription = await stripe().subscriptions.retrieve(subscriptionId);
    await sync(subscription, session.client_reference_id ?? undefined);
    return;
  }

  await sync(event.data.object as Stripe.Subscription);
}

/**
 * Write one Stripe subscription into our `subscriptions` row.
 *
 * Deliberately re-reads everything from the Stripe object rather than trusting
 * anything we stored earlier: Stripe is the record of what was charged, and
 * events can arrive out of order.
 */
async function sync(subscription: Stripe.Subscription, fallbackUserId?: string): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const userId = await resolveUserId(subscription, customerId, fallbackUserId);
  if (!userId) {
    // Not an account of ours — a subscription created directly in the Stripe
    // dashboard for someone who has never signed up, say. Logged, not failed:
    // retrying will not make an account appear.
    console.warn(`[webhook] no account for customer ${customerId}; skipping.`);
    return;
  }

  const { planId, seats } = planFromSubscription(subscription);
  const status = mapStatus(subscription.status);

  // As of API version 2025-03-31 the period lives on each subscription item
  // rather than the subscription, so paid access runs to the latest of them.
  const periodEnd = subscription.items.data.reduce<number | null>(
    (latest, item) => (item.current_period_end > (latest ?? 0) ? item.current_period_end : latest),
    null,
  );

  const { error } = await serviceClient()
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_id: status === 'canceled' ? 'free' : planId,
        status,
        seats,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        current_period_end: toIso(periodEnd),
        cancel_at_period_end: subscription.cancel_at_period_end,
        trial_ends_at: toIso(subscription.trial_end),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) throw new Error(`Could not write subscription: ${error.message}`);
}

/**
 * Which account this subscription belongs to.
 *
 * Metadata first, because we set it at checkout and it survives everything.
 * Then the checkout session's client_reference_id. Then the customer id we
 * saved before sending them to Stripe, which covers a subscription started from
 * the billing portal or the dashboard.
 */
async function resolveUserId(
  subscription: Stripe.Subscription,
  customerId: string,
  fallbackUserId?: string,
): Promise<string | null> {
  const fromMetadata = subscription.metadata?.supabase_user_id;
  if (fromMetadata) return fromMetadata;
  if (fallbackUserId) return fallbackUserId;
  return userIdForCustomer(customerId);
}

/** Stripe's statuses, narrowed to the set the subscriptions table allows. */
function mapStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'trialing':
    case 'active':
    case 'past_due':
    case 'canceled':
    case 'unpaid':
      return status;
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    default:
      // 'paused', and anything Stripe adds later. Withholding access is the
      // safe way to be wrong about a status we do not recognise.
      return 'unpaid';
  }
}

function toIso(seconds: number | null | undefined): string | null {
  return typeof seconds === 'number' ? new Date(seconds * 1000).toISOString() : null;
}
