-- ── Run this in Supabase → SQL Editor ──────────────────────────────────────
-- Run AFTER supabase-setup.sql (profiles table must exist first)

-- ── Topics ──────────────────────────────────────────────────────────────────
create table if not exists topics (
  id          uuid default gen_random_uuid() primary key,
  subject     text not null,           -- 'maths' | 'economics'
  exam_board  text not null default 'all', -- 'AQA' | 'Edexcel' | 'OCR' | 'all'
  area        text not null,           -- e.g. 'Algebra', 'Labour Market'
  name        text not null,           -- e.g. 'Quadratic Equations'
  description text,
  key_points  jsonb,                   -- array of strings
  exam_tip    text,
  practice_q  text,
  practice_a  text,
  video_url   text,
  pathway_min text default 'numeracy', -- minimum pathway level
  created_at  timestamptz default now()
);

-- ── Topic progress ───────────────────────────────────────────────────────────
create table if not exists topic_progress (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users on delete cascade,
  topic_id       uuid references topics on delete cascade,
  status         text default 'not_started', -- 'not_started' | 'in_progress' | 'covered'
  score_avg      numeric default 0,
  attempts       integer default 0,
  last_practiced timestamptz,
  unique(user_id, topic_id)
);

-- ── Diagnostic results ───────────────────────────────────────────────────────
create table if not exists diagnostic_results (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade,
  subject    text not null,
  exam_board text not null,
  pathway    text not null,  -- 'numeracy'|'foundation'|'foundation_plus'|'higher'|'higher_plus'
  score      integer,
  total      integer,
  taken_at   timestamptz default now()
);

-- ── Daily sessions ───────────────────────────────────────────────────────────
create table if not exists daily_sessions (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users on delete cascade,
  subject      text not null,
  score        integer default 0,
  total        integer default 5,
  questions    jsonb,
  completed_at timestamptz default now()
);

-- ── Streaks ──────────────────────────────────────────────────────────────────
create table if not exists streaks (
  user_id        uuid references auth.users on delete cascade primary key,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active    date
);

-- ── Past papers ──────────────────────────────────────────────────────────────
create table if not exists past_papers (
  id               uuid default gen_random_uuid() primary key,
  subject          text not null,
  exam_board       text not null,
  year             integer not null,
  paper_number     integer not null,  -- 1, 2, 3
  paper_type       text not null,     -- 'foundation' | 'higher'
  title            text not null,
  pdf_url          text,              -- Supabase storage path
  mark_scheme_url  text,
  examiner_url     text,
  created_at       timestamptz default now()
);

-- ── Past paper logs ──────────────────────────────────────────────────────────
create table if not exists past_paper_logs (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade,
  paper_id   uuid references past_papers on delete cascade,
  score      integer not null,
  max_score  integer not null,
  notes      text,
  logged_at  timestamptz default now()
);

-- ── RLS policies ─────────────────────────────────────────────────────────────
alter table topics           enable row level security;
alter table topic_progress   enable row level security;
alter table diagnostic_results enable row level security;
alter table daily_sessions   enable row level security;
alter table streaks          enable row level security;
alter table past_papers      enable row level security;
alter table past_paper_logs  enable row level security;

-- Topics: anyone can read
create policy "Topics are public" on topics for select using (true);

-- Topic progress: own rows only
create policy "Own topic progress" on topic_progress for all using (auth.uid() = user_id);

-- Diagnostics: own rows only
create policy "Own diagnostics" on diagnostic_results for all using (auth.uid() = user_id);

-- Daily sessions: own rows only
create policy "Own daily sessions" on daily_sessions for all using (auth.uid() = user_id);

-- Streaks: own row only
create policy "Own streak" on streaks for all using (auth.uid() = user_id);

-- Past papers: anyone can read
create policy "Past papers are public" on past_papers for select using (true);

-- Past paper logs: own rows only
create policy "Own paper logs" on past_paper_logs for all using (auth.uid() = user_id);

-- ── Storage buckets ───────────────────────────────────────────────────────────
-- Run these separately in Supabase → Storage → New bucket:
--   Bucket name: "past-papers"     | Public: true
--   Bucket name: "mark-schemes"    | Public: true
--   Bucket name: "examiner-reports"| Public: true
--
-- Suggested folder structure inside "past-papers":
--   maths/AQA/2024/paper-1-higher.pdf
--   maths/AQA/2024/paper-2-foundation.pdf
--   economics/AQA/2023/paper-1.pdf
