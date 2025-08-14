-- Fix search path security for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.update_medication_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'taken' THEN
    UPDATE public.medications 
    SET remaining_quantity = GREATEST(0, remaining_quantity - 1)
    WHERE medicationid = (
      SELECT s.medicationid 
      FROM public.schedules s
      JOIN public.reminders r ON s.scheduleid = r.scheduleid
      WHERE r.reminderid = NEW.reminderid
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Enable RLS on users table (if it exists in public schema)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;