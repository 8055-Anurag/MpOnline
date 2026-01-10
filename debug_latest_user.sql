-- check the last 5 users creating in auth.users and their metadata
SELECT 
  id, 
  email, 
  created_at, 
  raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if they exist in public.operators
SELECT * FROM public.operators ORDER BY created_at DESC LIMIT 5;

-- Check if they exist in public.users (mis-routed?)
SELECT * FROM public.users ORDER BY created_at DESC LIMIT 5;
