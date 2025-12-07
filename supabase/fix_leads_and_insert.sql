-- 1. Add vendor_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'vendor_id') THEN
        ALTER TABLE public.leads ADD COLUMN vendor_id UUID REFERENCES public.vendors(id);
    END IF;
END $$;

-- 2. Add status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'status') THEN
        ALTER TABLE public.leads ADD COLUMN status TEXT DEFAULT 'new';
    END IF;
END $$;

-- 3. Enable RLS if not already enabled (idempotent)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to avoid conflicts (optional, but safer for updates)
DROP POLICY IF EXISTS "Vendors can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- 5. Re-create policies
CREATE POLICY "Vendors can view their own leads" 
ON public.leads 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.vendors WHERE id = leads.vendor_id
  )
);

CREATE POLICY "Anyone can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- 6. Insert dummy lead with CORRECT columns
DO $$
DECLARE
    v_id UUID;
BEGIN
    -- Get Vendor ID
    SELECT id INTO v_id FROM public.vendors WHERE business_name = 'Elite Weddings Berlin' LIMIT 1;

    IF v_id IS NOT NULL THEN
        INSERT INTO public.leads (
            vendor_id, 
            contact_name, 
            contact_email, 
            contact_phone, 
            additional_notes, 
            event_date, 
            status,
            budget_min,
            budget_max
        )
        VALUES (
            v_id, 
            'Hans Müller', 
            'hans@example.com', 
            '+49 123 456789', 
            'Hallo, wir interessieren uns für Ihre Location für unsere Hochzeit im Sommer.', 
            '2024-08-15', 
            'new',
            5000,
            10000
        );
    ELSE
        RAISE NOTICE 'Vendor not found';
    END IF;
END $$;
