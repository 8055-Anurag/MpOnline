-- DEBUG: Temporarily allow public access to see if it fixes the empty list
drop policy if exists "Admins can manage requests" on public.operator_requests;

-- Allow ALL operations for debugging (Revert this later!)
create policy "Debug: Open Access" 
  on public.operator_requests 
  for all 
  using (true);
