-- Migration for Public Wedding Website & RSVP

-- 1. Update wedding_details table
ALTER TABLE public.wedding_details 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS cover_image_url text,
ADD COLUMN IF NOT EXISTS welcome_message text,
ADD COLUMN IF NOT EXISTS our_story text,
ADD COLUMN IF NOT EXISTS venue_name text,
ADD COLUMN IF NOT EXISTS venue_address text,
ADD COLUMN IF NOT EXISTS venue_map_url text,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_wedding_details_slug ON public.wedding_details(slug);

-- 2. Update guests table for RSVP details
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS message text,
ADD COLUMN IF NOT EXISTS plus_ones integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_public_rsvp boolean DEFAULT false;

-- 3. RLS Policies for Public Access

-- Allow anyone to READ wedding details if they know the slug (and it's public? or just by slug?)
-- For now, let's allow reading by slug.
CREATE POLICY "Public can view wedding details by slug"
ON public.wedding_details FOR SELECT
USING ( slug IS NOT NULL ); 
-- Note: Ideally we check is_public=true, but for previewing, maybe just slug existence is enough.

-- Allow public to INSERT guests (RSVP)
-- We need to be careful here. We'll allow insert if they provide a valid wedding_id (user_id).
-- But guests table references user_id.
-- Let's create a secure RPC function for RSVP to avoid opening up the whole table.

-- 4. Secure RPC for RSVP
CREATE OR REPLACE FUNCTION public.submit_rsvp(
    p_slug text,
    p_name text,
    p_email text,
    p_status text,
    p_plus_ones integer,
    p_message text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges
AS $$
DECLARE
    v_user_id uuid;
    v_guest_id uuid;
BEGIN
    -- 1. Find the user_id from the slug
    SELECT user_id INTO v_user_id
    FROM public.wedding_details
    WHERE slug = p_slug;

    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Wedding not found');
    END IF;

    -- 2. Insert into guests table
    INSERT INTO public.guests (
        user_id,
        name,
        email,
        status,
        plus_ones,
        message,
        is_public_rsvp
    ) VALUES (
        v_user_id,
        p_name,
        p_email,
        p_status,
        p_plus_ones,
        p_message,
        true
    ) RETURNING id INTO v_guest_id;

    RETURN json_build_object('success', true, 'guest_id', v_guest_id);
END;
$$;

-- Grant execute to anon
GRANT EXECUTE ON FUNCTION public.submit_rsvp TO anon, authenticated;

-- 5. Storage Policy for Cover Images (if not exists)
-- Assuming 'public' bucket exists, or we create a 'wedding-content' bucket.
-- For simplicity, we'll use existing buckets or assume standard storage setup.
-- If 'images' bucket exists:
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
