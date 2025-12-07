-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Enforce singleton row
    hero_title JSONB DEFAULT '{"en": "Dream Wedding in Germany", "de": "Traumhochzeit in Deutschland", "tr": "Almanya''da Hayalinizdeki Düğün"}'::jsonb,
    hero_subtitle JSONB DEFAULT '{"en": "Plan your perfect wedding with ease.", "de": "Planen Sie Ihre perfekte Hochzeit ganz einfach.", "tr": "Kusursuz düğününüzü kolayca planlayın."}'::jsonb,
    hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default row if not exists
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow everyone to read settings
CREATE POLICY "Enable read access for all users" ON public.site_settings
    FOR SELECT USING (true);

-- Allow admins to update settings (assuming admin role or specific user check)
-- For simplicity in this project context, we'll allow authenticated users to update for now, 
-- but in a real scenario, this should be restricted to admins.
CREATE POLICY "Enable update for authenticated users" ON public.site_settings
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
