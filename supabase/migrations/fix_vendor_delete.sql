-- Fix Foreign Key Constraints to allow Vendor Deletion and Subscriptions

-- 1. Fix vendor_subscriptions to reference vendors(id) instead of auth.users(id)
-- First, drop the existing constraint
ALTER TABLE public.vendor_subscriptions DROP CONSTRAINT IF EXISTS vendor_subscriptions_vendor_id_fkey;

-- Then, add the correct constraint referencing vendors(id) with CASCADE DELETE
ALTER TABLE public.vendor_subscriptions 
    ADD CONSTRAINT vendor_subscriptions_vendor_id_fkey 
    FOREIGN KEY (vendor_id) 
    REFERENCES public.vendors(id) 
    ON DELETE CASCADE;

-- 2. Fix favorites table (if it exists) to ensure CASCADE DELETE
-- We try to drop the constraint first (name might vary, so we try common names)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'favorites') THEN
        ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_vendor_id_fkey;
        
        ALTER TABLE public.favorites 
            ADD CONSTRAINT favorites_vendor_id_fkey 
            FOREIGN KEY (vendor_id) 
            REFERENCES public.vendors(id) 
            ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Ensure leads and vendor_leads have CASCADE DELETE (just in case)
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_vendor_id_fkey;
ALTER TABLE public.leads 
    ADD CONSTRAINT leads_vendor_id_fkey 
    FOREIGN KEY (vendor_id) 
    REFERENCES public.vendors(id) 
    ON DELETE CASCADE;

ALTER TABLE public.vendor_leads DROP CONSTRAINT IF EXISTS vendor_leads_vendor_id_fkey;
ALTER TABLE public.vendor_leads 
    ADD CONSTRAINT vendor_leads_vendor_id_fkey 
    FOREIGN KEY (vendor_id) 
    REFERENCES public.vendors(id) 
    ON DELETE CASCADE;
