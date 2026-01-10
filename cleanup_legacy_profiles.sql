-- CLEANUP SCRIPT
-- The user has stated that the 'profiles' table is discarded.
-- The error "infinite recursion detected in policy for relation 'profiles'" indicates
-- that this table still exists and has broken policies causing issues.

-- 1. Drop the legacy 'profiles' table if it exists
-- CASCADE will remove dependent views, triggers, and foreign keys.
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Verify and Re-Apply the Correct Schema (Safe to run multiple times)

-- Create Security Definer Functions (Bypass RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

-- ADMINS (if dropped by cascade, recreate)
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.admins enable row level security;
drop policy if exists "Admins can view admins" on public.admins;
create policy "Admins can view admins" on public.admins for select using (auth.uid() = id);


-- OPERATORS
create table if not exists public.operators (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  mobile text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.operators enable row level security;
drop policy if exists "Operators can view own profile" on public.operators;
create policy "Operators can view own profile" on public.operators for select using (auth.uid() = id);
drop policy if exists "Admins can view all operators" on public.operators;
create policy "Admins can view all operators" on public.operators for select using (public.is_admin());
drop policy if exists "Admins can manage operators" on public.operators;
create policy "Admins can manage operators" on public.operators for all using (public.is_admin());

-- OPERATOR REQUESTS
create table if not exists public.operator_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  mobile text,
  password text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_at timestamp with time zone
);
alter table public.operator_requests enable row level security;
drop policy if exists "Anyone can submit operator request" on public.operator_requests;
create policy "Anyone can submit operator request" on public.operator_requests for insert with check (true);
drop policy if exists "Admins can manage requests" on public.operator_requests;
create policy "Admins can manage requests" on public.operator_requests for all using (public.is_admin());

-- 3. Restore Strict Role Separation Triggers

create or replace function public.check_not_operator() returns trigger language plpgsql security definer as $$
begin
  if exists (select 1 from public.operators where id = NEW.id) then
    raise exception 'User is currently an Operator. Role overlap not allowed.';
  end if;
  return NEW;
end;
$$;
drop trigger if exists ensure_not_operator_before_admin on public.admins;
create trigger ensure_not_operator_before_admin before insert on public.admins for each row execute function public.check_not_operator();


create or replace function public.check_not_admin() returns trigger language plpgsql security definer as $$
begin
  if exists (select 1 from public.admins where id = NEW.id) then
    raise exception 'User is currently an Admin. Role overlap not allowed.';
  end if;
  return NEW;
end;
$$;
drop trigger if exists ensure_not_admin_before_operator on public.operators;
create trigger ensure_not_admin_before_operator before insert on public.operators for each row execute function public.check_not_admin();

