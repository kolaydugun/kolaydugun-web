-- Enable RLS on leads table if not already enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy to allow Admins to UPDATE leads (for Status and Notes)
CREATE POLICY "Admins can update leads" ON public.leads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy to allow Admins to SELECT all leads (if not already covered)
CREATE POLICY "Admins can view all leads" ON public.leads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
