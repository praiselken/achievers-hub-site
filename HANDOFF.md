# Handoff — Achievers Hub, end of 29 Aug 2026

Context for picking this up in a new session. Everything below is pushed to
`main` on `github.com/praiselken/achievers-hub-site` and deploying to Netlify
(`achievers-hub-live.netlify.app`).

---

## 1. Blocking, and not fixable in code

**The Supabase project is switched off.** Every request returns HTTP 402:

> `Service for this project is restricted due to the following violations: exceed_storage_size_quota.`

Login, signup, questions, progress, past papers — all dead on the live site.
Only the marketing pages and demo mode work. The client must upgrade the plan or
lift the spend cap. Storage is the constraint and it grows: past papers are PDFs,
and there is a Drive folder of mark schemes still to load.

Nothing else on this list matters until that is resolved.

## 2. Three migrations written but never run

All in `supabase/migrations/`, none applied (no working database to apply
them to).

- **`0001_restrict_self_assigned_roles.sql` — security, run before opening signups.**
  The role written to `profiles` at signup came from `localStorage.pending_role`,
  which the browser controls. Setting it to `admin` in devtools before signing up
  produced an admin account with access to the question bank and user management.
  The client now allowlists student/parent/tutor (`src/App.tsx`), **but that alone
  does not close it** — a valid session can call the REST API directly. The
  migration constrains the insert, blocks self-promotion via update, and enables
  RLS. Also worth checking for any existing `role = 'admin'` rows that shouldn't be.

- **`0002_add_student_grades.sql`** — a `student_grades` table with RLS, including
  read-only access for a linked parent. Until it runs, grades live in
  `localStorage` via `src/lib/grades.ts`, so they don't follow a student
  between devices.

- **`0003_add_subscriptions.sql`** — the `subscriptions` table behind the payment
  gateway, plus `stripe_events` for webhook idempotency. Until it runs, every
  account reads as Free Starter, which is the safe direction to fail in: the app
  works, nothing is unlocked that shouldn't be, and no one can be charged.

**Row-level security in general is unverified.** Client-side queries are correctly
scoped by user id, but client-side scoping is not protection. Before real students
use this, confirm the server enforces it on `profiles`, `daily_sessions`,
`topic_progress` and `parent_child_links`.

## 3. What was built this session

| Commit | What |
|---|---|
| `e5b2951` | Remaining dashboard tabs onto the client's palette |
| `0ad097a` | Removed the real anon key from `.env.example` — this was failing every Netlify build via secrets scanning |
| `4c30cea` | Role hardening, error boundary, `RequireRole` on parent/tutor dashboards |
| `8e69ee2` | Missing-profile users go to onboarding rather than being locked out |
| `1389fde` | Login/signup page onto the redesign |
| `b215dcf` | GCSE grade selector + grades on the dashboard |
| `efd8c74` | Microsoft and Apple sign-in alongside Google |
| `292333c` `a82f397` | Admin panel link in the sidebar, incl. demo mode |
| `5d7f644` | Admin panel demo-able and on the brand palette |
| `2097370` `3574039` | One Archi character everywhere; illustrations given real transparency |

Earlier in the session: marketing site redesign ported, inline workbook with
ruler/protractor/compass, Think. Speak. Grow. built to the client's spec,
dashboard home rebuilt.

## 4. Conventions worth knowing

- **`.mkt` scopes the redesign.** Brand tokens and Inter live under `.mkt` in
  `src/index.css`. Any surface outside `MarketingLayout` must opt in explicitly —
  this is why the login page and admin panel didn't match until they were wrapped.
- **Demo mode** is a `sessionStorage` flag (`src/lib/demoMode.ts`). `/demo` enters
  it. Every tab, the admin panel, and now the whole payment journey read demo
  data and **write nothing** to Supabase in demo. Seeded grades live in
  `enterDemoMode()`; the payment journey lives in `src/lib/demoBilling.ts` and is
  cleared by `exitDemoMode()` so a real sign-in cannot inherit a pretend
  membership. Demo mode is also the only thing that opens the paid buttons while
  `VITE_PAYMENTS_ENABLED` is unset.
