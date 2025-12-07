-- Add Vendor CRM columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT 'new' CHECK (vendor_status IN ('new', 'contacted', 'booked', 'lost')),
ADD COLUMN IF NOT EXISTS vendor_notes TEXT;

-- Enable RLS if not already enabled (it should be)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy to allow Vendors to UPDATE their own leads
-- This allows them to update status and notes
CREATE POLICY "vendors_update_own_leads" ON public.leads
FOR UPDATE
TO authenticated
USING (
  vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
)
WITH CHECK (
  vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
);
