-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  key text PRIMARY KEY,
  en text,
  de text,
  tr text,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read translations
CREATE POLICY "Public read access" ON translations
  FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage translations" ON translations
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Seed data function (to be called manually or via script if needed, 
-- but we will likely use a script to parse dictionary.js and insert)
-- For now, let's insert a few critical keys to test
INSERT INTO translations (key, en, de, tr, category)
VALUES 
  ('nav.services', 'Services', 'Dienstleister', 'Hizmetler', 'nav'),
  ('nav.inspiration', 'Inspiration', 'Inspiration', 'İlham', 'nav'),
  ('nav.tools', 'Planning Tools', 'Planungstools', 'Planlama Araçları', 'nav'),
  ('Wedding Venues', 'Wedding Venues', 'Hochzeitslocations', 'Düğün Mekanları', 'category'),
  ('Bridal Fashion', 'Bridal Fashion', 'Brautmode', 'Gelinlik ve Moda', 'category')
ON CONFLICT (key) DO NOTHING;
