-- Fix User Cleanup RLS

-- 1. Enable RLS (Should be already on, but good to ensure)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to insert their *own* profile
-- This is critical for the signup flow to work from the client
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Allow users to read their own profile
-- Needed for the login check
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- 4. Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- 5. ADMIN POLICIES: Allow admins to manage all users
-- We use a security definer function to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" 
ON public.users 
FOR ALL 
USING (public.is_admin());
