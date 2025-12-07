-- Fix leads table: Make event_date nullable
-- Çiftler bazen henüz tarih belirlememiş olabilir

ALTER TABLE public.leads 
ALTER COLUMN event_date DROP NOT NULL;

-- Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
  AND column_name = 'event_date';
