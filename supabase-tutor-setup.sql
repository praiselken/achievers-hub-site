-- ============================================================
-- Tutor dashboard tables
-- Run this in your Supabase SQL editor
-- ============================================================

-- Extra columns on profiles needed for tutors
alter table profiles
  add column if not exists bio                  text,
  add column if not exists qualifications       text,
  add column if not exists hourly_rate          numeric(6,2),
  add column if not exists years_experience     integer,
  add column if not exists availability_notes   text;

-- ── tutor_students ───────────────────────────────────────────
-- Links a tutor to a student they work with
create table if not exists tutor_students (
  id               uuid primary key default gen_random_uuid(),
  tutor_id         uuid references profiles(id) on delete cascade not null,
  student_id       uuid references profiles(id) on delete cascade,
  student_name     text not null,
  student_email    text,
  subject          text not null default 'maths',
  year_group       integer,
  exam_board       text,
  streak           integer not null default 0,
  topics_covered   integer not null default 0,
  last_active      timestamptz,
  joined_at        timestamptz not null default now()
);

create index if not exists tutor_students_tutor_idx on tutor_students(tutor_id);

alter table tutor_students enable row level security;

create policy "Tutors manage their own students"
  on tutor_students for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

-- ── tutor_sessions ───────────────────────────────────────────
-- One row per booked session
create table if not exists tutor_sessions (
  id               uuid primary key default gen_random_uuid(),
  tutor_id         uuid references profiles(id) on delete cascade not null,
  student_id       uuid references profiles(id) on delete set null,
  student_name     text not null,
  subject          text not null default 'maths',
  scheduled_at     timestamptz not null,
  duration_mins    integer not null default 60,
  status           text not null default 'upcoming'
                     check (status in ('upcoming', 'completed', 'cancelled')),
  join_url         text,
  notes            text,
  created_at       timestamptz not null default now()
);

create index if not exists tutor_sessions_tutor_idx    on tutor_sessions(tutor_id);
create index if not exists tutor_sessions_student_idx  on tutor_sessions(student_id);
create index if not exists tutor_sessions_scheduled_idx on tutor_sessions(scheduled_at);

alter table tutor_sessions enable row level security;

create policy "Tutors manage their own sessions"
  on tutor_sessions for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy "Students view their own sessions"
  on tutor_sessions for select
  using (student_id = auth.uid());

-- ── tutor_resources ──────────────────────────────────────────
-- Files/links a tutor uploads or shares
create table if not exists tutor_resources (
  id                    uuid primary key default gen_random_uuid(),
  tutor_id              uuid references profiles(id) on delete cascade not null,
  title                 text not null,
  subject               text not null default 'maths',
  type                  text not null default 'other'
                          check (type in ('worksheet', 'video', 'past_paper', 'notes', 'other')),
  url                   text not null,
  shared_with_students  boolean not null default false,
  created_at            timestamptz not null default now()
);

create index if not exists tutor_resources_tutor_idx on tutor_resources(tutor_id);

alter table tutor_resources enable row level security;

create policy "Tutors manage their own resources"
  on tutor_resources for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy "Students view resources shared with them"
  on tutor_resources for select
  using (shared_with_students = true);
