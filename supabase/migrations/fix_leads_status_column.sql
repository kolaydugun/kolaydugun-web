-- Check and fix leads status column

-- 1. Check if status is an enum type
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
  AND column_name = 'status';

-- 2. If it's an enum, check the allowed values
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%status%'
ORDER BY t.typname, e.enumsortorder;

-- 3. Change status column to TEXT type (simpler solution)
ALTER TABLE public.leads 
ALTER COLUMN status TYPE text;

-- 4. Set default value
ALTER TABLE public.leads 
ALTER COLUMN status SET DEFAULT 'new';

-- 5. Verify the change
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
  AND column_name = 'status';
