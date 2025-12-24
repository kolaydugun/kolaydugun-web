-- Founder Section Schema

-- 1. Founder Global Settings (Bio, Photo, Socials)
CREATE TABLE IF NOT EXISTS public.founder_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bio_tr TEXT,
    bio_de TEXT,
    bio_en TEXT,
    photo_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Founder Roadmap (Projects)
CREATE TABLE IF NOT EXISTS public.founder_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_tr TEXT NOT NULL,
    title_de TEXT,
    title_en TEXT,
    description_tr TEXT,
    description_de TEXT,
    description_en TEXT,
    status TEXT DEFAULT 'future', -- 'past', 'current', 'future'
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Founder Media (YouTube, Press)
CREATE TABLE IF NOT EXISTS public.founder_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'youtube', 'press'
    media_format TEXT DEFAULT 'regular', -- 'regular', 'short'
    category_tr TEXT,
    category_de TEXT,
    category_en TEXT,
    title_tr TEXT NOT NULL,
    title_de TEXT,
    title_en TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.founder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_media ENABLE ROW LEVEL SECURITY;

-- Public Read
CREATE POLICY "Public read founder_settings" ON public.founder_settings FOR SELECT USING (true);
CREATE POLICY "Public read founder_projects" ON public.founder_projects FOR SELECT USING (true);
CREATE POLICY "Public read founder_media" ON public.founder_media FOR SELECT USING (true);

-- Only Admin Write
-- (Assuming we have a check_is_admin() function or similar, using current_user check for now)
-- In this project, usually we use a roles check. Let's keep it simple for now as per other migrations.

-- Seed Data (Demo)

-- Founder Settings
INSERT INTO public.founder_settings (bio_tr, bio_de, bio_en, photo_url, social_links)
VALUES (
    'KolayDugun''ün kurucusu olarak vizyonum, düğün planlama sürecini her çift için stressiz, şeffaf ve dijital bir deneyime dönüştürmek. Teknolojiyi geleneğimizle birleştirerek Avrupa''daki en büyük düğün platformunu inşa ediyoruz.',
    'Als Gründer von KolayDugun ist meine Vision, den Hochzeitsplanungsprozess für jedes Paar in eine stressfreie, transparente und digitale Erfahrung zu verwandeln. Wir bauen die größte Hochzeitsplattform in Europa, indem wir Technologie mit unserer Tradition verbinden.',
    'As the founder of KolayDugun, my vision is to transform the wedding planning process into a stress-free, transparent, and digital experience for every couple. We are building the largest wedding platform in Europe by merging technology with our tradition.',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800', -- Professional placeholder
    '{"linkedin": "https://linkedin.com", "youtube": "https://youtube.com", "instagram": "https://instagram.com"}'::jsonb
);

-- Roadmap Projects
INSERT INTO public.founder_projects (title_tr, title_de, title_en, description_tr, description_de, description_en, status, order_index)
VALUES 
('Platformun Temelleri', 'Grundlagen der Plattform', 'Platform Foundations', 'Almanya''daki ilk Türk düğün rehberinin dijitalleşmesi.', 'Digitalisierung des ersten türkischen Hochzeitsleitfadens in Deutschland.', 'Digitalization of the first Turkish wedding guide in Germany.', 'past', 1),
('Bütçe ve Ajanda Araçları', 'Budget- und Planer-Tools', 'Budget and Planner Tools', 'Çiftlerin tüm süreçlerini yönetebileceği akıllı araçların lansmanı.', 'Einführung smarter Tools für Paare zur Verwaltung ihrer Planung.', 'Launch of smart tools for couples to manage their planning.', 'current', 2),
('AI Düğün Asistanı', 'KI-Hochzeitsassistent', 'AI Wedding Assistant', 'Gemini altyapısı ile çiftlere özel planlama önerileri sunan yapay zeka entegrasyonu.', 'KI-Integration für personalisierte Planungsvorschläge mit Gemini.', 'AI integration providing personalized planning suggestions using Gemini.', 'future', 3);

-- Media items
INSERT INTO public.founder_media (type, media_format, category_tr, category_de, category_en, title_tr, title_de, title_en, url, thumbnail_url, order_index)
VALUES 
('youtube', 'regular', 'Tanıtım', 'Promotion', 'Promotion', 'KolayDugun Nedir?', 'Was ist KolayDugun?', 'What is KolayDugun?', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg', 1),
('youtube', 'short', 'Eğitim', 'Tutorial', 'Tutorial', 'Bütçe Planlama İpucu', 'Budget-Tipp', 'Budget Tip', 'https://youtube.com/shorts/dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg', 2),
('press', 'regular', 'Basın', 'Presse', 'Press', 'Hochzeit24 Özel Röportajı', 'Interview mit Hochzeit24', 'Interview with Hochzeit24', 'https://example.com/press', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400', 3);
