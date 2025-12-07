-- ============================================
-- Vendor Profile Enhancements Migration
-- Purpose: Add location, claimed badge, and video support
-- ============================================

-- Add location data
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS address TEXT;

-- Add claimed badge system
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS claim_requested_at TIMESTAMPTZ;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS claim_approved_at TIMESTAMPTZ;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS claim_documents JSONB;

-- Add video support
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_vendors_claimed ON vendors(is_claimed);

-- Comments
COMMENT ON COLUMN vendors.latitude IS 'Vendor location latitude for map display';
COMMENT ON COLUMN vendors.longitude IS 'Vendor location longitude for map display';
COMMENT ON COLUMN vendors.address IS 'Full address for display and directions';
COMMENT ON COLUMN vendors.is_claimed IS 'Whether vendor has claimed and verified their profile';
COMMENT ON COLUMN vendors.claim_requested_at IS 'When vendor requested to claim profile';
COMMENT ON COLUMN vendors.claim_approved_at IS 'When admin approved claim request';
COMMENT ON COLUMN vendors.claim_documents IS 'Business verification documents (URLs)';
COMMENT ON COLUMN vendors.video_url IS 'YouTube or Vimeo video URL';
