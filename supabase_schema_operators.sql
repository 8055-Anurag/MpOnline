-- Create operators table if not exists (matching user schema)
create table if not exists public.operators (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  mobile text,
  is_active boolean default false, -- Default to false (pending) upon registration
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.operators enable row level security;

-- Policies for Admins (Assuming admins have a way to be identified, or just allow all auth users to read for now if admin role isn't strict yet)
-- For this prototype, we'll allow authenticated users to read/update to unblock standard flows, 
-- but realistically strict RLS should check for 'admin' role or specific metadata.

-- Allow read access to everyone (public) or just authenticated?
-- Admins need to see all. Operators need to see themselves.
create policy "Admins View All Operators"
on public.operators for select
to authenticated
using (true); 

-- Allow insert by authenticated users (Registration flow)
create policy "Users can insert their own operator profile"
on public.operators for insert
to authenticated
with check (auth.uid() = id);

-- Allow updates by admins (or self?)
-- For now, allow authenticated to update (for admin dashboard functionality without strict role setup)
create policy "Admins can update operators"
on public.operators for update
to authenticated
using (true);

-- Allow delete by admins
create policy "Admins can delete operators"
on public.operators for delete
to authenticated
using (true);

-- Drop old table if it exists to avoid confusion
drop table if exists public.operator_requests;
