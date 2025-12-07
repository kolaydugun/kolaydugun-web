-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR TO FIX THE SEATING CHART SAVE ISSUE

-- 1. Add missing columns to wedding_details (including updated_at)
ALTER TABLE public.wedding_details 
ADD COLUMN IF NOT EXISTS total_guests integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS venue_name text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 2. Add missing columns to guests (including phone, email, plus_ones)
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS seat_index integer,
ADD COLUMN IF NOT EXISTS guest_group text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS plus_ones integer DEFAULT 0;

-- 3. Ensure seating_tables exists
CREATE TABLE IF NOT EXISTS public.seating_tables (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'round',
    capacity integer DEFAULT 8,
    x numeric DEFAULT 0,
    y numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;

-- 5. Create Policy for seating_tables if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'seating_tables' AND policyname = 'Manage own tables'
    ) THEN
        CREATE POLICY "Manage own tables" ON public.seating_tables
            FOR ALL TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- 6. Grant permissions
GRANT ALL ON public.seating_tables TO authenticated;
