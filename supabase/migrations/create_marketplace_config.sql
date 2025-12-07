-- Create marketplace_config table
CREATE TABLE IF NOT EXISTS public.marketplace_config (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Insert default values
INSERT INTO public.marketplace_config (key, value) VALUES
('maintenance_mode', 'false'),
('show_pricing_plans', 'true'),
('paypal_email', ''),
('lead_prices', '{"default": 5}'),
('featured_prices', '{"week": 10, "month": 30}')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS for marketplace_config
ALTER TABLE public.marketplace_config ENABLE ROW LEVEL SECURITY;

-- Policies for marketplace_config
DROP POLICY IF EXISTS "Enable read access for all users" ON public.marketplace_config;
CREATE POLICY "Enable read access for all users" ON public.marketplace_config
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable update for admins" ON public.marketplace_config;
CREATE POLICY "Enable update for admins" ON public.marketplace_config
FOR UPDATE USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Enable insert for admins" ON public.marketplace_config;
CREATE POLICY "Enable insert for admins" ON public.marketplace_config
FOR INSERT WITH CHECK (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Create site_settings table (if not exists)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id SERIAL PRIMARY KEY,
    hero_title JSONB DEFAULT '{"en": "", "de": "", "tr": ""}',
    hero_subtitle JSONB DEFAULT '{"en": "", "de": "", "tr": ""}',
    hero_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default site settings
INSERT INTO public.site_settings (id, hero_title, hero_subtitle, hero_image_url)
VALUES (1, 
    '{"en": "Plan Your Dream Wedding", "de": "Planen Sie Ihre Traumhochzeit", "tr": "Hayalinizdeki Düğünü Planlayın"}', 
    '{"en": "Find the best vendors", "de": "Finden Sie die besten Anbieter", "tr": "En iyi tedarikçileri bulun"}', 
    ''
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies for site_settings
DROP POLICY IF EXISTS "Public read access" ON public.site_settings;
CREATE POLICY "Public read access" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin update access" ON public.site_settings;
CREATE POLICY "Admin update access" ON public.site_settings FOR UPDATE USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
