-- Create a function to look up prices
CREATE OR REPLACE FUNCTION public.handle_new_application_pricing()
RETURNS TRIGGER AS $$
DECLARE
  service_record RECORD;
BEGIN
  -- Find the service matching the service_name (User Services)
  -- We try to match user_services.title with NEW.service_name
  SELECT price, operator_price INTO service_record
  FROM public.user_services
  WHERE title = NEW.service_name
  LIMIT 1;

  -- If found, update the new row's prices before insert
  IF FOUND THEN
    NEW.price := service_record.price; -- User Price
    NEW.operator_price := service_record.operator_price; -- Operator Price
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-run
DROP TRIGGER IF EXISTS on_application_insert_pricing ON public.applications;

-- Create the trigger
CREATE TRIGGER on_application_insert_pricing
BEFORE INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_application_pricing();
