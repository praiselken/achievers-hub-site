-- ===========================================================================
-- Achievers Hub — full database bootstrap
--
-- Recreates the entire schema on a FRESH Supabase project in one pass.
-- Paste into: Supabase → SQL Editor → New query → Run.
--
-- This file replaces running the five supabase-*-setup.sql files and the four
-- supabase/migrations/*.sql files by hand. It is the same schema, in dependency
-- order, with three corrections that the old file-by-file order got wrong —
-- each marked "FIX" below and explained where it appears.
--
-- Safe to re-run. Every statement is idempotent: tables use "if not exists",
-- policies are dropped before being created, seeds use "on conflict do nothing".
--
-- Order matters and is deliberate:
--   1. profiles            — everything hangs off this
--   2. content + progress  — topics, questions, papers, sessions, streaks
--   3. parent-child links  — tutor_bookings, student_grades and subscriptions
--                            all have policies that read this table, and a
--                            policy's tables must exist when it is created
--   4. tutor tables
--   5. engagement          — XP, levels, achievements
--   6. grades, subscriptions, question reports
--   7. storage buckets
-- ===========================================================================


-- ===========================================================================
-- 1. PROFILES
-- ===========================================================================

create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  role       text not null,
  created_at timestamptz default now()
);

-- Tutor-facing columns.
alter table public.profiles
  add column if not exists bio                text,
  add column if not exists qualifications     text,
  add column if not exists hourly_rate        numeric(6,2),
  add column if not exists years_experience   integer,
  add column if not exists availability_notes text;

-- FIX 1 — the role constraint.
-- supabase-setup.sql created profiles with an inline check allowing only
-- student/parent/tutor, which Postgres auto-named profiles_role_check.
-- Migration 0001 then added profiles_role_allowed, which also permits 'admin'.
-- Both constraints survive, and a row must satisfy BOTH — so 'admin' stays
-- rejected and the first admin can never be created. Drop the legacy one.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_role_allowed;
alter table public.profiles
  add constraint profiles_role_allowed
  check (role in ('student', 'parent', 'tutor', 'admin'));

alter table public.profiles enable row level security;

-- FIX 2 — the self-promotion hole. THIS IS THE SECURITY ONE.
-- supabase-setup.sql created three permissive policies ("Users can view/insert/
-- update own profile"). Migration 0001 added tighter replacements but never
-- dropped the originals. Postgres combines permissive policies with OR, so the
-- old unrestricted insert policy would still have allowed role = 'admin', and
-- the old update policy would still have allowed self-promotion — defeating
-- migration 0001 entirely. The originals are dropped here before the tight
-- policies are created.
drop policy if exists "Users can view own profile"   on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

-- A person may only create their OWN profile, and only as a non-privileged
-- role. Admin is granted out-of-band, never self-served.
drop policy if exists "profiles_insert_self_nonprivileged" on public.profiles;
create policy "profiles_insert_self_nonprivileged"
  on public.profiles for insert to authenticated
  with check (
    id = auth.uid()
    and role in ('student', 'parent', 'tutor')
  );

-- A person may update their own profile but NOT change their own role.
drop policy if exists "profiles_update_self_no_role_change" on public.profiles;
create policy "profiles_update_self_no_role_change"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );


-- ===========================================================================
-- 2. CONTENT AND PROGRESS
-- ===========================================================================

create table if not exists public.topics (
  id          uuid default gen_random_uuid() primary key,
  subject     text not null,
  exam_board  text not null default 'all',
  area        text not null,
  name        text not null,
  description text,
  key_points  jsonb,
  exam_tip    text,
  practice_q  text,
  practice_a  text,
  video_url   text,
  command     text,
  card_format text default 'worked_example',
  pathway_min text default 'numeracy',
  created_at  timestamptz default now()
);

-- scripts/seed-topics.mjs upserts with onConflict 'subject,area,name'.
-- Postgres resolves ON CONFLICT only against a unique index, so without this
-- the topic seed fails with "no unique or exclusion constraint matching the
-- ON CONFLICT specification". It also makes re-running the seed safe: topics
-- has no natural primary key, so a plain insert would duplicate every row.
create unique index if not exists topics_subject_area_name_key
  on public.topics (subject, area, name);

create table if not exists public.topic_progress (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users on delete cascade,
  topic_id       uuid references public.topics on delete cascade,
  status         text default 'not_started',
  score_avg      numeric default 0,
  attempts       integer default 0,
  last_practiced timestamptz,
  unique (user_id, topic_id)
);

create table if not exists public.diagnostic_results (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade,
  subject    text not null,
  exam_board text not null,
  pathway    text not null,
  score      integer,
  total      integer,
  taken_at   timestamptz default now()
);

create table if not exists public.daily_sessions (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users on delete cascade,
  subject      text not null,
  score        integer default 0,
  total        integer default 5,
  questions    jsonb,
  completed_at timestamptz default now()
);

create table if not exists public.streaks (
  user_id        uuid references auth.users on delete cascade primary key,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active    date
);

create table if not exists public.past_papers (
  id              uuid default gen_random_uuid() primary key,
  subject         text not null,
  exam_board      text not null,
  year            integer not null,
  paper_number    integer not null,
  paper_type      text not null,
  title           text not null,
  pdf_url         text,
  mark_scheme_url text,
  examiner_url    text,
  created_at      timestamptz default now()
);

-- Same again for scripts/upload-papers.mjs, which upserts on these five
-- columns. Re-running an interrupted 612 MB upload is normal, so this mattering
-- is not hypothetical.
create unique index if not exists past_papers_identity_key
  on public.past_papers (subject, exam_board, year, paper_number, paper_type);

create table if not exists public.past_paper_logs (
  id        uuid default gen_random_uuid() primary key,
  user_id   uuid references auth.users on delete cascade,
  paper_id  uuid references public.past_papers on delete cascade,
  score     integer not null,
  max_score integer not null,
  notes     text,
  logged_at timestamptz default now()
);

create table if not exists public.mindset_prompts (
  id          uuid default gen_random_uuid() primary key,
  month       text not null,
  month_theme text,
  day         integer not null,
  confession  text not null,
  reflection  text,
  unique (month, day)
);

create table if not exists public.questions (
  id              uuid default gen_random_uuid() primary key,
  subject         text not null,
  pathway         text,
  month           text not null,
  day             integer not null,
  question_number integer not null,
  question_id     text,
  topic_id        text,
  topic_title     text,
  question        text not null,
  answer          text,
  marks           integer,
  difficulty      text,
  skill_type      text,
  solution_steps  text,
  hints           text,
  exam_board      text,
  calculator      text,
  has_diagram     boolean default false,
  diagram_notes   text,
  created_at      timestamptz default now(),
  unique (subject, pathway, month, day, question_number)
);

create table if not exists public.subjects (
  slug        text primary key,
  name        text not null,
  icon        text,
  color       text,
  exam_boards text[],
  active      boolean default false,
  coming_soon boolean default false,
  sort_order  integer default 0,
  -- Maths is tiered (Foundation 1-5 / Higher 4-9); Economics is not. Controls
  -- whether a tier is shown against a past paper. See migration 0005.
  tiered      boolean not null default false
);

-- `create table if not exists` leaves an existing table untouched, so the
-- column has to be added explicitly for this file to stay re-runnable against
-- a database that predates it.
alter table public.subjects
  add column if not exists tiered boolean not null default false;

alter table public.topics             enable row level security;
alter table public.topic_progress     enable row level security;
alter table public.diagnostic_results enable row level security;
alter table public.daily_sessions     enable row level security;
alter table public.streaks            enable row level security;
alter table public.past_papers        enable row level security;
alter table public.past_paper_logs    enable row level security;
alter table public.mindset_prompts    enable row level security;
alter table public.questions          enable row level security;
alter table public.subjects           enable row level security;

drop policy if exists "Topics are public" on public.topics;
create policy "Topics are public" on public.topics for select using (true);

drop policy if exists "Own topic progress" on public.topic_progress;
create policy "Own topic progress" on public.topic_progress for all using (auth.uid() = user_id);

drop policy if exists "Own diagnostics" on public.diagnostic_results;
create policy "Own diagnostics" on public.diagnostic_results for all using (auth.uid() = user_id);

drop policy if exists "Own daily sessions" on public.daily_sessions;
create policy "Own daily sessions" on public.daily_sessions for all using (auth.uid() = user_id);

drop policy if exists "Own streak" on public.streaks;
create policy "Own streak" on public.streaks for all using (auth.uid() = user_id);

drop policy if exists "Past papers are public" on public.past_papers;
create policy "Past papers are public" on public.past_papers for select using (true);

drop policy if exists "Own paper logs" on public.past_paper_logs;
create policy "Own paper logs" on public.past_paper_logs for all using (auth.uid() = user_id);

drop policy if exists "Mindset prompts are public" on public.mindset_prompts;
create policy "Mindset prompts are public" on public.mindset_prompts for select using (true);

drop policy if exists "Questions are public" on public.questions;
create policy "Questions are public" on public.questions for select using (true);

drop policy if exists "Subjects are public" on public.subjects;
create policy "Subjects are public" on public.subjects for select using (true);

insert into public.subjects (slug, name, icon, color, exam_boards, active, coming_soon, sort_order, tiered) values
  ('maths',     'GCSE Maths',     '📐', '#9970A6', '{AQA,Edexcel,OCR}', true, false, 1, true),
  ('economics', 'GCSE Economics', '📊', '#639922', '{AQA,Edexcel,OCR}', true, false, 2, false)
on conflict (slug) do nothing;

-- The insert above does nothing on an existing row, so the tier flags are set
-- separately - otherwise a database seeded before 0005 keeps the default.
update public.subjects set tiered = true  where slug = 'maths';
update public.subjects set tiered = false where slug = 'economics';


-- ===========================================================================
-- 3. PARENT-CHILD LINKING
--
-- Comes before the tutor, grades and subscription tables on purpose: each of
-- those has a policy whose USING clause selects from parent_child_links, and
-- Postgres parses a policy expression when the policy is created. If this table
-- did not exist yet, those CREATE POLICY statements would fail outright.
-- ===========================================================================

create table if not exists public.invite_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  claimed    boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index if not exists invite_codes_code_idx    on public.invite_codes(code);
create index if not exists invite_codes_student_idx on public.invite_codes(student_id);

alter table public.invite_codes enable row level security;

drop policy if exists "Students manage their own codes" on public.invite_codes;
create policy "Students manage their own codes"
  on public.invite_codes for all
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

drop policy if exists "Authenticated users can read codes to claim" on public.invite_codes;
create policy "Authenticated users can read codes to claim"
  on public.invite_codes for select
  using (auth.role() = 'authenticated');

create table if not exists public.parent_child_links (
  id        uuid primary key default gen_random_uuid(),
  parent_id uuid references public.profiles(id) on delete cascade not null,
  child_id  uuid references public.profiles(id) on delete cascade not null,
  linked_at timestamptz not null default now(),
  unique (parent_id, child_id)
);

create index if not exists parent_child_links_parent_idx on public.parent_child_links(parent_id);
create index if not exists parent_child_links_child_idx  on public.parent_child_links(child_id);

alter table public.parent_child_links enable row level security;

drop policy if exists "Parents view their own links" on public.parent_child_links;
create policy "Parents view their own links"
  on public.parent_child_links for select
  using (parent_id = auth.uid());

drop policy if exists "Parents create links" on public.parent_child_links;
create policy "Parents create links"
  on public.parent_child_links for insert
  with check (parent_id = auth.uid());

drop policy if exists "Students view links to them" on public.parent_child_links;
create policy "Students view links to them"
  on public.parent_child_links for select
  using (child_id = auth.uid());


-- ===========================================================================
-- 4. TUTOR TABLES
-- ===========================================================================

create table if not exists public.tutor_students (
  id             uuid primary key default gen_random_uuid(),
  tutor_id       uuid references public.profiles(id) on delete cascade not null,
  student_id     uuid references public.profiles(id) on delete cascade,
  student_name   text not null,
  student_email  text,
  subject        text not null default 'maths',
  year_group     integer,
  exam_board     text,
  streak         integer not null default 0,
  topics_covered integer not null default 0,
  last_active    timestamptz,
  joined_at      timestamptz not null default now()
);

create index if not exists tutor_students_tutor_idx on public.tutor_students(tutor_id);
alter table public.tutor_students enable row level security;

drop policy if exists "Tutors manage their own students" on public.tutor_students;
create policy "Tutors manage their own students"
  on public.tutor_students for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create table if not exists public.tutor_sessions (
  id            uuid primary key default gen_random_uuid(),
  tutor_id      uuid references public.profiles(id) on delete cascade not null,
  student_id    uuid references public.profiles(id) on delete set null,
  student_name  text not null,
  subject       text not null default 'maths',
  scheduled_at  timestamptz not null,
  duration_mins integer not null default 60,
  status        text not null default 'upcoming'
                  check (status in ('upcoming', 'completed', 'cancelled')),
  join_url      text,
  notes         text,
  created_at    timestamptz not null default now()
);

create index if not exists tutor_sessions_tutor_idx     on public.tutor_sessions(tutor_id);
create index if not exists tutor_sessions_student_idx   on public.tutor_sessions(student_id);
create index if not exists tutor_sessions_scheduled_idx on public.tutor_sessions(scheduled_at);

alter table public.tutor_sessions enable row level security;

drop policy if exists "Tutors manage their own sessions" on public.tutor_sessions;
create policy "Tutors manage their own sessions"
  on public.tutor_sessions for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

drop policy if exists "Students view their own sessions" on public.tutor_sessions;
create policy "Students view their own sessions"
  on public.tutor_sessions for select
  using (student_id = auth.uid());

create table if not exists public.tutor_resources (
  id                   uuid primary key default gen_random_uuid(),
  tutor_id             uuid references public.profiles(id) on delete cascade not null,
  title                text not null,
  subject              text not null default 'maths',
  type                 text not null default 'other'
                         check (type in ('worksheet', 'video', 'past_paper', 'notes', 'other')),
  url                  text not null,
  shared_with_students boolean not null default false,
  created_at           timestamptz not null default now()
);

create index if not exists tutor_resources_tutor_idx on public.tutor_resources(tutor_id);
alter table public.tutor_resources enable row level security;

drop policy if exists "Tutors manage their own resources" on public.tutor_resources;
create policy "Tutors manage their own resources"
  on public.tutor_resources for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

drop policy if exists "Students view resources shared with them" on public.tutor_resources;
create policy "Students view resources shared with them"
  on public.tutor_resources for select
  using (shared_with_students = true);

-- FIX 3 — tutor_bookings never existed.
-- src/pages/dashboard/parent/tabs/ParentBookingsTab.tsx queries tutor_bookings,
-- but no setup file or migration ever created it. The tab discards the query
-- error, so on the old project it silently showed "no bookings" forever rather
-- than failing loudly. Defined here to match the Booking interface in that file
-- (note session_date and session_time are separate columns, and the tutor name
-- is denormalised — that is what the component reads).
create table if not exists public.tutor_bookings (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid references public.profiles(id) on delete cascade not null,
  tutor_id      uuid references public.profiles(id) on delete set null,
  tutor_name    text not null,
  subject       text not null default 'maths',
  session_date  date not null,
  session_time  time not null,
  duration_mins integer not null default 60,
  status        text not null default 'upcoming'
                  check (status in ('upcoming', 'completed', 'cancelled')),
  notes         text,
  meeting_url   text,
  created_at    timestamptz not null default now()
);

create index if not exists tutor_bookings_student_idx on public.tutor_bookings(student_id);
create index if not exists tutor_bookings_tutor_idx   on public.tutor_bookings(tutor_id);
create index if not exists tutor_bookings_date_idx    on public.tutor_bookings(session_date);

alter table public.tutor_bookings enable row level security;

drop policy if exists "Students view their own bookings" on public.tutor_bookings;
create policy "Students view their own bookings"
  on public.tutor_bookings for select to authenticated
  using (student_id = auth.uid());

drop policy if exists "Tutors manage their own bookings" on public.tutor_bookings;
create policy "Tutors manage their own bookings"
  on public.tutor_bookings for all to authenticated
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

-- The parent dashboard's whole purpose: a linked parent reads their child's
-- bookings. Read only — a parent never books or cancels from here.
drop policy if exists "Parents view their child's bookings" on public.tutor_bookings;
create policy "Parents view their child's bookings"
  on public.tutor_bookings for select to authenticated
  using (
    exists (
      select 1 from public.parent_child_links l
      where l.child_id = tutor_bookings.student_id
        and l.parent_id = auth.uid()
    )
  );


-- ===========================================================================
-- 5. ENGAGEMENT — XP, LEVELS, ACHIEVEMENTS
-- ===========================================================================

create table if not exists public.user_stats (
  user_id    uuid references auth.users on delete cascade primary key,
  xp_total   integer default 0,
  level      integer default 1,
  updated_at timestamptz default now()
);

create table if not exists public.xp_events (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users on delete cascade,
  source        text not null,
  source_ref_id text,
  amount        integer not null,
  created_at    timestamptz default now(),
  unique (user_id, source, source_ref_id)
);

create table if not exists public.achievements (
  slug           text primary key,
  name           text not null,
  description    text,
  icon           text,
  xp_reward      integer default 0,
  criteria_type  text not null,
  criteria_value integer not null,
  subject        text,
  sort_order     integer default 0
);

create table if not exists public.user_achievements (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users on delete cascade,
  achievement_slug text references public.achievements on delete cascade,
  unlocked_at      timestamptz default now(),
  unique (user_id, achievement_slug)
);

alter table public.user_stats        enable row level security;
alter table public.xp_events         enable row level security;
alter table public.achievements      enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "Own stats" on public.user_stats;
create policy "Own stats" on public.user_stats for all using (auth.uid() = user_id);

drop policy if exists "Own xp events" on public.xp_events;
create policy "Own xp events" on public.xp_events for all using (auth.uid() = user_id);

drop policy if exists "Achievements are public" on public.achievements;
create policy "Achievements are public" on public.achievements for select using (true);

drop policy if exists "Own achievements" on public.user_achievements;
create policy "Own achievements" on public.user_achievements for all using (auth.uid() = user_id);

insert into public.achievements (slug, name, description, icon, xp_reward, criteria_type, criteria_value, subject, sort_order) values
  ('first_daily5',     'First Steps',     'Complete your first Daily 5',       '⚡', 25,  'daily5_count',    1,  null, 1),
  ('streak_7',         'Week Warrior',    'Reach a 7-day streak',              '🔥', 50,  'streak_days',     7,  null, 2),
  ('streak_30',        'Monthly Master',  'Reach a 30-day streak',             '🏆', 200, 'streak_days',     30, null, 3),
  ('topics_10',        'Getting Started', 'Cover 10 topics',                   '📚', 50,  'topics_covered',  10, null, 4),
  ('topics_25',        'Topic Champion',  'Cover 25 topics',                   '🎓', 100, 'topics_covered',  25, null, 5),
  ('paper_first',      'First Paper',     'Log your first past paper score',   '📄', 30,  'papers_logged',   1,  null, 6),
  ('paper_high_score', 'High Achiever',   'Average 80%+ across logged papers', '🌟', 75,  'paper_avg_score', 80, null, 7)
on conflict (slug) do nothing;


-- ===========================================================================
-- 6. GRADES, SUBSCRIPTIONS, QUESTION REPORTS
-- (was migrations 0002, 0003, 0004)
-- ===========================================================================

-- ── Student grades (migration 0002) ────────────────────────────────────────
create table if not exists public.student_grades (
  user_id       uuid not null references auth.users (id) on delete cascade,
  subject       text not null,
  -- Null is meaningful: the student has not told us their working grade yet.
  working_grade smallint check (working_grade between 1 and 9),
  target_grade  smallint check (target_grade  between 1 and 9),
  updated_at    timestamptz not null default now(),
  primary key (user_id, subject)
);

alter table public.student_grades enable row level security;

drop policy if exists "student_grades_own_rows" on public.student_grades;
create policy "student_grades_own_rows"
  on public.student_grades for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "student_grades_linked_parent_read" on public.student_grades;
create policy "student_grades_linked_parent_read"
  on public.student_grades for select to authenticated
  using (
    exists (
      select 1 from public.parent_child_links l
      where l.child_id = student_grades.user_id
        and l.parent_id = auth.uid()
    )
  );

-- ── Subscriptions (migration 0003) ─────────────────────────────────────────
-- Stripe is the source of truth for money; this is a local cache of Stripe's
-- answer. The webhook, running as the service role, is the only writer of paid
-- entitlement. The one thing a browser may write is the no-card free trial.
create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users (id) on delete cascade,

  plan_id                text not null default 'free'
                         check (plan_id in ('free', 'student_complete', 'family', 'tutor')),

  status                 text not null default 'none'
                         check (status in ('none', 'trialing', 'active', 'past_due',
                                           'canceled', 'incomplete', 'unpaid')),

  seats                  integer not null default 1 check (seats between 1 and 25),

  stripe_customer_id     text unique,
  stripe_subscription_id text unique,

  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,

  -- The no-card seven-day trial. Deliberately NOT a Stripe trial: the copy and
  -- the Subscription Terms both promise no card and no automatic charge.
  trial_ends_at          timestamptz,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "subscriptions_select_linked_parent" on public.subscriptions;
create policy "subscriptions_select_linked_parent"
  on public.subscriptions for select to authenticated
  using (
    exists (
      select 1 from public.parent_child_links l
      where l.child_id = subscriptions.user_id
        and l.parent_id = auth.uid()
    )
  );

-- Start your own free trial, once, and nothing else. Every field is pinned.
-- There is deliberately NO update or delete policy, so a trial cannot be
-- extended, restarted or promoted to 'active' from the browser.
drop policy if exists "subscriptions_insert_own_trial" on public.subscriptions;
create policy "subscriptions_insert_own_trial"
  on public.subscriptions for insert to authenticated
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

-- Webhook idempotency: Stripe retries, so inserting the id first makes a
-- replay a no-op. No policies — only the service role touches this.
create table if not exists public.stripe_events (
  id          text primary key,
  type        text not null,
  received_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;

-- ── Question reports (migration 0004) ──────────────────────────────────────
create table if not exists public.question_reports (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  reason      text not null check (reason in (
                'incorrect_answer',
                'unclear_wording',
                'image_or_diagram',
                'mark_scheme',
                'other'
              )),
  note        text check (note is null or length(note) <= 500),
  resolved_at timestamptz,
  resolved_by uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  -- Pressing the button twice is a mistake, not a second opinion.
  unique (question_id, user_id)
);

create index if not exists question_reports_open_idx
  on public.question_reports (question_id) where resolved_at is null;

alter table public.question_reports enable row level security;

drop policy if exists "question_reports_insert_own" on public.question_reports;
create policy "question_reports_insert_own"
  on public.question_reports for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "question_reports_select_own" on public.question_reports;
create policy "question_reports_select_own"
  on public.question_reports for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "question_reports_admin_all" on public.question_reports;
create policy "question_reports_admin_all"
  on public.question_reports for all to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ── Question bank ──────────────────────────────────────────────────────────
--
-- Deliberately NOT the `questions` table. That one is Daily 5: every row needs
-- a month, a day and a number 1-5, and its unique key is built from them. This
-- is a topic-organised bank — ~29,000 questions across ten topic areas, one
-- spreadsheet per sub-topic — with no dates at all. Merging them would mean
-- inventing calendar positions for content that has none.
--
-- Seeded by scripts/seed-question-bank.mjs.
create table if not exists public.question_bank (
  id              uuid primary key default gen_random_uuid(),
  subject         text not null,
  -- Both come from the folder and file names, as with the past papers:
  -- topic_area is 'Algebra', 'Number 2'…; topic is the spreadsheet's name.
  topic_area      text not null,
  topic           text not null,
  -- Position within the spreadsheet. The source has no question-number column —
  -- the number is written into the question text ("1. Solve…") — so row order
  -- is the only stable identity, and it makes re-running the seed idempotent.
  ordinal         integer not null,
  -- The sheet's own "Question ID" where it has one; two thirds of files do.
  source_ref      text,

  question        text not null,
  answer          text,
  -- The sheet's "Topic" column, which describes what the question tests rather
  -- than naming a topic — e.g. "Solve a two-step linear inequality".
  skill           text,

  aqa_code        text,
  edexcel_code    text,
  ocr_code        text,

  calculator      text check (calculator in ('calculator', 'non_calculator', 'either')),
  solution_steps  text,
  hint            text,
  -- "SOLVE-INEQUALITY; NEGATIVE-COEFFICIENT; REVERSE-SIGN" split on the
  -- semicolons, so a wrong answer can be traced to a named gap.
  skill_tags      text[],
  question_type   text,

  -- No constraint, on purpose. The source mixes at least four vocabularies in
  -- this column — exam tier (Foundation/Higher), purpose (Fluency/Exam),
  -- effort (Easy…Very Hard) and others (Low/Standard/Core/Accessible). A check
  -- would reject most of the bank. Filter on estimated_grade instead, which is
  -- consistent across 29,106 of the 29,136 rows.
  difficulty      text,
  estimated_grade smallint check (estimated_grade between 1 and 9),
  -- Kept because a handful of rows say "8/9" or "2-3", which estimated_grade
  -- cannot hold and which are still meaningful to a teacher.
  grade_label     text,

  needs_image     boolean not null default false,
  needs_table     boolean not null default false,
  asset_ref       text,
  asset_notes     text,

  created_at      timestamptz not null default now(),
  unique (subject, topic_area, topic, ordinal)
);

create index if not exists question_bank_subject_area_idx
  on public.question_bank (subject, topic_area);
create index if not exists question_bank_grade_idx
  on public.question_bank (subject, estimated_grade);

alter table public.question_bank enable row level security;

drop policy if exists "Question bank is public" on public.question_bank;
create policy "Question bank is public"
  on public.question_bank for select using (true);

-- Admins maintain it from the admin panel.
drop policy if exists "question_bank_admin_all" on public.question_bank;
create policy "question_bank_admin_all"
  on public.question_bank for all to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ===========================================================================
-- 7. STORAGE BUCKETS
--
-- scripts/upload-papers.mjs writes everything — question papers, mark schemes
-- and examiner reports — into the single "past-papers" bucket, pathed by type.
-- The other two buckets mentioned in the old setup comments are not used by any
-- code; they are created here anyway so the names are reserved and a later
-- reorganisation does not need a schema change.
--
-- Public buckets are readable without a policy, and the upload script runs as
-- the service role, which bypasses RLS — so no storage policies are needed.
-- ===========================================================================

insert into storage.buckets (id, name, public)
values
  ('past-papers',      'past-papers',      true),
  ('mark-schemes',     'mark-schemes',     true),
  ('examiner-reports', 'examiner-reports', true)
on conflict (id) do nothing;


-- ===========================================================================
-- AFTER RUNNING
--
-- 1. Create the first admin by hand. Sign up through the app as a student,
--    find the user in Authentication → Users, then:
--       update public.profiles set role = 'admin' where id = '<the user uuid>';
--    This runs as the service role and is not subject to the policies above.
--    After that, the admin panel's Users tab can promote anyone else.
--
-- 2. Seed the content — see docs/SUPABASE_MIGRATION.md, section 4.
--
-- 3. Sanity-check RLS before real students use this. The quickest check:
--    sign in as a student in one browser, a parent in another, and confirm
--    neither can read the other's rows.
-- ===========================================================================
