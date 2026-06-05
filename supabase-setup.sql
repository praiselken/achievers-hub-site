-- Run this in Supabase → SQL Editor

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('student', 'parent', 'tutor')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);
