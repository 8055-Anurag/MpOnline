-- 1. Create/Ensure Operators table has necessary columns (including email)
CREATE TABLE IF NOT EXISTS public.operators (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  is_active BOOLEAN DEFAULT FALSE, -- Operators default to inactive (pending approval)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure email column exists (in case table already existed without it)
ALTER TABLE public.operators ADD COLUMN IF NOT EXISTS email TEXT;

-- Enable RLS on operators
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;

-- 2. Create the function that will handle user insertion based on role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from metadata, default to 'user'
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'user');

  IF user_role = 'operator' THEN
    -- Insert into OPERATORS table
    INSERT INTO public.operators (id, email, full_name, mobile, is_active)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      new.raw_user_meta_data->>'mobile',
      FALSE -- Explicitly false for new operators
    );
  ELSE
    -- Insert into USERS table (for role 'user' or 'admin' or anything else)
    INSERT INTO public.users (id, email, full_name, mobile, role, is_active)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      new.raw_user_meta_data->>'mobile',
      user_role,
      FALSE -- Users now start as inactive (pending approval)
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2b. Ensure table default matches
ALTER TABLE public.users ALTER COLUMN is_active SET DEFAULT false;

-- 3. Re-create the trigger (drops existing one to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
