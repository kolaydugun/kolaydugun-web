-- ============================================
-- KolayDugun Pazaryeri - Veritabanı Migration
-- Faz 1: Temel Yapı
-- ============================================

-- 1. vendor_profiles tablosu
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
  plan_started_at TIMESTAMPTZ,
  plan_expires_at TIMESTAMPTZ,
  paypal_subscription_id TEXT,
  credit_balance INTEGER DEFAULT 0,
  whatsapp_number TEXT,
  phone_number TEXT,
  show_contact_info BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for vendor_profiles
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own profile"
  ON vendor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update own profile"
  ON vendor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert own profile"
  ON vendor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. leads tablosu
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  category_id UUID, -- Mevcut categories tablosuna referans
  city_id UUID, -- Mevcut cities tablosuna referans
  event_date DATE,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  additional_notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create leads"
  ON leads FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL); -- NULL için anonim lead

-- 3. vendor_leads tablosu (eşleştirmeler)
CREATE TABLE IF NOT EXISTS vendor_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  match_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, vendor_id)
);

-- RLS Policies for vendor_leads
ALTER TABLE vendor_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own lead matches"
  ON vendor_leads FOR SELECT
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update own lead matches"
  ON vendor_leads FOR UPDATE
  USING (auth.uid() = vendor_id);

-- Index for performance
CREATE INDEX idx_vendor_leads_vendor ON vendor_leads(vendor_id, is_unlocked);
CREATE INDEX idx_vendor_leads_lead ON vendor_leads(lead_id);

-- 4. transactions tablosu
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit_purchase', 'lead_unlock', 'featured_listing', 'pro_subscription')),
  amount DECIMAL(10,2),
  credits INTEGER,
  paypal_transaction_id TEXT,
  paypal_order_id TEXT,
  related_lead_id UUID REFERENCES leads(id),
  related_listing_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = vendor_id);

-- Index for performance
CREATE INDEX idx_transactions_vendor ON transactions(vendor_id, created_at DESC);

-- 5. featured_listings tablosu
CREATE TABLE IF NOT EXISTS featured_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL,
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  featured_until TIMESTAMPTZ NOT NULL,
  credits_spent INTEGER,
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for featured_listings
ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active featured listings"
  ON featured_listings FOR SELECT
  USING (featured_until > NOW());

CREATE POLICY "Vendors can view own featured listings"
  ON featured_listings FOR SELECT
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert own featured listings"
  ON featured_listings FOR INSERT
  WITH CHECK (auth.uid() = vendor_id);

-- Index for active featured listings
CREATE INDEX idx_featured_active ON featured_listings(featured_until) WHERE featured_until > NOW();
CREATE INDEX idx_featured_listing ON featured_listings(listing_id);

-- 6. marketplace_config tablosu
CREATE TABLE IF NOT EXISTS marketplace_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for marketplace_config
ALTER TABLE marketplace_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read config"
  ON marketplace_config FOR SELECT
  USING (true);

-- Sadece admin güncelleyebilir (role kontrolü gerekli)
CREATE POLICY "Only admins can update config"
  ON marketplace_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Örnek konfigürasyonlar
INSERT INTO marketplace_config (key, value, description) VALUES
  ('lead_prices', '{"default": 5, "dj": 3, "venue": 10, "photographer": 7}', 'Lead açma fiyatları (kredi cinsinden)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO marketplace_config (key, value, description) VALUES
  ('credit_packages', '[{"euros": 10, "credits": 12}, {"euros": 25, "credits": 32}, {"euros": 50, "credits": 70}]', 'Kredi paketleri')
ON CONFLICT (key) DO NOTHING;

INSERT INTO marketplace_config (key, value, description) VALUES
  ('pro_plan_price', '{"monthly": 29.99, "yearly": 299.99}', 'Pro plan fiyatları (Euro)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO marketplace_config (key, value, description) VALUES
  ('featured_prices', '{"7_days": 10, "30_days": 35}', 'Featured listing fiyatları (kredi cinsinden)')
ON CONFLICT (key) DO NOTHING;

-- 7. profiles tablosuna role ekle (eğer tablo varsa)
-- NOT: Eğer profiles tablonuz yoksa, bu kısmı atlayın veya yeni bir tablo oluşturun
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'couple' CHECK (role IN ('couple', 'vendor', 'admin'));
  END IF;
END $$;

-- ============================================
-- TRIGGER: Lead oluşturulduğunda vendor eşleştirme
CREATE TRIGGER trigger_match_vendors
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION match_vendors_to_lead();

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Faz 1: Lead unlock (kredi kontrolsüz)
CREATE OR REPLACE FUNCTION unlock_lead_phase1(vendor_lead_id UUID)
RETURNS JSON AS $$
DECLARE
  v_vendor_id UUID := auth.uid();
BEGIN
  -- Sadece unlock et, kredi kontrolü yok
  UPDATE vendor_leads 
  SET is_unlocked = true, unlocked_at = NOW()
  WHERE id = vendor_lead_id AND vendor_id = v_vendor_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Lead bulunamadı');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Faz 1: Featured listing (kredi kontrolsüz)
CREATE OR REPLACE FUNCTION feature_listing_phase1(
  p_listing_id UUID,
  p_duration_days INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_vendor_id UUID := auth.uid();
BEGIN
  -- Featured listing ekle, kredi kontrolü yok
  INSERT INTO featured_listings (
    listing_id, vendor_id, featured_until, credits_spent
  ) VALUES (
    p_listing_id, v_vendor_id, 
    NOW() + (p_duration_days || ' days')::INTERVAL, 
    0 -- Faz 1'de kredi yok
  );
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES
-- ============================================

-- Performance için ek indexler
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category_id);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Migration tamamlandı!
-- Sıradaki adım: Frontend komponentlerini oluşturmak.
