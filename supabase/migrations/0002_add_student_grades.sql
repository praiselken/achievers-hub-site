-- Working and target GCSE grades, per subject.
--
-- These are the student-facing replacement for the internal pathway tiers.
-- The tiers (numeracy … higher_plus) stay in the topics table and keep driving
-- question selection; they are simply never shown next to a GCSE grade.
--
-- Until this runs, the app keeps grades in the browser's local storage, so the
-- feature works but does not follow a student between devices. After running,
-- src/lib/grades.ts can read and write these columns instead.

create table if not exists public.student_grades (
  user_id     uuid    not null references auth.users (id) on delete cascade,
  subject     text    not null,
  -- Null is meaningful: the student has not told us their working grade yet.
  working_grade smallint check (working_grade between 1 and 9),
  target_grade  smallint check (target_grade  between 1 and 9),
  updated_at  timestamptz not null default now(),
  primary key (user_id, subject)
);

alter table public.student_grades enable row level security;

-- A student reads and writes only their own grades.
drop policy if exists "student_grades_own_rows" on public.student_grades;
create policy "student_grades_own_rows"
  on public.student_grades
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- A linked parent may read, but never write, their child's grades.
drop policy if exists "student_grades_linked_parent_read" on public.student_grades;
create policy "student_grades_linked_parent_read"
  on public.student_grades
  for select
  to authenticated
  using (
    exists (
      select 1 from public.parent_child_links l
      where l.child_id = student_grades.user_id
        and l.parent_id = auth.uid()
    )
  );
