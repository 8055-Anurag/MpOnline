-- 1. Helper Function: is_admin (Bypasses RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

-- 2. ADMINS TABLE
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admins enable row level security;

create policy "Admins can view admins" 
  on public.admins for select 
  using (auth.uid() = id);

-- 3. OPERATORS TABLE
create table if not exists public.operators (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  mobile text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.operators enable row level security;

create policy "Operators can view own profile" 
  on public.operators for select 
  using (auth.uid() = id);

-- Use function to avoid recursion
create policy "Admins can view all operators" 
  on public.operators for select 
  using (public.is_admin());

create policy "Admins can manage operators" 
  on public.operators for all 
  using (public.is_admin());


-- 4. OPERATOR REQUESTS TABLE
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

create policy "Anyone can submit operator request" 
  on public.operator_requests for insert 
  with check (true);

create policy "Admins can manage requests" 
  on public.operator_requests for all 
  using (public.is_admin());


-- 5. MUTUAL EXCLUSION TRIGGERS (Strict Role Separation)

-- Function to check if user is already an Operator
create or replace function public.check_not_operator()
returns trigger
language plpgsql
security definer
as $$
begin
  if exists (select 1 from public.operators where id = NEW.id) then
    raise exception 'User is currently an Operator. Role overlap not allowed.';
  end if;
  return NEW;
end;
$$;

-- Trigger: Prevent Admin Insert if Operator exists
drop trigger if exists ensure_not_operator_before_admin on public.admins;
create trigger ensure_not_operator_before_admin
  before insert on public.admins
  for each row execute function public.check_not_operator();


-- Function to check if user is already an Admin
create or replace function public.check_not_admin()
returns trigger
language plpgsql
security definer
as $$
begin
  if exists (select 1 from public.admins where id = NEW.id) then
    raise exception 'User is currently an Admin. Role overlap not allowed.';
  end if;
  return NEW;
end;
$$;

-- Trigger: Prevent Operator Insert if Admin exists
drop trigger if exists ensure_not_admin_before_operator on public.operators;
create trigger ensure_not_admin_before_operator
  before insert on public.operators
  for each row execute function public.check_not_admin();
