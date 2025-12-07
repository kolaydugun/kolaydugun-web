-- Add is_featured column to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_vendors_featured ON vendors(is_featured);

-- Comment
COMMENT ON COLUMN vendors.is_featured IS 'Whether the vendor is featured on the homepage (Showcase)';
