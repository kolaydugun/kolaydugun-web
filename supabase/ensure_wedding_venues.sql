-- ============================================
-- Düğün Mekanları Kategorisini Ekle/Güncelle
-- ============================================

-- "Wedding Venues" kategorisinin var olduğundan emin ol
-- Frontend çeviri sistemi bu İngilizce anahtarı ("Wedding Venues") kullanır:
-- TR: "Düğün Mekanları"
-- DE: "Hochzeitslocations"
-- EN: "Wedding Venues"

INSERT INTO categories (name, description, icon)
VALUES (
  'Wedding Venues', 
  'Düğün mekanları, salonlar, kır düğünü alanları ve tarihi mekanlar', 
  '🏛️'
)
ON CONFLICT (name) DO UPDATE
SET 
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- Kontrol et
SELECT * FROM categories WHERE name = 'Wedding Venues';
