-- Add columns for monetization control
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS featured_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS featured_sort_order INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_vendors_featured_expires ON vendors(featured_expires_at);
CREATE INDEX IF NOT EXISTS idx_vendors_featured_order ON vendors(featured_sort_order);

-- Update the RPC function to handle new parameters
CREATE OR REPLACE FUNCTION toggle_featured_vendor(
    vendor_uuid UUID, 
    is_featured_status BOOLEAN,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    sort_order INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  UPDATE vendors
  SET 
    is_featured = is_featured_status,
    featured_expires_at = expires_at,
    featured_sort_order = sort_order
  WHERE id = vendor_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION toggle_featured_vendor(UUID, BOOLEAN, TIMESTAMPTZ, INTEGER) TO authenticated;
