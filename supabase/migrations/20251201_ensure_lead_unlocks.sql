-- Ensure lead_unlocks table exists
CREATE TABLE IF NOT EXISTS public.lead_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  credits_spent INTEGER NOT NULL DEFAULT 5,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, lead_id)
);

-- Enable RLS
ALTER TABLE public.lead_unlocks ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Vendors can view own unlocks" ON public.lead_unlocks;
CREATE POLICY "Vendors can view own unlocks" ON public.lead_unlocks
  FOR SELECT
  USING (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Vendors can insert own unlocks" ON public.lead_unlocks;
CREATE POLICY "Vendors can insert own unlocks" ON public.lead_unlocks
  FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.lead_unlocks TO authenticated;
GRANT ALL ON public.lead_unlocks TO service_role;
