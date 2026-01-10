-- Add user_id to link application to the registered user
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);

-- Add service_id to link to the master service record
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.user_services(id);

-- Optional: Index for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
