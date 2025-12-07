-- AUTO FIX CASCADES
-- This script dynamically finds ALL foreign keys referencing 'vendors' and updates them to ON DELETE CASCADE.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            tc.table_schema, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'vendors'
    LOOP
        RAISE NOTICE 'Processing table %.% - constraint %', r.table_schema, r.table_name, r.constraint_name;
        
        -- 1. Drop the existing constraint
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        
        -- 2. Add it back with ON DELETE CASCADE
        -- Note: We assume the reference is to 'id' column of vendors, which is standard.
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || ' ADD CONSTRAINT ' || quote_ident(r.constraint_name) || ' FOREIGN KEY (' || quote_ident(r.column_name) || ') REFERENCES ' || quote_ident(r.table_schema) || '.' || quote_ident(r.foreign_table_name) || '(id) ON DELETE CASCADE';
        
        RAISE NOTICE 'Updated % to ON DELETE CASCADE', r.constraint_name;
        
    END LOOP;
END $$;
