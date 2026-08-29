# Payments and subscriptions

How money works in Achievers Hub, and what has to be switched on before it can
take a real payment.

The code is complete and deployed. It is **switched off**, because turning it on
needs a Stripe account, and that account has to be the client's — see
"Whose account" below. Until it is on, the site behaves exactly as it did
before: the pricing page sells the plans, the no-card trial works, and the paid
buttons route to signup rather than to a checkout that could not complete.

**To show the client the whole journey now, before any of that: §2.**

---

## 1. The shape of it

```
  Pricing page  ─┐
                 ├─▶  /checkout  ──▶  POST /api/create-checkout-session  ──▶  Stripe Checkout
  Settings      ─┘                     (Netlify function)                          │
                                                                                    │  card entered
  Dashboard  ◀── redirect ─────────────────────────────────────────────────────────┘
                                                                                    │
  subscriptions table  ◀── POST /api/stripe-webhook  ◀── event ────────────────────┘
         │
         └──▶  src/lib/subscription.ts  ──▶  what the UI unlocks
```

Three things are worth being clear about.

**No card detail ever touches this codebase.** Checkout is Stripe's own hosted
page. The app only ever handles a Stripe URL and redirects to it. That keeps PCI
scope at the minimum and matches what the Privacy Notice already tells people.

**Access is granted by the webhook, not by the redirect.** A browser that lands
on the success page has not necessarily paid — it can be typed into the address
bar. A browser that closes the tab mid-redirect may well have paid. So
`/api/stripe-webhook` is the only thing in the system that writes an entitlement,
and it is the only writer the `subscriptions` table's policies permit.

**The seven-day trial is not a Stripe trial.** The pricing page and the
Subscription Terms both promise "no payment details required" and "you will not
be charged automatically". A Stripe trial takes a card and charges it. So the
trial is a row in `subscriptions` with `status = 'trialing'` and no Stripe object
at all; when `trial_ends_at` passes, the account is simply back on Free Starter.
It works today, with no Stripe account.

---

## 2. Showing the client, before any of it is switched on

The whole journey is walkable in **demo mode**, with no Stripe account, no keys
and no database. The client only needs one instruction:

> Go to **`/demo`**, then follow the amber **Walkthrough** bar at the top of the
> page. Nothing is charged, nothing is saved, and closing the tab resets it.

Everything else signposts itself. The demo banner on the dashboard links into
the journey, and from there an amber rail — **1 Choose a plan · 2 Review ·
3 Payment · 4 Your membership** — sits above every screen in it, marking where
you are and letting you jump to any step. In **Settings → Membership** there are
also amber demonstration controls for the states that would otherwise take days
to reach: the trial running out, a failed renewal, the paid period ending, and
"Start again".

This matters more than it sounds. The first version of this had no rail and no
link, so the journey was only findable by someone who had been told the URLs —
which meant it was only findable by whoever wrote it.

What they are looking at:

| Screen | Stands in for |
|---|---|
| `/checkout` | The real thing — this screen ships as-is |
| `/demo/payment` | Stripe's hosted payment page — **or the real one, see below** |
| `/demo/billing-portal` | Stripe's customer portal |
| Settings → Membership | The real thing — this panel ships as-is |

### Showing the *real* Stripe page, today

Step 3 can hand over to genuine Stripe Checkout even though the full
integration is still blocked, using a **Payment Link** — a Stripe-hosted
checkout page with no server behind it. No session token, no `subscriptions`
row, no webhook, so nothing about it depends on Supabase.

In Stripe, in **test mode**:

1. **Payment Links → New**, and pick the existing Student Complete price.
2. Under **After payment**, choose *Redirect customers to your website* and set
   `https://<your-site>/dashboard/settings?checkout=success`. Without this the
   client pays and lands back on a page that has not noticed.
