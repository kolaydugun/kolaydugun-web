-- ============================================
-- Manuel PayPal Ödeme Sistemi
-- Credit Request Tablosu
-- ============================================

-- 1. credit_requests tablosu (Manuel ödeme talepleri)
CREATE TABLE IF NOT EXISTS credit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_requested INTEGER NOT NULL,
  amount_eur DECIMAL(10,2) NOT NULL,
  paypal_email TEXT, -- Kullanıcının PayPal e-postası (opsiyonel)
  payment_reference TEXT, -- Kullanıcının verdiği referans/transaction ID
  payment_proof_url TEXT, -- Ödeme ekran görüntüsü URL'i (opsiyonel)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own credit requests"
  ON credit_requests FOR SELECT
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create credit requests"
  ON credit_requests FOR INSERT
  WITH CHECK (auth.uid() = vendor_id);

-- Admin'ler tüm talepleri görebilir ve güncelleyebilir
CREATE POLICY "Admins can view all credit requests"
  ON credit_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update credit requests"
  ON credit_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Index
CREATE INDEX idx_credit_requests_status ON credit_requests(status, created_at DESC);
CREATE INDEX idx_credit_requests_vendor ON credit_requests(vendor_id);

-- 2. approve_credit_request RPC fonksiyonu (Admin kullanır)
CREATE OR REPLACE FUNCTION approve_credit_request(
  request_id UUID,
  admin_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_vendor_id UUID;
  v_credits INTEGER;
  v_amount DECIMAL;
  v_admin_id UUID := auth.uid();
BEGIN
  -- Admin kontrolü
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Yetkisiz erişim');
  END IF;

  -- Request bilgilerini al
  SELECT vendor_id, credits_requested, amount_eur 
  INTO v_vendor_id, v_credits, v_amount
  FROM credit_requests 
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Talep bulunamadı veya zaten işlenmiş');
  END IF;

  -- Request'i onayla
  UPDATE credit_requests
  SET 
    status = 'approved',
    approved_by = v_admin_id,
    approved_at = NOW(),
    admin_notes = admin_note
  WHERE id = request_id;

  -- Kredi ekle
  UPDATE vendor_profiles
  SET credit_balance = credit_balance + v_credits
  WHERE user_id = v_vendor_id;

  -- Eğer vendor_profiles kaydı yoksa oluştur
  INSERT INTO vendor_profiles (user_id, credit_balance)
  VALUES (v_vendor_id, v_credits)
  ON CONFLICT (user_id) DO UPDATE
  SET credit_balance = vendor_profiles.credit_balance + v_credits;

  -- Transaction kaydı
  INSERT INTO transactions (
    vendor_id, type, amount, credits, status
  ) VALUES (
    v_vendor_id, 'credit_purchase', v_amount, v_credits, 'completed'
  );

  RETURN json_build_object(
    'success', true, 
    'credits_added', v_credits,
    'vendor_id', v_vendor_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. reject_credit_request RPC fonksiyonu (Admin kullanır)
CREATE OR REPLACE FUNCTION reject_credit_request(
  request_id UUID,
  admin_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_admin_id UUID := auth.uid();
BEGIN
  -- Admin kontrolü
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Yetkisiz erişim');
  END IF;

  -- Request'i reddet
  UPDATE credit_requests
  SET 
    status = 'rejected',
    approved_by = v_admin_id,
    approved_at = NOW(),
    admin_notes = admin_note
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Talep bulunamadı');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Marketplace config'e PayPal e-posta ekle
INSERT INTO marketplace_config (key, value, description) VALUES
  ('paypal_email', '"your-paypal@email.com"', 'Manuel transfer için PayPal e-posta adresi')
ON CONFLICT (key) DO UPDATE
SET value = '"your-paypal@email.com"';

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Manuel PayPal ödeme sistemi hazır!
-- Admin panelden credit request'leri onaylayabilirsiniz.
