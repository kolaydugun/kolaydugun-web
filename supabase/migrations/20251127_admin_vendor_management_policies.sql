-- ============================================
-- Vendor Subscription System & Admin Policies
-- ============================================

-- 1. Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'free', 'pro_monthly', 'pro_yearly'
  display_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_period TEXT, -- 'month', 'year', null for free
  features JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vendor Subscriptions Table
CREATE TABLE IF NOT EXISTS vendor_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'pending'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_vendor ON vendor_subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_status ON vendor_subscriptions(status);

-- 3. Subscription Transactions Table
CREATE TABLE IF NOT EXISTS subscription_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES vendor_subscriptions(id),
  vendor_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  payment_method TEXT DEFAULT 'paypal',
  payment_id TEXT, -- PayPal transaction ID
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_transactions_vendor ON subscription_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_status ON subscription_transactions(status);

-- 4. Lead Unlocks Table (for FREE users)
CREATE TABLE IF NOT EXISTS lead_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) DEFAULT 10.00,
  payment_id TEXT,
  payment_status TEXT DEFAULT 'completed',
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_unlocks_vendor ON lead_unlocks(vendor_id);
CREATE INDEX IF NOT EXISTS idx_lead_unlocks_lead ON lead_unlocks(lead_id);

-- 5. Seed Initial Plans
INSERT INTO subscription_plans (name, display_name, price, billing_period, features) VALUES
('free', 'Free', 0, NULL, '{
  "profile": true,
  "photos": 1,
  "contact_info": true,
  "map": true,
  "stats": true,
  "gallery": false,
  "video": false,
  "lead_access": false,
  "analytics": false,
  "social_media": false,
  "faq": false
}'::jsonb),
('pro_monthly', 'Pro Monthly', 29.00, 'month', '{
  "profile": true,
  "photos": 999,
  "contact_info": true,
  "map": true,
  "stats": true,
  "gallery": true,
  "video": true,
  "lead_access": true,
  "analytics": true,
  "social_media": true,
  "faq": true,
  "priority_support": true
}'::jsonb),
('pro_yearly', 'Pro Yearly', 290.00, 'year', '{
  "profile": true,
  "photos": 999,
  "contact_info": true,
  "map": true,
  "stats": true,
  "gallery": true,
  "video": true,
  "lead_access": true,
  "analytics": true,
  "social_media": true,
  "faq": true,
  "priority_support": true,
  "annual_discount": true
}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- RLS Policies
-- ============================================

-- Ensure RLS is enabled on vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'vendors' table

-- Allow public read access (so profile pages work)
DROP POLICY IF EXISTS "Anyone can view vendors" ON vendors;
CREATE POLICY "Anyone can view vendors"
  ON vendors
  FOR SELECT
  USING (true);

-- Allow admins to do everything (create, update, delete)
DROP POLICY IF EXISTS "Admins can do everything on vendors" ON vendors;
CREATE POLICY "Admins can do everything on vendors"
  ON vendors
  FOR ALL
  USING (is_admin());

-- Allow vendors to update their own profile
DROP POLICY IF EXISTS "Vendors can update own profile" ON vendors;
CREATE POLICY "Vendors can update own profile"
  ON vendors
  FOR UPDATE
  USING (auth.uid() = id);

-- 2. Policies for 'vendor_subscriptions' table

-- Enable RLS
ALTER TABLE vendor_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow admins to do everything
DROP POLICY IF EXISTS "Admins can do everything on vendor_subscriptions" ON vendor_subscriptions;
CREATE POLICY "Admins can do everything on vendor_subscriptions"
  ON vendor_subscriptions
  FOR ALL
  USING (is_admin());

-- Allow vendors to view their own subscriptions
DROP POLICY IF EXISTS "Vendors can view own subscriptions" ON vendor_subscriptions;
CREATE POLICY "Vendors can view own subscriptions" ON vendor_subscriptions
  FOR SELECT USING (auth.uid() = vendor_id);

-- 3. Policies for 'subscription_transactions' table

-- Enable RLS
ALTER TABLE subscription_transactions ENABLE ROW LEVEL SECURITY;

-- Allow admins to do everything
DROP POLICY IF EXISTS "Admins can do everything on subscription_transactions" ON subscription_transactions;
CREATE POLICY "Admins can do everything on subscription_transactions"
  ON subscription_transactions
  FOR ALL
  USING (is_admin());

-- Allow vendors to view their own transactions
DROP POLICY IF EXISTS "Vendors can view own transactions" ON subscription_transactions;
CREATE POLICY "Vendors can view own transactions" ON subscription_transactions
  FOR SELECT USING (auth.uid() = vendor_id);

-- ============================================
-- Helper Functions
-- ============================================

-- Get active subscription for vendor
CREATE OR REPLACE FUNCTION get_vendor_subscription(vendor_uuid UUID)
RETURNS TABLE (
  plan_name TEXT,
  plan_display_name TEXT,
  features JSONB,
  status TEXT,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.name,
    sp.display_name,
    sp.features,
    vs.status,
    vs.expires_at
  FROM vendor_subscriptions vs
  JOIN subscription_plans sp ON vs.plan_id = sp.id
  WHERE vs.vendor_id = vendor_uuid
    AND vs.status = 'active'
  ORDER BY vs.created_at DESC
  LIMIT 1;
  
  -- If no active subscription, return FREE plan
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      sp.name,
      sp.display_name,
      sp.features,
      'active'::TEXT,
      NULL::TIMESTAMPTZ
    FROM subscription_plans sp
    WHERE sp.name = 'free';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
