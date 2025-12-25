-- Add missing columns to vendors table for subscription management
-- These columns are used by AdminVendors.jsx

-- Subscription end date
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Updated at timestamp
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Also add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_vendors_subscription_end_date ON vendors(subscription_end_date);
CREATE INDEX IF NOT EXISTS idx_vendors_updated_at ON vendors(updated_at);

-- Comments for documentation
COMMENT ON COLUMN vendors.subscription_end_date IS 'End date for vendor subscription';
COMMENT ON COLUMN vendors.updated_at IS 'Last update timestamp for vendor record';