3. Copy the `https://buy.stripe.com/test_…` URL into
   `VITE_STRIPE_PAYMENT_LINK_STUDENT_COMPLETE` (in `.env` locally, or on
   Netlify), and rebuild.

Step 3 then shows a short handover screen — plan, total, and Stripe's test card
`4242 4242 4242 4242` — before opening Stripe's real page. Stripe's own orange
TEST MODE banner appears there, and a real card is declined.

Two safeguards worth knowing. Anything that is not an `https` URL on a Stripe
host is ignored and the built-in stand-in is used instead, so a half-pasted
value cannot send anyone somewhere unexpected. And the banner on the handover
screen changes to say that Stripe *does* take card details on the next page —
the default banner's "no card details are collected" would be false there.

**This is not the finished integration**, and it is worth saying so to the
client. A Payment Link does not know which account is paying, and access is
granted by coming back to the site rather than by Stripe's webhook. Both of
those are the difference between a demonstration and a product. It is switched
on only in demo mode; `VITE_PAYMENTS_ENABLED` still governs the real thing.

The two `/demo/*` screens are **deliberately not mock-ups of Stripe's pages**.
They have no card fields, no Stripe branding and a permanent amber banner saying
what they are. A convincing fake checkout is not a thing to leave on a public
site, and a screenshot of one is worse.

Both redirect to `/pricing` for anyone not in demo mode, and demo mode writes
nothing to Supabase — the journey lives in session storage
(`src/lib/demoBilling.ts`) and is cleared on exit, so a real sign-in can never
inherit a pretend membership.

With `VITE_PAYMENTS_ENABLED` unset, the public pricing page is unchanged: the
paid buttons still go to the no-card trial and to signup. Demo mode is the only
thing that opens the paid journey early.

---

## 3. Switching it on

### a. Run the migration

`supabase/migrations/0003_add_subscriptions.sql`, in the Supabase SQL editor or
via `supabase db push`. Safe to re-run.

This is blocked on the Supabase project being restored — see HANDOFF.md §1.
Without it the app does not break: `loadSubscription()` treats a missing table
the same as any other failure and returns Free Starter.

### b. Create the products in Stripe

Four recurring GBP monthly prices, in **Product catalogue**:

| Product | Price | Note |
|---|---|---|
| Student Complete | £17.99 / month | |
| Family | £27.98 / month | covers the first two students |
| Family — additional student | £9.99 / month | quantity-based; add "per unit" pricing |
| Tutor Membership | £39.99 / month | |

Copy each `price_…` id — not the `prod_…` id.

### c. Set the environment variables on Netlify

Site configuration → Environment variables. **None of these may be prefixed
`VITE_`**; that would publish them in the browser bundle, and Netlify's secrets
scanner will fail the build if you try (it did once already — see HANDOFF.md §3).

```
STRIPE_SECRET_KEY                  sk_test_… while testing, sk_live_… when live
STRIPE_WEBHOOK_SECRET              whsec_…  (from step d)
STRIPE_PRICE_STUDENT_COMPLETE      price_…
STRIPE_PRICE_FAMILY_BASE           price_…
STRIPE_PRICE_FAMILY_EXTRA_STUDENT  price_…
STRIPE_PRICE_TUTOR                 price_…
SUPABASE_SERVICE_ROLE_KEY          Supabase → Project settings → API → service_role
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are read from the existing
`VITE_SUPABASE_*` variables if not set separately.

The service-role key bypasses row-level security entirely. It is what lets the
webhook write subscription state that no browser is allowed to write. Treat it
like a password: Netlify only, never in `.env`, never in the repository.

### d. Create the webhook endpoint

Stripe → Developers → Webhooks → Add endpoint.

- URL: `https://<your-site>/api/stripe-webhook`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy.

Deliveries are signature-checked, and every event id is recorded in
`stripe_events` before it is acted on, so Stripe's retries cannot apply the same
change twice.

### e. Enable the billing portal

