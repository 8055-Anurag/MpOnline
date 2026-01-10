-- Enable RLS (just in case)
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;

-- 1. ADMIMS: Allow admins to view ALL operators
-- We check if the requesting user exists in public.users with role 'admin'
DROP POLICY IF EXISTS "Admins can view all operators" ON public.operators;
CREATE POLICY "Admins can view all operators"
ON public.operators
FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

-- 2. OPERATORS: Allow operators to view THEIR OWN profile
DROP POLICY IF EXISTS "Operators can view own profile" ON public.operators;
CREATE POLICY "Operators can view own profile"
ON public.operators
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- 3. ADMIMS: Allow admins to UPDATE operators (e.g. approve/reject/modify)
DROP POLICY IF EXISTS "Admins can update operators" ON public.operators;
CREATE POLICY "Admins can update operators"
ON public.operators
FOR UPDATE
TO authenticated
USING (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

-- 4. ADMIMS: Allow admins to DELETE operators (e.g. reject request)
DROP POLICY IF EXISTS "Admins can delete operators" ON public.operators;
CREATE POLICY "Admins can delete operators"
ON public.operators
FOR DELETE
TO authenticated
USING (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);
