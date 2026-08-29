/**
 * Server environment.
 *
 * These are set in Netlify (Site configuration → Environment variables), not in
 * .env — none of them may ever be exposed to the browser, which is why not one
 * of them is prefixed VITE_.
 *
 * Everything is read lazily and reported as "not configured" rather than
 * thrown at import time, so that a site with no Stripe account yet still
 * deploys and serves the rest of the app. Until the client opens their Stripe
 * account, the checkout endpoints answer 503 and the UI says so politely.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

export function stripeSecretKey(): string | undefined {
  return read('STRIPE_SECRET_KEY');
}

export function stripeWebhookSecret(): string | undefined {
  return read('STRIPE_WEBHOOK_SECRET');
}

export function supabaseUrl(): string | undefined {
  // VITE_SUPABASE_URL is already set on Netlify for the build; the URL is public
  // so reusing it saves the client configuring the same value twice.
  return read('SUPABASE_URL') ?? read('VITE_SUPABASE_URL');
}

/**
 * The service-role key. Bypasses row-level security, so it must exist only
 * here — never in the client bundle, never in .env.example with a real value.
 */
export function supabaseServiceRoleKey(): string | undefined {
  return read('SUPABASE_SERVICE_ROLE_KEY');
}

export function supabaseAnonKey(): string | undefined {
  return read('SUPABASE_ANON_KEY') ?? read('VITE_SUPABASE_ANON_KEY');
}

/**
 * Where to send a browser back to after Stripe.
 *
 * Netlify sets URL (the site's canonical address) and DEPLOY_PRIME_URL (this
 * particular deploy) automatically, so deploy previews return to themselves
 * rather than to production.
 */
export function siteUrl(): string {
  return read('SITE_URL') ?? read('DEPLOY_PRIME_URL') ?? read('URL') ?? 'http://localhost:8888';
}

/** True when the payment endpoints have everything they need to work. */
export function paymentsConfigured(): boolean {
  return !!stripeSecretKey() && !!supabaseUrl() && !!supabaseServiceRoleKey();
}
