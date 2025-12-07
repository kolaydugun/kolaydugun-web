-- Add new columns to vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'vip')),
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{"instagram": "", "website": "", "facebook": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policies
-- 1. Everyone can view vendors (already public, but ensuring policy exists)
CREATE POLICY "Public vendors are viewable by everyone" 
ON public.vendors FOR SELECT 
USING (true);

-- 2. Vendors can update their own profile
CREATE POLICY "Vendors can update own profile" 
ON public.vendors FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Authenticated users can insert a new vendor profile (linking to themselves)
CREATE POLICY "Authenticated users can create profile" 
ON public.vendors FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create Storage Bucket for Vendor Images if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vendor-images', 'vendor-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- 1. Public read access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'vendor-images' );

-- 2. Authenticated users can upload
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'vendor-images' AND auth.role() = 'authenticated' );

-- 3. Users can update/delete their own images (simplified for now, ideally check owner)
CREATE POLICY "Users can update own images" 
ON storage.objects FOR UPDATE
USING ( bucket_id = 'vendor-images' AND auth.uid() = owner );

CREATE POLICY "Users can delete own images" 
ON storage.objects FOR DELETE
USING ( bucket_id = 'vendor-images' AND auth.uid() = owner );
