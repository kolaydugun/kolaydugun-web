-- Add gallery_url column to wedding_details table
ALTER TABLE wedding_details 
ADD COLUMN IF NOT EXISTS gallery_url TEXT;

-- Comment on column
COMMENT ON COLUMN wedding_details.gallery_url IS 'External link to Google Photos or iCloud album';
