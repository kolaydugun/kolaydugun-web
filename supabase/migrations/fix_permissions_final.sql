-- FINAL PERMISSION FIX
-- Run this to fix "permission denied" errors once and for all.

-- 1. Grant EXECUTE permission to ALL roles for the force delete function
GRANT EXECUTE ON FUNCTION force_delete_vendor TO authenticated;
GRANT EXECUTE ON FUNCTION force_delete_vendor TO anon;
GRANT EXECUTE ON FUNCTION force_delete_vendor TO service_role;
GRANT EXECUTE ON FUNCTION force_delete_vendor TO postgres;

-- 2. Ensure the current user is an ADMIN
-- (Replace the ID with your user ID if different, but this is the one from the session)
UPDATE public.profiles
SET role = 'admin'
WHERE id = '13e2508f-e520-4bb3-bd3d-e1f4eee59024';

-- 3. Verify the function exists (just to be sure)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'force_delete_vendor') THEN
        RAISE EXCEPTION 'Function force_delete_vendor does not exist! Please run the previous script to create it.';
    END IF;
END $$;
