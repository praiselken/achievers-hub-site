/** Small helpers so every function answers in the same shape. */

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

/**
 * An error the browser is allowed to see.
 *
 * `code` is a stable machine-readable string that src/lib/billing.ts switches
 * on. Never put a Stripe message or a database error in here — those can carry
 * internal detail and belong in the function log.
 */
export function fail(code: string, status: number): Response {
  return json({ error: code }, status);
}

/** Rejects anything that is not a JSON POST, which is all these endpoints accept. */
export function requirePost(request: Request): Response | null {
  if (request.method === 'POST') return null;
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Turn a caller-supplied return path into an absolute URL on this site.
 *
 * Stripe will redirect a browser to whatever we put in success_url, so this has
 * to reject anything that is not a same-site path — otherwise the endpoint is an
 * open redirect with Stripe's good name in front of it. Protocol-relative
 * ("//evil.example") is the case that catches people out, hence the second test.
 */
export function safeReturnUrl(siteUrl: string, returnPath: unknown, fallback: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  if (typeof returnPath !== 'string' || !returnPath.startsWith('/') || returnPath.startsWith('//')) {
    return `${base}${fallback}`;
  }
  return `${base}${returnPath}`;
}
