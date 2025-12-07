-- EMERGENCY FIX for Wedding Website
-- Run this to fix "Save" errors and "404" errors

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.wedding_details (
  user_id uuid references auth.users(id) on delete cascade not null primary key,
  wedding_date date,
  total_budget decimal(12,2) default 0,
  partner_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ensure Columns Exist
DO $$
BEGIN
    ALTER TABLE public.wedding_details ADD COLUMN IF NOT EXISTS slug text UNIQUE;
    ALTER TABLE public.wedding_details ADD COLUMN IF NOT EXISTS cover_image_url text;
    ALTER TABLE public.wedding_details ADD COLUMN IF NOT EXISTS welcome_message text;
    ALTER TABLE public.wedding_details ADD COLUMN IF NOT EXISTS our_story text;
    ALTER TABLE public.wedding_details ADD COLUMN IF NOT EXISTS venue_name text;
    ALTER TABLE public.wedding_details ADD COLUMN IF NOT EXISTS venue_address text;
    ALTER TABLE public.wedding_details ADD COLUMN IF NOT EXISTS venue_map_url text;
    ALTER TABLE public.wedding_details ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column already exists, skipping.';
END $$;

-- 3. Reset RLS Policies (Force Clean Slate)
ALTER TABLE public.wedding_details ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Wedding Details Policy" ON public.wedding_details;
DROP POLICY IF EXISTS "Users can view own wedding details" ON public.wedding_details;
DROP POLICY IF EXISTS "Users can insert own wedding details" ON public.wedding_details;
DROP POLICY IF EXISTS "Users can update own wedding details" ON public.wedding_details;
DROP POLICY IF EXISTS "Public can view wedding details by slug" ON public.wedding_details;
DROP POLICY IF EXISTS "Manage own wedding details" ON public.wedding_details;
DROP POLICY IF EXISTS "Public read access" ON public.wedding_details;

-- 4. Create ONE Simple Policy for Owners
CREATE POLICY "Manage own wedding details"
ON public.wedding_details
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Create ONE Simple Policy for Public Read
CREATE POLICY "Public read access"
ON public.wedding_details
FOR SELECT
TO anon, authenticated
USING (slug IS NOT NULL);

-- 6. Grant Permissions
GRANT ALL ON public.wedding_details TO authenticated;
GRANT SELECT ON public.wedding_details TO anon;

-- 7. Fix Guests Table (Just in case)
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.guests TO authenticated;
GRANT INSERT ON public.guests TO anon; -- Allow public to insert RSVPs directly if needed (though we use RPC)
