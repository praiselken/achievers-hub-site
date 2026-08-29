/**
 * The Stripe client.
 *
 * Created on first use rather than at import, so a deploy with no Stripe keys
 * still boots — the functions answer 503 instead of the whole site failing.
 */

import Stripe from 'stripe';
import { stripeSecretKey } from './env.mts';

let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;
  const key = stripeSecretKey();
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set.');
  // No explicit apiVersion: the pinned default in the installed SDK is the one
  // its types were generated against, so they cannot drift apart.
  cached = new Stripe(key);
  return cached;
}

/**
 * The Stripe customer for this account, creating one if needed.
 *
 * The Supabase user id goes into metadata so that a customer found in the
 * Stripe dashboard can always be traced back to an account, and so a webhook
 * that arrives before our own row is written still knows who it is about.
 */
export async function findOrCreateCustomer(args: {
  userId: string;
  existingCustomerId: string | null;
  email?: string;
}): Promise<string> {
  const client = stripe();

  if (args.existingCustomerId) {
    // The stored id can go stale — a customer deleted in the dashboard, or a
    // switch between test and live keys. Rather than fail the checkout, check
    // and fall through to making a new one.
    try {
      const existing = await client.customers.retrieve(args.existingCustomerId);
      if (!existing.deleted) return existing.id;
    } catch {
      // Not found under these keys. Make a fresh one below.
    }
  }

  const created = await client.customers.create({
    email: args.email,
    metadata: { supabase_user_id: args.userId },
  });
  return created.id;
}
