-- Students reporting a problem with a question.
--
-- Daily 5 already had a "Flag for review" button, but it only set state in the
-- browser and went nowhere. This gives it somewhere to go, and gives the admin
-- panel a queue to work through.
--
-- The reasons are the client's list, fixed at the database level so a report
-- cannot arrive with a reason nothing knows how to display.

create table if not exists public.question_reports (
  id          uuid        primary key default gen_random_uuid(),
  question_id uuid        not null references public.questions (id) on delete cascade,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  reason      text        not null check (reason in (
                'incorrect_answer',
                'unclear_wording',
                'image_or_diagram',
                'mark_scheme',
                'other'
              )),
  -- Optional, and the only free text a student can send. Kept short on the
  -- client too, since nobody is moderating it in real time.
  note        text        check (note is null or length(note) <= 500),
  -- Open until an admin has dealt with it. Resolved reports stay for the record
  -- rather than being deleted, so a question that keeps drawing complaints is
  -- visible as a pattern.
  resolved_at timestamptz,
  resolved_by uuid        references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  -- One open report per student per question: pressing the button twice is a
  -- mistake, not a second opinion.
  unique (question_id, user_id)
);

create index if not exists question_reports_open_idx
  on public.question_reports (question_id) where resolved_at is null;

alter table public.question_reports enable row level security;

-- A student may report a question and see what they reported. They may not see
-- anyone else's reports, and they may not edit one after sending it.
drop policy if exists "question_reports_insert_own" on public.question_reports;
create policy "question_reports_insert_own"
  on public.question_reports
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "question_reports_select_own" on public.question_reports;
create policy "question_reports_select_own"
  on public.question_reports
  for select
  to authenticated
  using (user_id = auth.uid());

-- Admins see every report and are the only ones who can resolve one.
drop policy if exists "question_reports_admin_all" on public.question_reports;
create policy "question_reports_admin_all"
  on public.question_reports
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
