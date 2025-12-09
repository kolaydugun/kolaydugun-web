-- Add logo_url column to site_settings if it doesn't exist
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS logo_url text;
