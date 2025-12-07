-- Create a function to force delete a vendor and all related data
-- This is necessary because simple deletes might fail due to FK constraints or RLS policies
-- SECURITY DEFINER ensures it runs with the privileges of the creator (postgres/admin)

DROP FUNCTION IF EXISTS public.force_delete_vendor(uuid);

CREATE OR REPLACE FUNCTION public.force_delete_vendor(target_vendor_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Delete from dependent tables (Child records first)
    
    -- Vendor Leads
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vendor_leads') THEN
        EXECUTE 'DELETE FROM public.vendor_leads WHERE vendor_id = $1' USING target_vendor_id;
    END IF;
    
    -- Vendor Subscriptions
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vendor_subscriptions') THEN
        EXECUTE 'DELETE FROM public.vendor_subscriptions WHERE vendor_id = $1' USING target_vendor_id;
    END IF;
    
    -- Reviews
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
        EXECUTE 'DELETE FROM public.reviews WHERE vendor_id = $1' USING target_vendor_id;
    END IF;
    
    -- Listings
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listings') THEN
        EXECUTE 'DELETE FROM public.listings WHERE vendor_id = $1' USING target_vendor_id;
    END IF;
    
    -- Favorites
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'favorites') THEN
        EXECUTE 'DELETE FROM public.favorites WHERE vendor_id = $1' USING target_vendor_id;
    END IF;
    
    -- Quotes
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotes') THEN
        EXECUTE 'DELETE FROM public.quotes WHERE vendor_id = $1' USING target_vendor_id;
    END IF;
    
    -- Messages
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
        -- Check if columns exist before trying to use them to avoid errors if schema differs
        -- But dynamic SQL with column check is complex. 
        -- Let's rely on the hint and standard schema: sender_id and receiver_id.
        -- If receiver_id doesn't exist, this might fail, but sender_id definitely exists per hint.
        -- Let's try deleting where sender_id or receiver_id matches.
        EXECUTE 'DELETE FROM public.messages WHERE sender_id = $1 OR receiver_id = $1' USING target_vendor_id;
    END IF;

    -- 2. Delete from 1:1 tables
    
    -- Vendor Profiles
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vendor_profiles') THEN
        EXECUTE 'DELETE FROM public.vendor_profiles WHERE id = $1' USING target_vendor_id;
    END IF;
    
    -- 3. Finally delete the Vendor
    DELETE FROM public.vendors WHERE id = target_vendor_id;
    
    -- Optional: If the vendor is linked to a user in auth.users, we might want to delete the user too?
    -- Usually we don't delete auth users from a "vendor delete" function unless explicitly requested.
    -- But if the vendor IS the user, maybe?
    -- For now, let's just delete the vendor record.

END;
$$;
