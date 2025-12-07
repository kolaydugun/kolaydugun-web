-- ============================================
-- Şehir ve Kategori Verilerini Ekle (Genişletilmiş Liste)
-- ============================================

-- Şehirleri ekle (vendorData.js'deki tüm şehirler)
INSERT INTO cities (name, country) VALUES
  ('Berlin', 'Germany'),
  ('Hamburg', 'Germany'),
  ('München (Munich)', 'Germany'),
  ('Köln (Cologne)', 'Germany'),
  ('Frankfurt am Main', 'Germany'),
  ('Stuttgart', 'Germany'),
  ('Düsseldorf', 'Germany'),
  ('Dortmund', 'Germany'),
  ('Essen', 'Germany'),
  ('Bremen', 'Germany'),
  ('Hannover', 'Germany'),
  ('Leipzig', 'Germany'),
  ('Dresden', 'Germany'),
  ('Nürnberg (Nuremberg)', 'Germany'),
  ('Duisburg', 'Germany'),
  ('Bochum', 'Germany'),
  ('Wuppertal', 'Germany'),
  ('Bielefeld', 'Germany'),
  ('Bonn', 'Germany'),
  ('Münster', 'Germany'),
  ('Karlsruhe', 'Germany'),
  ('Mannheim', 'Germany'),
  ('Wiesbaden', 'Germany'),
  ('Augsburg', 'Germany'),
  ('Mönchengladbach', 'Germany'),
  ('Gelsenkirchen', 'Germany'),
  ('Braunschweig', 'Germany'),
  ('Kiel', 'Germany'),
  ('Aachen', 'Germany'),
  ('Chemnitz', 'Germany'),
  ('Magdeburg', 'Germany'),
  ('Freiburg im Breisgau', 'Germany'),
  ('Krefeld', 'Germany'),
  ('Lübeck', 'Germany'),
  ('Oberhausen', 'Germany'),
  ('Erfurt', 'Germany'),
  ('Mainz', 'Germany'),
  ('Rostock', 'Germany'),
  ('Kassel', 'Germany'),
  ('Hagen', 'Germany'),
  ('Saarbrücken', 'Germany'),
  ('Hamm', 'Germany'),
  ('Potsdam', 'Germany'),
  ('Ludwigshafen', 'Germany'),
  ('Oldenburg', 'Germany'),
  ('Leverkusen', 'Germany'),
  ('Osnabrück', 'Germany'),
  ('Solingen', 'Germany'),
  ('Heidelberg', 'Germany'),
  ('Herne', 'Germany'),
  ('Ulm', 'Germany'),
  ('Regensburg', 'Germany')
ON CONFLICT (name) DO NOTHING;

-- Kategorileri ekle (vendorData.js'deki tüm kategoriler)
INSERT INTO categories (name, description, icon) VALUES
  ('Wedding Venues', 'Düğün mekanları ve salonları', '🏛️'),
  ('Bridal Fashion', 'Gelinlik ve aksesuarlar', '👰'),
  ('Hair & Make-Up', 'Gelin saçı ve makyajı', '💄'),
  ('Groom Suits', 'Damatlık ve aksesuarlar', '🤵'),
  ('Wedding Cakes', 'Düğün pastaları ve tatlılar', '🎂'),
  ('Wedding Planners', 'Düğün organizasyonu ve planlama', '📋'),
  ('Wedding Cars', 'Gelin arabası kiralama', '🚗'),
  ('Catering & Party Service', 'Yemek ve içecek hizmetleri', '🍽️'),
  ('Wedding Speakers (Trauredner)', 'Nikah memuru ve konuşmacılar', '�'),
  ('Flowers & Decoration', 'Çiçek ve dekorasyon', '💐'),
  ('Invitations & Stationery', 'Davetiye ve kırtasiye', '💌'),
  ('Wedding Rings', 'Alyans ve takı', '�'),
  ('Wedding Photography', 'Düğün fotoğrafçılığı', '�'),
  ('Wedding Videography', 'Düğün video çekimi', '🎥'),
  ('Photobox', 'Fotoğraf kabini kiralama', '�️'),
  ('DJs', 'Düğün DJ hizmetleri', '🎧'),
  ('Musicians', 'Canlı müzik ve orkestra', '�'),
  ('Entertainment', 'Eğlence ve şov hizmetleri', '�')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Kontrol
-- ============================================

-- Şehirleri kontrol et
SELECT COUNT(*) as city_count FROM cities;

-- Kategorileri kontrol et
SELECT COUNT(*) as category_count FROM categories;

-- ============================================
-- TAMAMLANDI
-- ============================================
