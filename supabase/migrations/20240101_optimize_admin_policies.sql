
-- Optimize policies to use the secure is_admin() function
-- This avoids complex subqueries and RLS recursion issues

-- POSTS
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;

CREATE POLICY "Admins can delete posts" ON posts FOR DELETE USING ( is_admin() );
CREATE POLICY "Admins can insert posts" ON posts FOR INSERT WITH CHECK ( is_admin() );
CREATE POLICY "Admins can update posts" ON posts FOR UPDATE USING ( is_admin() );

-- PAGES
DROP POLICY IF EXISTS "Admins can delete pages" ON pages;
DROP POLICY IF EXISTS "Admins can insert pages" ON pages;
DROP POLICY IF EXISTS "Admins can update pages" ON pages;

CREATE POLICY "Admins can delete pages" ON pages FOR DELETE USING ( is_admin() );
CREATE POLICY "Admins can insert pages" ON pages FOR INSERT WITH CHECK ( is_admin() );
CREATE POLICY "Admins can update pages" ON pages FOR UPDATE USING ( is_admin() );

-- CATEGORIES (Ensure admins can manage these too)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

CREATE POLICY "Admins can insert categories" ON categories FOR INSERT WITH CHECK ( is_admin() );
CREATE POLICY "Admins can update categories" ON categories FOR UPDATE USING ( is_admin() );
CREATE POLICY "Admins can delete categories" ON categories FOR DELETE USING ( is_admin() );

-- Allow everyone to read categories (public)
DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING ( true );
