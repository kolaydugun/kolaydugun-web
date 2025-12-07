-- STEP 1: Add columns if they don't exist
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- STEP 2: Drop ALL existing policies on leads table
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;

-- STEP 3: Create simple, permissive policies for admins
-- Allow admins to SELECT all leads
CREATE POLICY "admin_select_leads" ON public.leads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to UPDATE all leads
CREATE POLICY "admin_update_leads" ON public.leads
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow anyone to INSERT leads (for public lead form)
CREATE POLICY "public_insert_leads" ON public.leads
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- STEP 4: Make sure your user is admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'karabuluthamza4@gmail.com';

-- STEP 5: Verify the setup
SELECT 
  'Profile Check' as check_type,
  id, 
  email, 
  role 
FROM public.profiles 
WHERE email = 'karabuluthamza4@gmail.com';
