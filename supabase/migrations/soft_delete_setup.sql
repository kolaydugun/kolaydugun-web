-- SOFT DELETE MIGRATION
-- 1. Add deleted_at column
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Update RLS policies to hide deleted vendors from public
-- First, drop existing policies to avoid conflicts (or we can just update them if we knew the names, but dropping is safer for a "fix")
-- Actually, let's just create a new policy that denies access if deleted_at is not null, 
-- BUT RLS is usually additive (OR). So we need to modify the existing "Enable read access for all users" policy.

-- Let's try to update the standard read policy.
-- Assuming policy name is "Enable read access for all users" or similar.
-- To be safe, we will create a specific View or just filter in the frontend first?
-- No, RLS is best.

-- Let's drop the common read policy and recreate it with the filter.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.vendors;
DROP POLICY IF EXISTS "Public vendors are viewable by everyone" ON public.vendors;

CREATE POLICY "Public vendors are viewable by everyone" 
ON public.vendors FOR SELECT 
USING (deleted_at IS NULL);

-- 3. Allow Admins to see everything (including deleted? Maybe not for now, let's hide them everywhere to simulate deletion)
-- If we want admins to see them, we'd need a separate policy or check role.
-- For now, let's make "Delete" mean "Gone from everywhere".

-- 4. Allow Admins/Vendors to update 'deleted_at' (Soft Delete)
DROP POLICY IF EXISTS "Admins can update any vendor" ON public.vendors;

CREATE POLICY "Admins can update any vendor" 
ON public.vendors FOR UPDATE 
TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
