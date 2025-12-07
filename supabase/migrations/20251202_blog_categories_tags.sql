-- Blog Categories and Tags System
-- Migration: 20251202_blog_categories_tags.sql

-- ============================================
-- 1. BLOG CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL, -- {tr: "Düğün Planlaması", en: "Wedding Planning", de: "Hochzeitsplanung"}
  description JSONB, -- {tr: "...", en: "...", de: "..."}
  image_url TEXT,
  parent_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON blog_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON blog_categories(is_active);

-- ============================================
-- 2. POST-CATEGORIES JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (post_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_post_categories_post ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category ON post_categories(category_id);

-- ============================================
-- 3. BLOG TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL, -- {tr: "Yaz Düğünü", en: "Summer Wedding", de: "Sommerhochzeit"}
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

-- ============================================
-- 4. POST-TAGS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);

-- ============================================
-- 5. INSERT SAMPLE CATEGORIES
-- ============================================
INSERT INTO blog_categories (slug, name, description, sort_order) VALUES
('dugun-planlamasi', 
 '{"tr": "Düğün Planlaması", "en": "Wedding Planning", "de": "Hochzeitsplanung"}',
 '{"tr": "Düğün planlaması için kapsamlı rehberler", "en": "Comprehensive guides for wedding planning", "de": "Umfassende Leitfäden für die Hochzeitsplanung"}',
 1),

('gelin-hazirligi',
 '{"tr": "Gelin Hazırlığı", "en": "Bridal Preparation", "de": "Brautvorbereitung"}',
 '{"tr": "Gelin için hazırlık ipuçları ve öneriler", "en": "Preparation tips and suggestions for brides", "de": "Vorbereitungstipps und Vorschläge für Bräute"}',
 2),

('damat-rehberi',
 '{"tr": "Damat Rehberi", "en": "Groom Guide", "de": "Bräutigam-Leitfaden"}',
 '{"tr": "Damatlar için özel rehber ve tavsiyeler", "en": "Special guide and advice for grooms", "de": "Spezielle Anleitung und Ratschläge für Bräutigame"}',
 3),

('mekan-secimi',
 '{"tr": "Mekan Seçimi", "en": "Venue Selection", "de": "Veranstaltungsort Auswahl"}',
 '{"tr": "Düğün mekanı seçimi için ipuçları", "en": "Tips for choosing a wedding venue", "de": "Tipps zur Auswahl eines Hochzeitsortes"}',
 4),

('dekorasyon-fikirleri',
 '{"tr": "Dekorasyon Fikirleri", "en": "Decoration Ideas", "de": "Dekorationsideen"}',
 '{"tr": "Yaratıcı düğün dekorasyon fikirleri", "en": "Creative wedding decoration ideas", "de": "Kreative Hochzeitsdekorationsideen"}',
 5),

('dugun-butcesi',
 '{"tr": "Düğün Bütçesi", "en": "Wedding Budget", "de": "Hochzeitsbudget"}',
 '{"tr": "Bütçe planlaması ve tasarruf ipuçları", "en": "Budget planning and saving tips", "de": "Budgetplanung und Spartipps"}',
 6),

('gercek-dugunler',
 '{"tr": "Gerçek Düğünler", "en": "Real Weddings", "de": "Echte Hochzeiten"}',
 '{"tr": "Gerçek düğün hikayeleri ve fotoğrafları", "en": "Real wedding stories and photos", "de": "Echte Hochzeitsgeschichten und Fotos"}',
 7),

('trend-ilham',
 '{"tr": "Trend ve İlham", "en": "Trends & Inspiration", "de": "Trends & Inspiration"}',
 '{"tr": "En yeni düğün trendleri ve ilham kaynakları", "en": "Latest wedding trends and inspiration", "de": "Neueste Hochzeitstrends und Inspiration"}',
 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 6. INSERT SAMPLE TAGS
-- ============================================
INSERT INTO blog_tags (slug, name) VALUES
('yaz-dugunu', '{"tr": "Yaz Düğünü", "en": "Summer Wedding", "de": "Sommerhochzeit"}'),
('kis-dugunu', '{"tr": "Kış Düğünü", "en": "Winter Wedding", "de": "Winterhochzeit"}'),
('minimalist-dugun', '{"tr": "Minimalist Düğün", "en": "Minimalist Wedding", "de": "Minimalistische Hochzeit"}'),
('boho-dugun', '{"tr": "Boho Düğün", "en": "Boho Wedding", "de": "Boho-Hochzeit"}'),
('dugun-butcesi', '{"tr": "Düğün Bütçesi", "en": "Wedding Budget", "de": "Hochzeitsbudget"}'),
('diy-dekorasyon', '{"tr": "DIY Dekorasyon", "en": "DIY Decoration", "de": "DIY-Dekoration"}'),
('bahce-dugunu', '{"tr": "Bahçe Düğünü", "en": "Garden Wedding", "de": "Gartenhochzeit"}'),
('salon-dugunu', '{"tr": "Salon Düğünü", "en": "Ballroom Wedding", "de": "Ballsaal-Hochzeit"}'),
('plaj-dugunu', '{"tr": "Plaj Düğünü", "en": "Beach Wedding", "de": "Strandhochzeit"}'),
('rustik-dugun', '{"tr": "Rustik Düğün", "en": "Rustic Wedding", "de": "Rustikale Hochzeit"}')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 7. RLS POLICIES
-- ============================================

-- Categories: Public read access
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories"
ON blog_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON blog_categories FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- Post Categories: Public read
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view post categories"
ON post_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage post categories"
ON post_categories FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- Tags: Public read
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tags"
ON blog_tags FOR SELECT
USING (true);

CREATE POLICY "Admins can manage tags"
ON blog_tags FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- Post Tags: Public read
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view post tags"
ON post_tags FOR SELECT
USING (true);

CREATE POLICY "Admins can manage post tags"
ON post_tags FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to update category post count
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_categories 
    SET post_count = post_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_categories 
    SET post_count = post_count - 1
    WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_count
AFTER INSERT OR DELETE ON post_categories
FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_tags 
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_tags 
    SET usage_count = usage_count - 1
    WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_count
AFTER INSERT OR DELETE ON post_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();
