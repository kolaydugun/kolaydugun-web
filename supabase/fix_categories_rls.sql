-- Enable RLS on categories table if not already enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts and ensure we have the correct ones
DROP POLICY IF EXISTS "Allow public read access" ON categories;
DROP POLICY IF EXISTS "Allow authenticated update" ON categories;
DROP POLICY IF EXISTS "Allow authenticated insert" ON categories;

-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);

-- Allow update access to authenticated users (or admins)
-- For now, allowing all authenticated users to update categories to fix the issue
CREATE POLICY "Allow authenticated update" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow insert access to authenticated users
CREATE POLICY "Allow authenticated insert" ON categories FOR INSERT TO authenticated WITH CHECK (true);

-- Fix the category data directly
INSERT INTO categories (name, description, icon)
VALUES ('Wedding Venues', 'Düğün mekanları, salonlar, kır düğünü alanları ve tarihi mekanlar', '🏛️')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    icon = EXCLUDED.icon;
