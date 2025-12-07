
-- Enable RLS just in case
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (optional, but safer)
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete pages" ON pages;
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can insert pages" ON pages;
DROP POLICY IF EXISTS "Admins can update pages" ON pages;

-- Policy for deleting posts (Admin only)
CREATE POLICY "Admins can delete posts" ON posts
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy for deleting pages (Admin only)
CREATE POLICY "Admins can delete pages" ON pages
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Ensure admins can also update/insert
CREATE POLICY "Admins can insert posts" ON posts FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update posts" ON posts FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can insert pages" ON pages FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update pages" ON pages FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
