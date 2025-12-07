-- Allow vendors to exist without a corresponding auth user
-- This is necessary for manual import of vendors (unclaimed profiles)

-- 1. Drop the foreign key constraint on 'id' if it exists
ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_id_fkey;

-- 2. Ensure 'user_id' is nullable (it should be, but just in case)
ALTER TABLE public.vendors ALTER COLUMN user_id DROP NOT NULL;

-- 3. Add a comment explaining why
COMMENT ON TABLE public.vendors IS 'Vendor profiles. id is independent UUID. user_id links to auth.users (nullable for unclaimed).';
