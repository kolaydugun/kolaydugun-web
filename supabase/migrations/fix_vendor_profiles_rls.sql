-- Enable RLS on vendor_profiles if not already enabled
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read all vendor profiles" ON vendor_profiles;
DROP POLICY IF EXISTS "Vendors can read own profile" ON vendor_profiles;
DROP POLICY IF EXISTS "Public can read active vendor profiles" ON vendor_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read vendor profiles" ON vendor_profiles;

-- Allow all authenticated users (including admins) to read vendor profiles
CREATE POLICY "Allow authenticated users to read vendor profiles"
ON vendor_profiles
FOR SELECT
TO authenticated
USING (true);

-- Allow public (anonymous) to read vendor profiles
CREATE POLICY "Public can read active vendor profiles"
ON vendor_profiles
FOR SELECT
TO anon
USING (true);
