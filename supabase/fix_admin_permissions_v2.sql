-- 1. Ensure the current user is an admin (Replace with your email if needed, but this updates ALL users for dev simplicity if strictly needed, or better, just the specific one)
-- For development, let's make sure the user with the email 'karabuluthamza4@gmail.com' (seen in screenshot) is admin.
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'karabuluthamza4@gmail.com';

-- 2. Drop existing policy to avoid conflicts
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;

-- 3. Re-create the policy with a simpler check (or the same if correct)
-- Using a direct check on the profiles table
CREATE POLICY "Admins can update leads" ON public.leads
FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. Also ensure SELECT policy allows admins to see everything
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads" ON public.leads
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
