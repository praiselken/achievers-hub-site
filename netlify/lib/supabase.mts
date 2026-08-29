/**
 * Server-side Supabase access.
 *
 * Two clients, for two different jobs:
 *
 *   serviceClient() bypasses row-level security. It is how the webhook writes
 *   subscription state that no browser is allowed to write. Its key must never
 *   leave the function environment.
 *
 *   userIdFromRequest() does the opposite — it takes the caller's own access
 *   token and asks Supabase who they are, so a function can act for one
 *   specific person without trusting a user id sent in the request body.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from './env.mts';

let cached: SupabaseClient | null = null;

export function serviceClient(): SupabaseClient {
  if (cached) return cached;
  const url = supabaseUrl();
  const key = supabaseServiceRoleKey();
  if (!url || !key) throw new Error('Supabase service credentials are not configured.');
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/**
 * Identify the caller from the Authorization header.
 *
 * Returns null for anything that is not a valid, current session — a missing
 * header, a malformed one, an expired token. Callers turn that into a 401 and
 * must not fall back to any user id supplied in the request itself.
 */
export async function userIdFromRequest(request: Request): Promise<string | null> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;

  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) return null;

  // The anon key is enough: getUser validates the JWT's signature and expiry
  // against the project. Using the service role here would be needlessly
  // privileged for a read of "who is this".
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export interface SubscriptionRecord {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string;
  status: string;
  seats: number;
}

/** The account's existing row, or null if they have never had one. */
export async function getSubscription(userId: string): Promise<SubscriptionRecord | null> {
  const { data, error } = await serviceClient()
    .from('subscriptions')
    .select('user_id, stripe_customer_id, stripe_subscription_id, plan_id, status, seats')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(`Could not read subscription: ${error.message}`);
  return (data as SubscriptionRecord | null) ?? null;
}

/** Find the account behind a Stripe customer, for webhook events that only name one. */
export async function userIdForCustomer(customerId: string): Promise<string | null> {
  const { data, error } = await serviceClient()
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (error) throw new Error(`Could not look up customer: ${error.message}`);
  return (data as { user_id: string } | null)?.user_id ?? null;
}

/** The signed-in person's email, used to prefill Stripe Checkout. */
export async function emailForUser(userId: string): Promise<string | undefined> {
  const { data, error } = await serviceClient().auth.admin.getUserById(userId);
  if (error) return undefined;
  return data.user?.email ?? undefined;
}
