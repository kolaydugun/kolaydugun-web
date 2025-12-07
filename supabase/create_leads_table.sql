-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    category_id UUID REFERENCES public.categories(id),
    city_id UUID REFERENCES public.cities(id),
    event_date DATE NOT NULL,
    budget_min NUMERIC,
    budget_max NUMERIC,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    additional_notes TEXT
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to insert leads (for public lead form)
CREATE POLICY "Enable insert for everyone" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own leads
CREATE POLICY "Users can view their own leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all leads (assuming admin role check or similar, for now just authenticated for simplicity or specific admin check if we had one)
-- For now, let's keep it simple. Real admin check would be: auth.jwt() ->> 'role' = 'admin' or similar.
