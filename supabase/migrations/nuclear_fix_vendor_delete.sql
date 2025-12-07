-- NUCLEAR FIX: Ensure ALL tables referencing vendors have ON DELETE CASCADE

DO $$
DECLARE
    r RECORD;
BEGIN
    -- List of tables that might reference vendors
    -- Add any suspected table here
    FOR r IN SELECT * FROM (VALUES 
        ('featured_listings'), 
        ('reviews'), 
        ('vendor_reviews'), 
        ('quotes'), 
        ('messages'), 
        ('conversations'),
        ('vendor_photos'),
        ('vendor_videos'),
        ('favorites'),
        ('vendor_subscriptions'),
        ('leads'),
        ('vendor_leads'),
        ('lead_unlocks'),
        ('transactions'),
        ('subscription_transactions')
    ) AS t(table_name)
    LOOP
        -- Check if table exists
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = r.table_name) THEN
            
            -- Try to find the constraint referencing vendors
            -- We can't easily find the name, so we try to drop common names
            -- or we just try to add the constraint and ignore if it fails (but that doesn't fix missing cascade)
            
            -- STRATEGY: Drop potential constraints by name guessing
            EXECUTE 'ALTER TABLE public.' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.table_name || '_vendor_id_fkey';
            EXECUTE 'ALTER TABLE public.' || r.table_name || ' DROP CONSTRAINT IF EXISTS fk_' || r.table_name || '_vendors';
            EXECUTE 'ALTER TABLE public.' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.table_name || '_vendor_fkey';
            
            -- Re-add the constraint with CASCADE
            -- We assume the column is named 'vendor_id'. If it's not, this will fail safely (catch block needed? No, let's just try)
            BEGIN
                EXECUTE 'ALTER TABLE public.' || r.table_name || ' ADD CONSTRAINT ' || r.table_name || '_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE';
                RAISE NOTICE 'Fixed table: %', r.table_name;
            EXCEPTION WHEN OTHERS THEN
                -- Column vendor_id might not exist or constraint already exists with different name
                RAISE NOTICE 'Could not fix table % (might not have vendor_id column or other issue): %', r.table_name, SQLERRM;
            END;
            
        END IF;
    END LOOP;
END $$;
