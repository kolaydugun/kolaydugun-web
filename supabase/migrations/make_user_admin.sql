-- Make the test user an admin
-- Run this AFTER running 'node test_delete_vendor.js' at least once (so the user is created)

UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'test_admin_verification@kolaydugun.com'
);

-- Also ensure they can bypass RLS if needed (though admin role usually handles app logic)
-- If you have specific RLS policies for 'admin' role, this should work.
