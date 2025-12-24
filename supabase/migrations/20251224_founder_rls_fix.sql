-- Fix RLS Policies for Founder Tables
-- Allow authenticated users to write (INSERT, UPDATE, DELETE)

-- founder_settings policies
CREATE POLICY "Authenticated users can insert founder_settings" 
ON public.founder_settings FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update founder_settings" 
ON public.founder_settings FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete founder_settings" 
ON public.founder_settings FOR DELETE 
TO authenticated
USING (true);

-- founder_projects policies
CREATE POLICY "Authenticated users can insert founder_projects" 
ON public.founder_projects FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update founder_projects" 
ON public.founder_projects FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete founder_projects" 
ON public.founder_projects FOR DELETE 
TO authenticated
USING (true);

-- founder_media policies
CREATE POLICY "Authenticated users can insert founder_media" 
ON public.founder_media FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update founder_media" 
ON public.founder_media FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete founder_media" 
ON public.founder_media FOR DELETE 
TO authenticated
USING (true);
