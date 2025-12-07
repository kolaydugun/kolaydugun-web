-- DEBUG FUNCTION: Find all tables referencing 'vendors'
-- Run this to create a function that lists every table linked to vendors.

CREATE OR REPLACE FUNCTION debug_get_vendor_references()
RETURNS TABLE (
    schema_name text,
    table_name text,
    constraint_name text,
    column_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tc.table_schema::text, 
        tc.table_name::text, 
        tc.constraint_name::text, 
        kcu.column_name::text
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='vendors';
END;
$$;

GRANT EXECUTE ON FUNCTION debug_get_vendor_references TO authenticated;
GRANT EXECUTE ON FUNCTION debug_get_vendor_references TO anon;
GRANT EXECUTE ON FUNCTION debug_get_vendor_references TO service_role;
