-- Fix leads table and policies

-- 1. Ensure leads table has correct columns
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE, -- Assuming vendors table exists
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL,
    contact_name text,
    contact_email text,
    contact_phone text,
    event_date date,
    budget_min decimal(12,2),
    budget_max decimal(12,2),
    additional_notes text,
    status text DEFAULT 'new'
);

-- 2. Ensure vendor_leads table exists (for linking if needed, or just use leads.vendor_id)
CREATE TABLE IF NOT EXISTS public.vendor_leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
    is_unlocked boolean DEFAULT false,
    UNIQUE(vendor_id, lead_id)
);

-- 3. Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_leads ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for leads

-- Allow anyone to insert leads (public quote request)
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
CREATE POLICY "Anyone can insert leads" ON public.leads
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Allow admins to view all leads
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads" ON public.leads
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow vendors to view their own leads (via vendor_id)
-- Assuming vendors table has user_id or we link via vendor_profiles
-- This is complex, but for now let's focus on Admin viewing.

-- 5. Create Policies for vendor_leads
DROP POLICY IF EXISTS "Admins can view all vendor_leads" ON public.vendor_leads;
CREATE POLICY "Admins can view all vendor_leads" ON public.vendor_leads
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow insert into vendor_leads (public/anon needs this if we do it in frontend)
DROP POLICY IF EXISTS "Anyone can insert vendor_leads" ON public.vendor_leads;
CREATE POLICY "Anyone can insert vendor_leads" ON public.vendor_leads
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.vendor_leads TO authenticated;
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.vendor_leads TO anon;
