-- ============================================
-- FIX ALL FOREIGN KEYS TO CASCADE DELETE
-- This script finds all foreign keys referencing profiles/users 
-- and ensures they are set to ON DELETE CASCADE
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- 1. Loop through all foreign keys referencing public.profiles
    FOR r IN 
        SELECT tc.table_schema, tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name IN ('profiles', 'users')
          AND tc.table_schema = 'public'
    LOOP
        -- Drop existing constraint and recreate with CASCADE
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.table_name || '_' || r.column_name || '_fkey');
                
        -- Try to add it back with CASCADE (generic naming)
        -- Note: We assume standard naming or just add a new one if specific name unknown
        -- A safer approach is to alter if possible, but Postgres requires drop/add for cascade change
        
        BEGIN
            EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                    ' ADD CONSTRAINT ' || quote_ident(r.table_name || '_' || r.column_name || '_fkey_cascade') || 
                    ' FOREIGN KEY (' || quote_ident(r.column_name) || ') ' || 
                    ' REFERENCES ' || quote_ident(r.table_schema) || '.' || quote_ident(r.foreign_table_name) || ' (id) ' ||
                    ' ON DELETE CASCADE';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not update constraint for %.%', r.table_name, r.column_name;
        END;
    END LOOP;
END $$;

-- Specifically fix known tables to be sure
ALTER TABLE IF EXISTS public.vendors 
  DROP CONSTRAINT IF EXISTS vendors_id_fkey,
  ADD CONSTRAINT vendors_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.vendor_profiles 
  DROP CONSTRAINT IF EXISTS vendor_profiles_user_id_fkey,
  ADD CONSTRAINT vendor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.transactions 
  DROP CONSTRAINT IF EXISTS transactions_vendor_id_fkey,
  ADD CONSTRAINT transactions_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.leads 
  DROP CONSTRAINT IF EXISTS leads_user_id_fkey,
  ADD CONSTRAINT leads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.vendor_leads 
  DROP CONSTRAINT IF EXISTS vendor_leads_vendor_id_fkey,
  ADD CONSTRAINT vendor_leads_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.posts 
  DROP CONSTRAINT IF EXISTS posts_author_id_fkey,
  ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.messages 
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
  ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.messages 
  DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey,
  ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.favorites 
  DROP CONSTRAINT IF EXISTS favorites_user_id_fkey,
  ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
