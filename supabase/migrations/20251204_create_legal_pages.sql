-- Create pages table if it doesn't exist (it likely does, but for safety)
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL DEFAULT '{}'::jsonb,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public pages are viewable by everyone" 
ON public.pages FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can do everything with pages" 
ON public.pages FOR ALL 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Insert Default Legal Pages
INSERT INTO public.pages (slug, title, content, is_active)
VALUES 
(
    'impressum',
    '{"tr": "Künye (Impressum)", "en": "Imprint", "de": "Impressum"}'::jsonb,
    '{"tr": "<h1>Künye</h1><p>Şirket Bilgileri...</p>", "en": "<h1>Imprint</h1><p>Company Info...</p>", "de": "<h1>Impressum</h1><p>Angaben gemäß § 5 TMG...</p>"}'::jsonb,
    true
),
(
    'datenschutz',
    '{"tr": "Gizlilik Politikası", "en": "Privacy Policy", "de": "Datenschutzerklärung"}'::jsonb,
    '{"tr": "<h1>Gizlilik Politikası</h1><p>GDPR uyumlu metin...</p>", "en": "<h1>Privacy Policy</h1><p>GDPR compliant text...</p>", "de": "<h1>Datenschutzerklärung</h1><p>Datenschutz...</p>"}'::jsonb,
    true
),
(
    'agb',
    '{"tr": "Kullanım Koşulları (AGB)", "en": "Terms & Conditions", "de": "Allgemeine Geschäftsbedingungen"}'::jsonb,
    '{"tr": "<h1>Kullanım Koşulları</h1><p>Şartlar...</p>", "en": "<h1>Terms & Conditions</h1><p>Terms...</p>", "de": "<h1>AGB</h1><p>Allgemeine Geschäftsbedingungen...</p>"}'::jsonb,
    true
),
(
    'widerrufsrecht',
    '{"tr": "Cayma Hakkı", "en": "Right of Withdrawal", "de": "Widerrufsrecht"}'::jsonb,
    '{"tr": "<h1>Cayma Hakkı</h1><p>İade koşulları...</p>", "en": "<h1>Right of Withdrawal</h1><p>Return policy...</p>", "de": "<h1>Widerrufsrecht</h1><p>Widerrufsbelehrung...</p>"}'::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;
