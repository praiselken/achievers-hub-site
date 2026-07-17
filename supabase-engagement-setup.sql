-- ── Run this in Supabase → SQL Editor ──────────────────────────────────────
-- Run AFTER supabase-setup.sql and supabase-dashboard-setup.sql (profiles/topics must exist first)
-- XP, levels and achievements for the student dashboard gamification layer.

-- ── User stats (XP / level) ─────────────────────────────────────────────────
create table if not exists user_stats (
  user_id    uuid references auth.users on delete cascade primary key,
  xp_total   integer default 0,
  level      integer default 1,
  updated_at timestamptz default now()
);

-- ── XP events (audit log — source of truth, enables idempotent awarding) ────
create table if not exists xp_events (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users on delete cascade,
  source         text not null,       -- 'daily5' | 'daily5_correct' | 'topic_covered' | 'paper_logged' | 'paper_high_score' | 'achievement' | ...
  source_ref_id  text,                -- e.g. the daily_sessions.id, topic_id, paper_id, or achievement slug that triggered this
  amount         integer not null,
  created_at     timestamptz default now(),
  unique (user_id, source, source_ref_id)
);

-- ── Achievements catalog (public, like topics/past_papers) ──────────────────
create table if not exists achievements (
  slug           text primary key,
  name           text not null,
  description    text,
  icon           text,
  xp_reward      integer default 0,
  criteria_type  text not null,   -- 'streak_days' | 'topics_covered' | 'daily5_count' | 'papers_logged' | 'paper_avg_score'
  criteria_value integer not null,
  subject        text,           -- null = cross-subject
  sort_order     integer default 0
);

-- ── Unlocked achievement instances ──────────────────────────────────────────
create table if not exists user_achievements (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users on delete cascade,
  achievement_slug text references achievements on delete cascade,
  unlocked_at      timestamptz default now(),
  unique (user_id, achievement_slug)
);

-- ── RLS policies ─────────────────────────────────────────────────────────────
alter table user_stats        enable row level security;
alter table xp_events          enable row level security;
alter table achievements       enable row level security;
alter table user_achievements  enable row level security;

create policy "Own stats" on user_stats for all using (auth.uid() = user_id);
create policy "Own xp events" on xp_events for all using (auth.uid() = user_id);
create policy "Achievements are public" on achievements for select using (true);
create policy "Own achievements" on user_achievements for all using (auth.uid() = user_id);

-- ── Seed achievements ────────────────────────────────────────────────────────
insert into achievements (slug, name, description, icon, xp_reward, criteria_type, criteria_value, subject, sort_order) values
  ('first_daily5',     'First Steps',      'Complete your first Daily 5',            '⚡', 25,  'daily5_count',    1,  null, 1),
  ('streak_7',         'Week Warrior',     'Reach a 7-day streak',                   '🔥', 50,  'streak_days',     7,  null, 2),
  ('streak_30',        'Monthly Master',   'Reach a 30-day streak',                  '🏆', 200, 'streak_days',     30, null, 3),
  ('topics_10',        'Getting Started',  'Cover 10 topics',                        '📚', 50,  'topics_covered',  10, null, 4),
  ('topics_25',        'Topic Champion',   'Cover 25 topics',                        '🎓', 100, 'topics_covered',  25, null, 5),
  ('paper_first',      'First Paper',      'Log your first past paper score',        '📄', 30,  'papers_logged',   1,  null, 6),
  ('paper_high_score', 'High Achiever',    'Average 80%+ across logged papers',      '🌟', 75,  'paper_avg_score', 80, null, 7)
on conflict (slug) do nothing;
