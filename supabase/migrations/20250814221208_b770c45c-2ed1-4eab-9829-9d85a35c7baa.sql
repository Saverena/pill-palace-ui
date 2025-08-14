-- Enable Row Level Security on all tables
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Update medications table to include inventory tracking
ALTER TABLE public.medications 
ADD COLUMN IF NOT EXISTS initial_quantity INTEGER,
ADD COLUMN IF NOT EXISTS remaining_quantity INTEGER,
ADD COLUMN IF NOT EXISTS quantity_unit TEXT DEFAULT 'pills';

-- Update schedules table to include intake times
ALTER TABLE public.schedules 
ADD COLUMN IF NOT EXISTS intake_times TIME[] DEFAULT '{}';

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  date_of_birth DATE,
  gender TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for medications
CREATE POLICY "Users can view their own medications" 
ON public.medications FOR SELECT 
USING (auth.uid() = userid);

CREATE POLICY "Users can create their own medications" 
ON public.medications FOR INSERT 
WITH CHECK (auth.uid() = userid);

CREATE POLICY "Users can update their own medications" 
ON public.medications FOR UPDATE 
USING (auth.uid() = userid);

CREATE POLICY "Users can delete their own medications" 
ON public.medications FOR DELETE 
USING (auth.uid() = userid);

-- Create RLS policies for schedules
CREATE POLICY "Users can view schedules for their medications" 
ON public.schedules FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.medications 
  WHERE medications.medicationid = schedules.medicationid 
  AND medications.userid = auth.uid()
));

CREATE POLICY "Users can create schedules for their medications" 
ON public.schedules FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.medications 
  WHERE medications.medicationid = schedules.medicationid 
  AND medications.userid = auth.uid()
));

CREATE POLICY "Users can update schedules for their medications" 
ON public.schedules FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.medications 
  WHERE medications.medicationid = schedules.medicationid 
  AND medications.userid = auth.uid()
));

-- Create RLS policies for reminders
CREATE POLICY "Users can view reminders for their medications" 
ON public.reminders FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.schedules s
  JOIN public.medications m ON s.medicationid = m.medicationid
  WHERE s.scheduleid = reminders.scheduleid 
  AND m.userid = auth.uid()
));

CREATE POLICY "Users can create reminders for their medications" 
ON public.reminders FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.schedules s
  JOIN public.medications m ON s.medicationid = m.medicationid
  WHERE s.scheduleid = reminders.scheduleid 
  AND m.userid = auth.uid()
));

-- Create RLS policies for logs
CREATE POLICY "Users can view their medication logs" 
ON public.logs FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.reminders r
  JOIN public.schedules s ON r.scheduleid = s.scheduleid
  JOIN public.medications m ON s.medicationid = m.medicationid
  WHERE r.reminderid = logs.reminderid 
  AND m.userid = auth.uid()
));

CREATE POLICY "Users can create their medication logs" 
ON public.logs FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.reminders r
  JOIN public.schedules s ON r.scheduleid = s.scheduleid
  JOIN public.medications m ON s.medicationid = m.medicationid
  WHERE r.reminderid = logs.reminderid 
  AND m.userid = auth.uid()
));

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically update medication quantity when logging intake
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
$$ LANGUAGE plpgsql;

-- Create trigger to update quantity when logging intake
CREATE TRIGGER update_quantity_on_log
  AFTER INSERT ON public.logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_medication_quantity();