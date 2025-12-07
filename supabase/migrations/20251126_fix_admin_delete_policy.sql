-- Create a secure function to check if the current user is an admin
-- This function runs with the privileges of the creator (SECURITY DEFINER), bypassing RLS on profiles
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the delete policy for posts to use the secure function
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

CREATE POLICY "Admins can delete posts" ON posts
FOR DELETE
USING (
  is_admin()
);

-- Also update pages policy for consistency
DROP POLICY IF EXISTS "Admins can delete pages" ON pages;

CREATE POLICY "Admins can delete pages" ON pages
FOR DELETE
USING (
  is_admin()
);
