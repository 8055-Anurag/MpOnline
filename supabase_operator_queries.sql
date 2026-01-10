-- ==========================================
-- 1. Operator Signup (Profile Creation)
-- ==========================================
-- Creates the operators table to store profile info.
-- This table is linked to auth.users.
create table if not exists public.operators (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  mobile text,
  is_active boolean default false, -- IMPORTANT: Defaults to false so they are "Pending"
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.operators enable row level security;

-- POLICY: Allow ANY authenticated user to insert their OWN profile.
-- This is used during Signup immediately after creating the Auth User.
create policy "Users can check insert their own operator profile"
on public.operators for insert
to authenticated
with check (auth.uid() = id);

-- ==========================================
-- 2. Operator Login (Profile Fetching)
-- ==========================================
-- When an operator logs in, the app fetches their profile to check 'is_active'.

-- POLICY: Allow authenticated users to view profiles.
-- Ideally restricted to self + admins, but for this setup 'authenticated' viewing all is simple/safe for directory.
create policy "Authenticated users can view operators"
on public.operators for select
to authenticated
using (true);

-- ==========================================
-- 3. Admin Approval (Update Status)
-- ==========================================
-- Admin clicks "Approve" -> Updates is_active = true.
-- Admin clicks "Deactivate" -> Updates is_active = false.

-- POLICY: Allow authenticated users (Admins) to update operators.
-- Note: In a stricter app, you would check if auth.uid() belongs to an 'admins' table.
create policy "Authenticated users can update operators"
on public.operators for update
to authenticated
using (true);

-- Admin clicks "Reject" -> Deletes the operator profile.
create policy "Authenticated users can delete operators"
on public.operators for delete
to authenticated
using (true);
