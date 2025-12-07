-- Add CRM columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Update existing rows to have default status
UPDATE public.leads SET status = 'new' WHERE status IS NULL;
