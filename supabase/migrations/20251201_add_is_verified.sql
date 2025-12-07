-- Add is_verified column to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_vendors_verified ON vendors(is_verified);

-- Comment
COMMENT ON COLUMN vendors.is_verified IS 'Whether the vendor is verified by admin';
