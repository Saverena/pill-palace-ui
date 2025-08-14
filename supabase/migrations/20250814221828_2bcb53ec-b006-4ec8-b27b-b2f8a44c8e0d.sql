-- Add RLS policy for users table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        -- Create RLS policies for users table
        CREATE POLICY "Users can view their own user record" 
        ON public.users FOR SELECT 
        USING (auth.uid() = userid);

        CREATE POLICY "Users can update their own user record" 
        ON public.users FOR UPDATE 
        USING (auth.uid() = userid);
    END IF;
END $$;