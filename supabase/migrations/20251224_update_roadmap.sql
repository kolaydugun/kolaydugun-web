-- Refined Roadmap Updates

-- Clear existing demo projects
DELETE FROM public.founder_projects;

-- Insert Strategic Milestones
INSERT INTO public.founder_projects (title_tr, title_de, title_en, description_tr, description_de, description_en, status, order_index)
VALUES 
(
    'Platformun Temelleri', 
    'Plattform-Grundlagen', 
    'Platform Foundations', 
    'Almanya''nın en kapsamlı 3 dilli Türk düğün rehberinin kuruluşu ve geniş tedarikçi ağının yayına alınması.', 
    'Gründung von Deutschlands umfassendstem 3-sprachigem türkischen Hochzeitsführer und Start des großen Anbieternetzwerks.', 
    'Establishment of Germany''s most comprehensive 3-language Turkish wedding guide and launch of the extensive vendor network.', 
    'past', 
    1
),
(
    'Dijital Planlama Ekosistemi', 
    'Digitales Planning-Ökosystem', 
    'Digital Planning Ecosystem', 
    'Bütçe yönetimi, anlık zaman çizelgesi ve interaktif davetli listesi gibi çiftlerin hayatını kolaylaştıran araçların entegrasyonu.', 
    'Integration von Tools, die das Leben von Paaren erleichtern, wie Budgetmanagement, Echtzeit-Timeline und interaktive Gästeliste.', 
    'Integration of tools that make life easier for couples, such as budget management, real-time timeline, and interactive guest list.', 
    'past', 
    2
),
(
    'Shop & Pazaryeri Lansmanı', 
    'Shop & Marktplatz Launch', 
    'Shop & Marketplace Launch', 
    'Çiftlerin düğün hazırlıklarını tek noktadan yapabileceği, tedarikçilerin kendi ürünlerini satabildiği dijital mağaza altyapısı.', 
    'Digitale Shop-Infrastruktur, über die Paare ihre Hochzeitsvorbereitungen an einem Ort erledigen und Anbieter ihre eigenen Produkte verkaufen können.', 
    'Digital shop infrastructure where couples can do their wedding preparations in one place and vendors can sell their own products.', 
    'current', 
    3
),
(
    'AI Düğün Asistanı (Gemini)', 
    'KI-Hochzeitsassistent (Gemini)', 
    'AI Wedding Assistant (Gemini)', 
    'Google Gemini destekli, bütçenize ve hayallerinize göre kişiselleştirilmiş düğün planı ve tedarikçi önerileri sunan akıllı danışman.', 
    'KI-gestützter intelligenter Berater mit Google Gemini, der personalisierte Hochzeitspläne und Anbieterempfehlungen basierend auf Ihrem Budget und Ihren Träumen bietet.', 
    'AI-powered smart consultant with Google Gemini, providing personalized wedding plans and vendor recommendations based on your budget and dreams.', 
    'future', 
    4
),
(
    'Avrupa Genişlemesi & Super-App', 
    'Europa-Expansion & Super-App', 
    'European Expansion & Super-App', 
    'Tüm Avrupa''daki Türk düğün sektörü için bir numaralı dijital adres olma hedefi ve tüm süreci cepten yöneteceğiniz bir mobil Super-App vizyonu.', 
    'Das Ziel, die erste digitale Adresse für den türkischen Hochzeitssektor in ganz Europa zu werden, und die Vision einer mobilen Super-App, mit der Sie den gesamten Prozess von Ihrem Telefon aus verwalten können.', 
    'The goal of becoming the number one digital address for the Turkish wedding sector across all of Europe, and the vision of a mobile Super-App that allows you to manage the entire process from your phone.', 
    'future', 
    5
);
