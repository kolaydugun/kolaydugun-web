-- ============================================
-- KolayDugun Pazaryeri - Test Verisi
-- Sistemi test etmek için örnek veriler
-- ============================================

-- NOT: Bu script'i çalıştırmadan önce migration'ları tamamlayın!

-- 1. Test Vendor Profile Oluştur
-- Mevcut bir vendor user_id'si ile (kendi vendor ID'nizi kullanın)
INSERT INTO vendor_profiles (user_id, plan_type, credit_balance, show_contact_info, whatsapp_number, phone_number)
VALUES 
  -- Vendor 1: Pro plan, yüksek kredi
  ('YOUR_VENDOR_USER_ID_1', 'pro', 100, true, '+491234567890', '+491234567890'),
  -- Vendor 2: Free plan, düşük kredi
  ('YOUR_VENDOR_USER_ID_2', 'free', 5, false, NULL, NULL)
ON CONFLICT (user_id) DO UPDATE
SET 
  plan_type = EXCLUDED.plan_type,
  credit_balance = EXCLUDED.credit_balance,
  show_contact_info = EXCLUDED.show_contact_info;

-- 2. Test Lead Oluştur
-- Mevcut category_id ve city_id kullanın
INSERT INTO leads (category_id, city_id, event_date, guest_count, budget_min, budget_max, contact_name, contact_email, contact_phone, additional_notes)
VALUES
  -- Lead 1: Mekan arama
  (
    (SELECT id FROM categories WHERE name ILIKE '%mekan%' OR name ILIKE '%venue%' LIMIT 1),
    (SELECT id FROM cities WHERE name ILIKE '%berlin%' LIMIT 1),
    '2025-08-15',
    150,
    5000,
    10000,
    'Test Çift 1',
    'test1@example.com',
    '+491111111111',
    'Bahçeli mekan arıyoruz'
  ),
  -- Lead 2: Fotoğrafçı arama
  (
    (SELECT id FROM categories WHERE name ILIKE '%foto%' OR name ILIKE '%photo%' LIMIT 1),
    (SELECT id FROM cities WHERE name ILIKE '%münchen%' OR name ILIKE '%munich%' LIMIT 1),
    '2025-09-20',
    100,
    1500,
    3000,
    'Test Çift 2',
    'test2@example.com',
    '+492222222222',
    'Profesyonel fotoğrafçı gerekli'
  ),
  -- Lead 3: Catering
  (
    (SELECT id FROM categories WHERE name ILIKE '%catering%' OR name ILIKE '%yemek%' LIMIT 1),
    (SELECT id FROM cities WHERE name ILIKE '%hamburg%' LIMIT 1),
    '2025-07-10',
    200,
    3000,
    6000,
    'Test Çift 3',
    'test3@example.com',
    '+493333333333',
    'Türk mutfağı tercih ediyoruz'
  );

-- 3. Test Credit Request Oluştur (Manuel ödeme testi için)
INSERT INTO credit_requests (vendor_id, credits_requested, amount_eur, paypal_email, payment_reference, status)
VALUES
  -- Bekleyen talep
  ('YOUR_VENDOR_USER_ID_1', 32, 25.00, 'vendor1@paypal.com', 'TEST_REF_001', 'pending'),
  -- Onaylanmış talep
  ('YOUR_VENDOR_USER_ID_2', 12, 10.00, 'vendor2@paypal.com', 'TEST_REF_002', 'approved');

-- 4. Marketplace Config Kontrolü
-- PayPal e-posta adresinizi buraya ekleyin
UPDATE marketplace_config
SET value = '"your-paypal@email.com"'
WHERE key = 'paypal_email';

-- Lead fiyatları (kategoriye göre)
INSERT INTO marketplace_config (key, value, description) VALUES
  ('lead_prices', '{"default": 5, "venue": 10, "photography": 7, "catering": 8}', 'Lead açma fiyatları (kredi)')
ON CONFLICT (key) DO UPDATE
SET value = '{"default": 5, "venue": 10, "photography": 7, "catering": 8}';

-- Featured listing fiyatları
INSERT INTO marketplace_config (key, value, description) VALUES
  ('featured_prices', '{"7_days": 14, "30_days": 60}', 'Featured listing fiyatları (kredi)')
ON CONFLICT (key) DO UPDATE
SET value = '{"7_days": 14, "30_days": 60}';

-- ============================================
-- KULLANIM NOTLARI
-- ============================================

-- Kendi vendor ID'nizi bulmak için:
-- SELECT id, email FROM auth.users WHERE email = 'your-vendor@email.com';

-- Kategorileri görmek için:
-- SELECT id, name FROM categories;

-- Şehirleri görmek için:
-- SELECT id, name FROM cities;

-- Vendor profile kontrolü:
-- SELECT * FROM vendor_profiles WHERE user_id = 'YOUR_USER_ID';

-- Lead'leri görmek için:
-- SELECT * FROM leads ORDER BY created_at DESC;

-- Vendor lead eşleştirmelerini görmek için:
-- SELECT vl.*, l.contact_name, l.contact_email 
-- FROM vendor_leads vl
-- JOIN leads l ON vl.lead_id = l.id
-- WHERE vl.vendor_id = 'YOUR_VENDOR_ID';

-- ============================================
-- TAMAMLANDI
-- ============================================
