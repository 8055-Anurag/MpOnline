-- Helper script to promote a user to Admin or Operator
-- Usage: Replace 'target_email@example.com' with the actual email address

-- 1. Promote to ADMIN (Stays in public.users)
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'target_email@example.com';

-- 2. Promote to OPERATOR (Moves from public.users to public.operators)
-- Note: This is complex because we need to move the row.
-- It's easier to just Insert into operators and Delete from users if they accidentally signed up as user.

/* 
-- Run this if you signed up as a USER but want to be an OPERATOR:
DO $$
DECLARE
    target_email TEXT := 'target_email@example.com';
    user_record RECORD;
BEGIN
    -- Select user data
    SELECT * INTO user_record FROM public.users WHERE email = target_email;
    
    IF FOUND THEN
        -- Insert into operators
        INSERT INTO public.operators (id, full_name, email, mobile, is_active)
        VALUES (user_record.id, user_record.full_name, target_email, user_record.mobile, TRUE)
        ON CONFLICT (id) DO NOTHING;
        
        -- Delete from users
        DELETE FROM public.users WHERE email = target_email;
        
        -- Update Auth Metadata (optional but good for consistency)
        UPDATE auth.users SET raw_user_meta_data = 
          jsonb_set(raw_user_meta_data, '{role}', '"operator"') 
        WHERE email = target_email;
    END IF;
END $$;
*/

-- 3. Verify
SELECT * FROM public.users WHERE email = 'target_email@example.com';
SELECT * FROM public.operators WHERE email = 'target_email@example.com';
