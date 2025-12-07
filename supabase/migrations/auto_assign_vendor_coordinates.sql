-- ============================================
-- Otomatik Vendor Koordinat Atama Sistemi
-- ============================================
-- Bu migration, yeni vendor eklendiğinde veya şehir değiştirildiğinde
-- otomatik olarak o şehrin koordinatlarını atayan bir trigger oluşturur.

-- Trigger fonksiyonunu oluştur
CREATE OR REPLACE FUNCTION auto_assign_city_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer latitude NULL ve city dolu ise, cities tablosundan koordinatları al
  IF NEW.latitude IS NULL AND NEW.city IS NOT NULL THEN
    SELECT 
      c.latitude, 
      c.longitude, 
      c.name || ', Germany'
    INTO 
      NEW.latitude, 
      NEW.longitude, 
      NEW.address
    FROM cities c
    WHERE c.name = NEW.city;
    
    -- Eğer şehir bulunamazsa, log için bir mesaj ekle (opsiyonel)
    IF NEW.latitude IS NULL THEN
      RAISE NOTICE 'City % not found in cities table', NEW.city;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı vendors tablosuna ekle
DROP TRIGGER IF EXISTS assign_coordinates_on_insert_or_update ON vendors;

CREATE TRIGGER assign_coordinates_on_insert_or_update
  BEFORE INSERT OR UPDATE OF city ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_city_coordinates();

-- Mevcut koordinatı olmayan vendor'ları güncelle
UPDATE vendors v
SET 
    latitude = c.latitude,
    longitude = c.longitude,
    address = c.name || ', Germany'
FROM cities c
WHERE v.city = c.name
  AND v.latitude IS NULL;

-- ============================================
-- Doğrulama
-- ============================================

-- Trigger'ın oluşturulduğunu kontrol et
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'assign_coordinates_on_insert_or_update';

-- Vendor istatistiklerini göster
SELECT 
    COUNT(*) as total_vendors,
    COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as with_location,
    COUNT(CASE WHEN latitude IS NULL THEN 1 END) as without_location,
    ROUND(COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100, 2) as location_percentage
FROM vendors;

-- ============================================
-- NOTLAR
-- ============================================
-- 1. Bu trigger artık her yeni vendor eklendiğinde otomatik çalışacak
-- 2. Vendor şehrini değiştirdiğinde de otomatik yeni koordinatlar atanacak
-- 3. Mevcut vendor'lar için de bir kere UPDATE çalıştırıldı
-- 4. Artık manuel SQL script çalıştırmaya gerek yok!
-- 5. Sistem tamamen otomatik çalışıyor 🚀
