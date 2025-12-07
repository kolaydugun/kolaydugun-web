-- Create a secure function to toggle featured status
-- This runs with SECURITY DEFINER to bypass RLS policies
CREATE OR REPLACE FUNCTION toggle_featured_vendor(vendor_uuid UUID, is_featured_status BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE vendors
  SET is_featured = is_featured_status
  WHERE id = vendor_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION toggle_featured_vendor(UUID, BOOLEAN) TO authenticated;
