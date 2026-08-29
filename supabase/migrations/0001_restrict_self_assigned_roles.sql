-- Stop accounts from granting themselves a privileged role.
--
-- WHY THIS IS NEEDED
-- The app writes profiles.role at signup from a value the browser supplies.
-- Fixing the client is not enough: anyone with a valid session can call the
-- REST API directly and insert whatever role they like. The database has to be
-- the thing that says no.
--
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run.

-- 1. A person may only ever create their OWN profile, and only as a
--    non-privileged role. Admin is granted out-of-band, never self-served.
drop policy if exists "profiles_insert_self_nonprivileged" on public.profiles;
create policy "profiles_insert_self_nonprivileged"
  on public.profiles
  for insert
  to authenticated
  with check (
    id = auth.uid()
    and role in ('student', 'parent', 'tutor')
  );

-- 2. A person may update their own profile but NOT change their own role.
--    Without this, an account could sign up as a student and then promote
--    itself with a follow-up update.
drop policy if exists "profiles_update_self_no_role_change" on public.profiles;
create policy "profiles_update_self_no_role_change"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- 3. Belt and braces: reject a privileged role at the row level even if a
--    policy is later loosened by mistake.
alter table public.profiles
  drop constraint if exists profiles_role_allowed;
alter table public.profiles
  add constraint profiles_role_allowed
  check (role in ('student', 'parent', 'tutor', 'admin'));

-- Make sure RLS is actually switched on — policies do nothing without it.
alter table public.profiles enable row level security;

-- AFTER RUNNING: promote real admins deliberately, from the SQL editor, e.g.
--   update public.profiles set role = 'admin' where id = '<the user uuid>';
-- That statement runs as the service role and is not subject to the policies above.
