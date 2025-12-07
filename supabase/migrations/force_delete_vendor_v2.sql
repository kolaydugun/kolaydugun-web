-- FORCE DELETE VENDOR - CASCADE VERSION
-- This function relies on ON DELETE CASCADE constraints being correctly set on all related tables.
-- Run 'auto_fix_cascades.sql' first to ensure constraints are set.

CREATE OR REPLACE FUNCTION force_delete_vendor(p_vendor_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Just delete the vendor. 
    -- If cascades are set up (via auto_fix_cascades.sql), everything else goes with it.
    DELETE FROM public.vendors WHERE id = p_vendor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION force_delete_vendor TO authenticated;
GRANT EXECUTE ON FUNCTION force_delete_vendor TO service_role;
GRANT EXECUTE ON FUNCTION force_delete_vendor TO postgres;