Stripe → Settings → Billing → Customer portal. Switch it on and allow customers
to update payment methods, cancel, and see invoice history. "Manage or cancel"
in Settings opens this.

Cancellation lives there rather than in our own UI deliberately: it is the flow
Stripe keeps compliant and localised, and it means our idea of "cancelled" can
never disagree with Stripe's.

### f. Turn the buttons on

Set `VITE_PAYMENTS_ENABLED=true` on Netlify and redeploy. Until this is set, the
paid buttons route to the trial and to signup instead of to checkout.

Do this **last**, after a successful test payment.

---

## 4. Testing before going live

Use Stripe test mode keys (`sk_test_…`) throughout, then:

1. `npx netlify dev` runs the site and the functions together on port 8888.
   `npm run dev` alone serves the app but **not** `/api/*`, so checkout will 404.
2. `npx stripe listen --forward-to localhost:8888/api/stripe-webhook` gives a
   local `whsec_…` to put in `.env` for the session.
3. Card `4242 4242 4242 4242`, any future expiry, any CVC.
4. Check the `subscriptions` row appears with `status = 'active'` and a sensible
   `current_period_end`, and that Settings shows the renewal date.
5. Cancel from the portal and check the row flips to `cancel_at_period_end`.
6. Card `4000 0000 0000 0341` fails on the renewal charge — worth confirming the
   `past_due` banner appears and access is *not* immediately cut off.

Switch to live keys, do one real payment, refund it, and then set
`VITE_PAYMENTS_ENABLED=true`.

---

## 5. Where things live

| Concern | File |
|---|---|
| Plan names, prices, features (browser) | `src/lib/plans.ts` |
| Which Stripe price gets charged (server) | `netlify/lib/plans.mts` |
| Entitlement, trial, `useSubscription()` | `src/lib/subscription.ts` |
| Calling the endpoints from the browser | `src/lib/billing.ts` |
| Checkout screen | `src/pages/CheckoutPage.tsx` |
| Membership panel in Settings | `src/components/dashboard/MembershipPanel.tsx` |
| Checkout / portal / webhook | `netlify/functions/` |
| The demo journey and its scenarios | `src/lib/demoBilling.ts`, `src/pages/demo/` |
| The walkthrough rail | `src/components/demo/DemoJourneyBar.tsx` |
| Payment Link config and validation | `src/lib/paymentLinks.ts` |
| Table and policies | `supabase/migrations/0003_add_subscriptions.sql` |

Prices are stated in two places on purpose. `src/lib/plans.ts` is what the pages
*say*; `netlify/lib/plans.mts` is what Stripe *charges*. The browser sends a plan
id and a seat count and never a price, so a page the user can edit cannot name
its own price. If you reprice, change both — and the Stripe price object.

---

## 6. Still to decide, before real money

These are the client's calls, not code:

- **Legal review.** The legal pages (Privacy, Terms, Subscription Terms,
  Safeguarding, AI Use, Accessibility) are drafts and carry a notice saying they
  need review before taking payment. That notice should come off deliberately,
  not by being forgotten.
- **Consumer cancellation rights.** UK distance-selling rules give a 14-day
  cooling-off period on a subscription bought online. The Subscription Terms
  describe one; make sure what Stripe is configured to do matches what they say.
- **Refunds.** There is no refund flow in the app. Refunds are issued from the
  Stripe dashboard, which is the right place for them at this scale.
- **What Family seats actually gate.** The seat count is charged and stored, but
  nothing yet enforces "you may link at most N students" — that needs the
  linking tables, which need the database back.
- **Tutor Membership** charges correctly but the tutor-side features it lists
  (homework, attendance, bookings, files) are not all built. Selling it before
  they are would be a problem.

## 7. Whose account

The Stripe account must be in the client's name, as with Supabase. They are the
merchant of record, the money is theirs, and the liability for taking it is
theirs. Costs — Stripe's per-transaction fee among them — are the client's too.
