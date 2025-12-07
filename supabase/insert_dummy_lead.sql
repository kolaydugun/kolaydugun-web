-- Insert dummy lead for 'Elite Weddings Berlin'
DO $$
DECLARE
    v_id UUID;
BEGIN
    -- Get Vendor ID
    SELECT id INTO v_id FROM public.vendors WHERE business_name = 'Elite Weddings Berlin' LIMIT 1;

    IF v_id IS NOT NULL THEN
        -- Insert into leads using correct column names from LeadForm.jsx
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
