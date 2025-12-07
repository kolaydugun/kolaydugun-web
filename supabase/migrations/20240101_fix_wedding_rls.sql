-- Fix RLS and Schema for Wedding Website

-- 1. Ensure columns exist
ALTER TABLE public.wedding_details 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS cover_image_url text,
ADD COLUMN IF NOT EXISTS welcome_message text,
ADD COLUMN IF NOT EXISTS our_story text,
ADD COLUMN IF NOT EXISTS venue_name text,
ADD COLUMN IF NOT EXISTS venue_address text,
ADD COLUMN IF NOT EXISTS venue_map_url text,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- 2. Enable RLS
ALTER TABLE public.wedding_details ENABLE ROW LEVEL SECURITY;

-- 3. Re-create Policies
-- Drop existing to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own wedding details" ON public.wedding_details;
DROP POLICY IF EXISTS "Users can update own wedding details" ON public.wedding_details;
DROP POLICY IF EXISTS "Users can view own wedding details" ON public.wedding_details;
DROP POLICY IF EXISTS "Public can view wedding details by slug" ON public.wedding_details;

-- Create Policies
CREATE POLICY "Users can view own wedding details"
  ON public.wedding_details FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own wedding details"
  ON public.wedding_details FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own wedding details"
  ON public.wedding_details FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Public can view wedding details by slug"
  ON public.wedding_details FOR SELECT
  USING ( slug IS NOT NULL );

-- 4. Grant Permissions
GRANT ALL ON public.wedding_details TO authenticated;
GRANT SELECT ON public.wedding_details TO anon;

-- 5. Fix Guests Table RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert rsvp" ON public.guests;

-- We use RPC for RSVP, but just in case we want direct insert with policy:
-- (Optional, sticking to RPC is safer)

-- 6. Ensure Storage Bucket Exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wedding-content', 'wedding-content', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view wedding content"
ON storage.objects FOR SELECT
USING ( bucket_id = 'wedding-content' );

CREATE POLICY "Users can upload wedding content"
ON storage.objects FOR INSERT
WITH CHECK ( 
    bucket_id = 'wedding-content' 
    AND auth.uid()::text = (storage.foldername(name))[1] 
);
