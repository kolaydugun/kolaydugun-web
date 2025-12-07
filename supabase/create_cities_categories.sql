-- ============================================
-- Şehirler ve Kategoriler Tablolarını Oluştur ve Doldur
-- ============================================

-- 1. cities tablosu
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  country TEXT DEFAULT 'Germany',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for cities
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  USING (true);

-- 2. categories tablosu
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- ============================================
-- VERİ EKLEME
-- ============================================

-- Şehirleri ekle (52 Şehir)
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

-- Kategorileri ekle (18 Kategori)
INSERT INTO categories (name, description, icon) VALUES
  ('Wedding Venues', 'Düğün mekanları ve salonları', '🏛️'),
  ('Bridal Fashion', 'Gelinlik ve aksesuarlar', '👰'),
  ('Hair & Make-Up', 'Gelin saçı ve makyajı', '💄'),
  ('Groom Suits', 'Damatlık ve aksesuarlar', '🤵'),
  ('Wedding Cakes', 'Düğün pastaları ve tatlılar', '🎂'),
  ('Wedding Planners', 'Düğün organizasyonu ve planlama', '📋'),
  ('Wedding Cars', 'Gelin arabası kiralama', '🚗'),
  ('Catering & Party Service', 'Yemek ve içecek hizmetleri', '🍽️'),
  ('Wedding Speakers (Trauredner)', 'Nikah memuru ve konuşmacılar', '🎤'),
  ('Flowers & Decoration', 'Çiçek ve dekorasyon', '💐'),
  ('Invitations & Stationery', 'Davetiye ve kırtasiye', '💌'),
  ('Wedding Rings', 'Alyans ve takı', '💍'),
  ('Wedding Photography', 'Düğün fotoğrafçılığı', '📸'),
  ('Wedding Videography', 'Düğün video çekimi', '🎥'),
  ('Photobox', 'Fotoğraf kabini kiralama', '🖼️'),
  ('DJs', 'Düğün DJ hizmetleri', '🎧'),
  ('Musicians', 'Canlı müzik ve orkestra', '🎵'),
  ('Entertainment', 'Eğlence ve şov hizmetleri', '🎪')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- KONTROL
-- ============================================

SELECT COUNT(*) as city_count FROM cities;
SELECT COUNT(*) as category_count FROM categories;