- **Archi** has one canonical depiction: `archie-book-avatar-v3.png`. The sprite
  sheet's `ai` cell is a different robot and is deliberately unreachable —
  `FeatureIllustration` returns the real art before the sprite lookup.
- **`netlify.toml` now exists**, so it — not the Netlify UI — is the source of
  truth for the build command, publish directory and functions directory. It was
  written to match what the site was already deploying with. `npm run dev` alone
  does not serve `/api/*`; use `npx netlify dev` when working on payments.
- **Pathway tiers stay internal.** Never show Numeracy/Foundation/… next to a GCSE
  grade. `PATHWAYS` only renders in `StudentPage.tsx`, which is no longer routed.

## 5. Not built, and why

- **Subscriptions / payments** — **built, switched off.** Stripe hosted Checkout
  and billing portal via Netlify Functions, with the webhook as the only writer of
  entitlement. It stays dark until `VITE_PAYMENTS_ENABLED=true` and the Stripe
  keys are set, because the account is the client's to open — so today the paid
  buttons still route to the no-card trial and to signup, exactly as before.
  The whole journey — pricing, checkout, payment, membership, cancelling, plus
  the trial expiring and a failed renewal — is walkable today via `/demo`, for
  client review before anything is switched on. Full setup steps, the client
  walkthrough, the test-card run and the open commercial questions are in
  `docs/PAYMENTS.md`. Note the seven-day trial is deliberately *not* a Stripe
  trial: the copy promises no card and no automatic charge, so it is app-side and
  works today without Stripe.
- **Microsoft and Apple sign-in** are wired but need enabling in Supabase
  (Authentication → Providers). Microsoft needs a free Azure app registration.
  **Apple needs a paid Apple Developer Program membership, $99/year.**
- **Archi (AI tutor), revision plan, Quick Lessons, tutor requests** — four Grow
  actions in Think. Speak. Grow. record the student's intention but have nowhere
  to navigate.
- **Lesson format** — blocked on the client sending structured lesson content.
- **AI marking** — blocked on cost sign-off. Estimate given: ~1.5–2p per marked
  question, £150–£300/month at 100 active students.
- **Parent/tutor filtered views** for Think. Speak. Grow. — need the database.

## 6. Client situation

- **Delivery date is 31 August.** The platform side is achievable if Supabase is
  restored. The commercial side is now *code-complete* but cannot be switched on
  without a Stripe account in the client's name, plus a legal review of the
  Subscription Terms before real money moves — both theirs to do, neither
  instant. Worth pinning down in writing what "delivery" covers.
- **Admin panel** — the client asked for it specifically. It exists: add/edit/delete
  for questions, topics, past papers and mindset prompts, plus user role changes.
  Reachable at `/admin` via the sidebar link, which only shows for
  `role = 'admin'`. **The first admin must be set by hand in SQL** — after that the
  Users tab can promote others.
- **Costs are the client's**, and third-party accounts should be in *their* name,
  not the developer's — particularly Supabase, given it holds data about under-18s
  and the client is the data controller.
- **The two redesign zips are gone** (WhatsApp cleared its cache). If the client
  wants their own layouts for Practice, Progress, Past Papers or Ask Archi, the
  files need re-sending. Their layouts were signed off as "fine" as they are.
- Legal pages (Privacy, Terms, Subscription Terms, Safeguarding, AI Use,
  Accessibility) exist as drafts and are routed, carrying a notice that they need
  legal review before taking payment.

## 7. Known rough edges

- JS bundle is ~850 KB — slow first load on a phone.
- `archie-hero-v3.png` is still 1.7 MB and RGB; the other two illustrations were
  given alpha and are ~1 MB each. Worth compressing before launch.
- The admin panel is dark by design; it uses the brand palette but does not match
  the light dashboards. Deliberate, but confirm the client is happy.
