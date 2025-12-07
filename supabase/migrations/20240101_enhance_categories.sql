
-- Add columns to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create a unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_idx ON categories (slug);

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Update existing categories with slugs
UPDATE categories 
SET slug = generate_slug(name) 
WHERE slug IS NULL;

-- Make slug not null after population
ALTER TABLE categories ALTER COLUMN slug SET NOT NULL;
