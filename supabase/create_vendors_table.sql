-- ============================================
-- vendors Table Migration
-- Purpose: Document existing vendors table structure
-- Note: This table already exists in Supabase
-- ============================================

-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT,
    category TEXT,
    city TEXT,
    description TEXT,
    price_range TEXT,
    capacity INTEGER,
    rating DECIMAL(3,2) DEFAULT 0,
    image_url TEXT,
    featured_active BOOLEAN DEFAULT false,
    featured_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_tier TEXT DEFAULT 'free',
    social_media JSONB DEFAULT '{}',
    faq JSONB DEFAULT '[]',
    gallery JSONB DEFAULT '[]',
    years_experience INTEGER DEFAULT 0,
    payment_methods JSONB DEFAULT '[]',
    languages JSONB DEFAULT '[]',
    website_url TEXT,
    details JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view vendors"
    ON public.vendors FOR SELECT
    USING (true);

CREATE POLICY "Vendors can update own profile"
    ON public.vendors FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert own profile"
    ON public.vendors FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all vendors"
    ON public.vendors FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_city ON public.vendors(city);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_featured ON public.vendors(featured_active, featured_until);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON public.vendors(created_at DESC);

-- Comments
COMMENT ON TABLE public.vendors IS 'Vendor profiles and business information';
COMMENT ON COLUMN public.vendors.social_media IS 'JSON object containing social media links';
COMMENT ON COLUMN public.vendors.faq IS 'JSON array of frequently asked questions';
COMMENT ON COLUMN public.vendors.gallery IS 'JSON array of gallery image URLs';
COMMENT ON COLUMN public.vendors.payment_methods IS 'JSON array of accepted payment methods';
COMMENT ON COLUMN public.vendors.languages IS 'JSON array of spoken languages';
COMMENT ON COLUMN public.vendors.details IS 'JSON object for additional vendor details';
