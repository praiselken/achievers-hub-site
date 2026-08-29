-- Subscriptions and entitlement.
--
-- WHAT THIS IS FOR
-- One row per account holds "what have they paid for, and until when". The app
-- reads it to decide what to unlock. Stripe is the source of truth for money;
-- this table is a local cache of Stripe's answer so the app does not have to
-- call Stripe on every page load.
--
-- WHO WRITES IT
-- The Stripe webhook (netlify/functions/stripe-webhook.mts), running as the
-- service role. Nothing a browser can reach may set 'active'. The single
-- exception is the no-card free trial, which the product deliberately lets a
-- person start for themselves — see the insert policy, which is tightly
-- constrained so that is the *only* thing a browser can write here.
--
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run.

create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users (id) on delete cascade,

  -- Must match the PlanId union in src/lib/plans.ts and the PRICE_ENV map in
  -- netlify/lib/plans.mts. Three places, deliberately: the browser must not be
  -- able to tell the server which Stripe price to charge.
  plan_id                text not null default 'free'
                         check (plan_id in ('free', 'student_complete', 'family', 'tutor')),

  -- Mirrors Stripe's subscription statuses, plus 'none' for an account that has
  -- never had one. 'trialing' is also used by the app-side no-card trial.
  status                 text not null default 'none'
                         check (status in ('none', 'trialing', 'active', 'past_due',
                                           'canceled', 'incomplete', 'unpaid')),

  -- Family plans cover two students, plus paid extras. 1 for everything else.
  seats                  integer not null default 1 check (seats between 1 and 25),

  stripe_customer_id     text unique,
  stripe_subscription_id text unique,

  -- When paid access lapses if nothing else changes. Null while on free.
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,

  -- The no-card seven-day trial. Independent of Stripe: the marketing copy and
  -- the Subscription Terms both promise no payment details and no automatic
  -- charge, so this must NOT be a Stripe trial with a card on file.
  trial_ends_at          timestamptz,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

-- Read your own subscription.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions
  for select
  to authenticated
  using (user_id = auth.uid());

-- A linked parent may read their child's, so the parent dashboard can show
-- whether the child's access is about to lapse. Read only.
drop policy if exists "subscriptions_select_linked_parent" on public.subscriptions;
create policy "subscriptions_select_linked_parent"
  on public.subscriptions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.parent_child_links l
      where l.child_id = subscriptions.user_id
        and l.parent_id = auth.uid()
    )
  );

-- Start your own free trial, once, and nothing else.
--
-- Every field is pinned: the row must be yours, on the trial plan, in the
-- trialing state, with no Stripe identifiers, no paid period and a trial that
-- cannot run past seven days. The primary key makes it once-only. There is
-- deliberately NO update or delete policy, so a trial cannot be extended,
-- restarted or promoted to 'active' from the browser.
drop policy if exists "subscriptions_insert_own_trial" on public.subscriptions;
create policy "subscriptions_insert_own_trial"
  on public.subscriptions
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and plan_id = 'student_complete'
    and status = 'trialing'
    and seats = 1
    and stripe_customer_id is null
    and stripe_subscription_id is null
    and current_period_end is null
    and cancel_at_period_end = false
    and trial_ends_at is not null
    and trial_ends_at > now()
    and trial_ends_at <= now() + interval '7 days'
  );

-- Webhook idempotency. Stripe retries deliveries and can send the same event
-- more than once; inserting the id first means a replay is a no-op.
create table if not exists public.stripe_events (
  id           text primary key,
  type         text not null,
  received_at  timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
-- No policies: only the service role (the webhook) touches this table.

-- AFTER RUNNING
-- Nothing else is needed for free and trial accounts. Paid ones start working
-- as soon as the Stripe environment variables are set on Netlify — see
-- docs/PAYMENTS.md.
