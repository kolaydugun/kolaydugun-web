-- Fix vendor leads update policy
-- The issue: leads table doesn't have vendor_id column directly
-- Vendors are linked via vendor_leads junction table

-- First, drop the incorrect policy if it exists
DROP POLICY IF EXISTS "vendors_update_own_leads" ON public.leads;

-- Create correct policy using vendor_leads junction table
CREATE POLICY "vendors_update_own_leads" ON public.leads
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT vl.lead_id 
    FROM public.vendor_leads vl
    INNER JOIN public.vendors v ON v.id = vl.vendor_id
    WHERE v.user_id = auth.uid()
  )
)
WITH CHECK (
  id IN (
    SELECT vl.lead_id 
    FROM public.vendor_leads vl
    INNER JOIN public.vendors v ON v.id = vl.vendor_id
    WHERE v.user_id = auth.uid()
  )
);
