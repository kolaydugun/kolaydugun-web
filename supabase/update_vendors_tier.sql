-- Update subscription_tier check constraint
ALTER TABLE public.vendors 
DROP CONSTRAINT IF EXISTS vendors_subscription_tier_check;

ALTER TABLE public.vendors 
ADD CONSTRAINT vendors_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'basic', 'premium'));

-- Add new columns for detailed profile
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Comment on columns for clarity
COMMENT ON COLUMN public.vendors.subscription_tier IS 'Tier: free, basic, premium';
COMMENT ON COLUMN public.vendors.social_media IS 'JSONB: {instagram, facebook, etc.} - Premium only';
COMMENT ON COLUMN public.vendors.faq IS 'JSONB: Array of {question, answer} - Premium only';
