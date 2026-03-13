-- Run this in Supabase SQL editor (PostgreSQL)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  account_type text not null check (account_type in ('freelancer', 'employee', 'company')),
  phone text,
  company_name text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
