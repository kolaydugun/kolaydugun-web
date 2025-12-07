-- Create pages table for CMS
CREATE TABLE IF NOT EXISTS pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL DEFAULT '{}'::jsonb, -- {en: "...", de: "...", tr: "..."}
    content JSONB NOT NULL DEFAULT '{}'::jsonb, -- {en: "...", de: "...", tr: "..."}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public read access
DROP POLICY IF EXISTS "Allow public read access on pages" ON pages;
CREATE POLICY "Allow public read access on pages" ON pages FOR SELECT USING (true);

-- Admin full access (allowing all authenticated users for now to simplify development)
DROP POLICY IF EXISTS "Allow authenticated update on pages" ON pages;
CREATE POLICY "Allow authenticated update on pages" ON pages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated insert on pages" ON pages;
CREATE POLICY "Allow authenticated insert on pages" ON pages FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete on pages" ON pages;
CREATE POLICY "Allow authenticated delete on pages" ON pages FOR DELETE TO authenticated USING (true);

-- Seed initial data
INSERT INTO pages (slug, title, content) VALUES
(
    'impressum',
    '{"en": "Imprint", "de": "Impressum", "tr": "Künye"}',
    '{"en": "<h1>Imprint</h1><p>Company Name: KolayDugun<br>Address: Berlin, Germany<br>Email: contact@kolaydugun.de</p>", "de": "<h1>Impressum</h1><p>Firmenname: KolayDugun<br>Adresse: Berlin, Deutschland<br>E-Mail: contact@kolaydugun.de</p>", "tr": "<h1>Künye</h1><p>Şirket Adı: KolayDugun<br>Adres: Berlin, Almanya<br>E-posta: contact@kolaydugun.de</p>"}'
),
(
    'privacy',
    '{"en": "Privacy Policy", "de": "Datenschutzerklärung", "tr": "Gizlilik Politikası"}',
    '{"en": "<h1>Privacy Policy</h1><p>We respect your privacy. This policy explains how we handle your data.</p>", "de": "<h1>Datenschutzerklärung</h1><p>Wir respektieren Ihre Privatsphäre. Diese Richtlinie erklärt, wie wir mit Ihren Daten umgehen.</p>", "tr": "<h1>Gizlilik Politikası</h1><p>Gizliliğinize saygı duyuyoruz. Bu politika verilerinizi nasıl işlediğimizi açıklar.</p>"}'
),
(
    'terms',
    '{"en": "Terms of Service", "de": "AGB", "tr": "Kullanım Koşulları"}',
    '{"en": "<h1>Terms of Service</h1><p>By using our service, you agree to these terms.</p>", "de": "<h1>Allgemeine Geschäftsbedingungen (AGB)</h1><p>Durch die Nutzung unseres Dienstes stimmen Sie diesen Bedingungen zu.</p>", "tr": "<h1>Kullanım Koşulları</h1><p>Hizmetimizi kullanarak bu koşulları kabul etmiş olursunuz.</p>"}'
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content;
