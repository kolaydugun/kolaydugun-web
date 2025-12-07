-- ============================================
-- KolayDugun Pazaryeri - Faz 2 Migration
-- PayPal Entegrasyonu ve Kredi Kontrolü
-- ============================================

-- 1. add_credits RPC fonksiyonu (Kredi yükleme)
CREATE OR REPLACE FUNCTION add_credits(
  paypal_order_id TEXT,
  paypal_transaction_id TEXT,
  credits INTEGER,
  amount DECIMAL
)
RETURNS JSON AS $$
DECLARE
  v_vendor_id UUID := auth.uid();
BEGIN
  -- Transaction kaydı
  INSERT INTO transactions (
    vendor_id, type, amount, credits, 
    paypal_order_id, paypal_transaction_id, status
  ) VALUES (
    v_vendor_id, 'credit_purchase', amount, credits,
    paypal_order_id, paypal_transaction_id, 'completed'
  );
  
  -- Kredi ekle
  UPDATE vendor_profiles
  SET credit_balance = credit_balance + credits
  WHERE user_id = v_vendor_id;
  
  -- Eğer vendor_profiles kaydı yoksa oluştur
  INSERT INTO vendor_profiles (user_id, credit_balance)
  VALUES (v_vendor_id, credits)
  ON CONFLICT (user_id) DO UPDATE
  SET credit_balance = vendor_profiles.credit_balance + credits;
  
  RETURN json_build_object('success', true, 'new_balance', (
    SELECT credit_balance FROM vendor_profiles WHERE user_id = v_vendor_id
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. activate_pro_plan RPC fonksiyonu (Pro plan aktivasyonu)
CREATE OR REPLACE FUNCTION activate_pro_plan(
  paypal_subscription_id TEXT,
  plan_duration TEXT DEFAULT 'monthly'
)
RETURNS JSON AS $$
DECLARE
  v_vendor_id UUID := auth.uid();
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Plan süresini hesapla
  IF plan_duration = 'yearly' THEN
    v_expires_at := NOW() + INTERVAL '1 year';
  ELSE
    v_expires_at := NOW() + INTERVAL '1 month';
  END IF;
  
  -- Vendor profile güncelle
  UPDATE vendor_profiles
  SET 
    plan_type = 'pro',
    plan_started_at = NOW(),
    plan_expires_at = v_expires_at,
    paypal_subscription_id = paypal_subscription_id,
    show_contact_info = true
  WHERE user_id = v_vendor_id;
  
  -- Eğer vendor_profiles kaydı yoksa oluştur
  INSERT INTO vendor_profiles (
    user_id, plan_type, plan_started_at, plan_expires_at, 
    paypal_subscription_id, show_contact_info
  )
  VALUES (
    v_vendor_id, 'pro', NOW(), v_expires_at, 
    paypal_subscription_id, true
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    plan_type = 'pro',
    plan_started_at = NOW(),
    plan_expires_at = v_expires_at,
    paypal_subscription_id = paypal_subscription_id,
    show_contact_info = true;
  
  -- Transaction kaydı
  INSERT INTO transactions (
    vendor_id, type, status, paypal_transaction_id
  ) VALUES (
    v_vendor_id, 'pro_subscription', 'completed', paypal_subscription_id
  );
  
  RETURN json_build_object('success', true, 'plan_type', 'pro', 'expires_at', v_expires_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. unlock_lead RPC fonksiyonu (Kredi kontrolü ile)
CREATE OR REPLACE FUNCTION unlock_lead(vendor_lead_id UUID)
RETURNS JSON AS $$
DECLARE
  v_vendor_id UUID := auth.uid();
  v_lead_id UUID;
  v_category_id UUID;
  v_credit_balance INTEGER;
  v_lead_price INTEGER;
  v_config JSONB;
  v_category_name TEXT;
BEGIN
  -- Vendor lead bilgilerini al
  SELECT vendor_id, lead_id INTO v_vendor_id, v_lead_id
  FROM vendor_leads WHERE id = vendor_lead_id;
  
  -- Yetki kontrolü
  IF v_vendor_id != auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Yetkisiz erişim');
  END IF;
  
  -- Lead zaten açılmış mı kontrol et
  IF EXISTS (SELECT 1 FROM vendor_leads WHERE id = vendor_lead_id AND is_unlocked = true) THEN
    RETURN json_build_object('success', false, 'error', 'Lead zaten açılmış');
  END IF;
  
  -- Lead'in kategorisini al
  SELECT category_id INTO v_category_id FROM leads WHERE id = v_lead_id;
  
  -- Vendor'ın kredi bakiyesini al
  SELECT credit_balance INTO v_credit_balance 
  FROM vendor_profiles WHERE user_id = v_vendor_id;
  
  -- Kredi bakiyesi yoksa 0 olarak kabul et
  v_credit_balance := COALESCE(v_credit_balance, 0);
  
  -- Lead fiyatını config'den al
  SELECT value INTO v_config FROM marketplace_config WHERE key = 'lead_prices';
  
  -- Kategori adını al (opsiyonel, fallback için)
  SELECT name INTO v_category_name FROM categories WHERE id = v_category_id;
  
  -- Kategori bazlı fiyat veya default fiyat
  v_lead_price := COALESCE(
    (v_config ->> v_category_id::TEXT)::INTEGER,
    (v_config ->> LOWER(v_category_name))::INTEGER,
    (v_config ->> 'default')::INTEGER,
    5 -- Fallback fiyat
  );
  
  -- Kredi kontrolü
  IF v_credit_balance < v_lead_price THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Yetersiz kredi', 
      'required', v_lead_price,
      'current', v_credit_balance
    );
  END IF;
  
  -- Unlock işlemi
  UPDATE vendor_leads 
  SET is_unlocked = true, unlocked_at = NOW()
  WHERE id = vendor_lead_id;
  
  -- Kredi düş
  UPDATE vendor_profiles
  SET credit_balance = credit_balance - v_lead_price
  WHERE user_id = v_vendor_id;
  
  -- Transaction kaydı
  INSERT INTO transactions (vendor_id, type, credits, related_lead_id, status)
  VALUES (v_vendor_id, 'lead_unlock', -v_lead_price, v_lead_id, 'completed');
  
  RETURN json_build_object(
    'success', true, 
    'credits_spent', v_lead_price,
    'new_balance', v_credit_balance - v_lead_price
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. feature_listing RPC fonksiyonu (Kredi kontrolü ile)
CREATE OR REPLACE FUNCTION feature_listing(
  p_listing_id UUID,
  p_duration_days INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_vendor_id UUID := auth.uid();
  v_credit_balance INTEGER;
  v_credits_needed INTEGER;
  v_config JSONB;
  v_transaction_id UUID;
BEGIN
  -- Kredi bakiyesini al
  SELECT credit_balance INTO v_credit_balance 
  FROM vendor_profiles WHERE user_id = v_vendor_id;
  
  -- Kredi bakiyesi yoksa 0 olarak kabul et
  v_credit_balance := COALESCE(v_credit_balance, 0);
  
  -- Featured fiyatını al
  SELECT value INTO v_config FROM marketplace_config WHERE key = 'featured_prices';
  
  -- Süreye göre fiyat belirle
  v_credits_needed := COALESCE(
    (v_config ->> (p_duration_days::TEXT || '_days'))::INTEGER,
    p_duration_days * 2 -- Fallback: günlük 2 kredi
  );
  
  -- Kredi kontrolü
  IF v_credit_balance < v_credits_needed THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Yetersiz kredi',
      'required', v_credits_needed,
      'current', v_credit_balance
    );
  END IF;
  
  -- Transaction kaydı oluştur
  INSERT INTO transactions (
    vendor_id, type, credits, related_listing_id, status
  ) VALUES (
    v_vendor_id, 'featured_listing', -v_credits_needed, p_listing_id, 'completed'
  ) RETURNING id INTO v_transaction_id;
  
  -- Featured listing ekle
  INSERT INTO featured_listings (
    listing_id, vendor_id, featured_until, credits_spent, transaction_id
  ) VALUES (
    p_listing_id, v_vendor_id, 
    NOW() + (p_duration_days || ' days')::INTERVAL, 
    v_credits_needed,
    v_transaction_id
  );
  
  -- Kredi düş
  UPDATE vendor_profiles
  SET credit_balance = credit_balance - v_credits_needed
  WHERE user_id = v_vendor_id;
  
  RETURN json_build_object(
    'success', true,
    'credits_spent', v_credits_needed,
    'new_balance', v_credit_balance - v_credits_needed,
    'featured_until', NOW() + (p_duration_days || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. cancel_pro_plan RPC fonksiyonu (İptal için)
CREATE OR REPLACE FUNCTION cancel_pro_plan()
RETURNS JSON AS $$
DECLARE
  v_vendor_id UUID := auth.uid();
BEGIN
  -- Plan'ı free'ye çevir
  UPDATE vendor_profiles
  SET 
    plan_type = 'free',
    plan_expires_at = NULL,
    paypal_subscription_id = NULL,
    show_contact_info = false
  WHERE user_id = v_vendor_id;
  
  RETURN json_build_object('success', true, 'plan_type', 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Migration tamamlandı!
-- Sıradaki adım: Frontend'e PayPal butonlarını eklemek.
