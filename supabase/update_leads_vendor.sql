-- Add vendor_id to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.vendors(id);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Vendors can view their own leads
CREATE POLICY "Vendors can view their own leads" 
ON public.leads 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.vendors WHERE id = leads.vendor_id
  )
);

-- Policy: Insert is public (or authenticated users) - usually public for lead forms
CREATE POLICY "Anyone can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);
