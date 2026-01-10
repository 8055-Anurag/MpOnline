-- Add operator_price to user_services
ALTER TABLE public.user_services 
ADD COLUMN IF NOT EXISTS operator_price NUMERIC DEFAULT 0;

-- Add operator_price to applications (to capture the price at time of application)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS operator_price NUMERIC DEFAULT 0;

-- Optional: Add Is_Active to applications if needed for tracking, 
-- but schema already has status.
