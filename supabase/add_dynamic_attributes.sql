-- 1. Add form_schema to categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS form_schema JSONB DEFAULT '[]'::jsonb;

-- 2. Add details to vendors
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;

-- 3. Seed Form Schemas (Turkish)
-- Wedding Venues
UPDATE public.categories 
SET form_schema = '[
    {"key": "venue_type", "label": "Mekan Tipi", "type": "multiselect", "options": ["Kır Düğünü", "Otel", "Tarihi Mekan", "Restoran", "Tekne", "Sosyal Tesis"]},
    {"key": "capacity_meal", "label": "Yemekli Kapasite", "type": "number"},
    {"key": "capacity_cocktail", "label": "Kokteyl Kapasite", "type": "number"},
    {"key": "view", "label": "Manzara", "type": "multiselect", "options": ["Deniz", "Doğa", "Şehir", "Boğaz", "Tarihi"]},
    {"key": "features", "label": "İmkanlar", "type": "multiselect", "options": ["Konaklama", "Otopark", "Vale", "Engelli Girişi", "After Party Alanı", "Menü Tadımı"]},
    {"key": "allowed_services", "label": "Dışarıdan İzin Verilenler", "type": "multiselect", "options": ["Dışarıdan Catering", "Dışarıdan Organizasyon", "Dışarıdan Fotoğrafçı"]}
]'::jsonb
WHERE name = 'Wedding Venues';

-- Wedding Photography
UPDATE public.categories 
SET form_schema = '[
    {"key": "shooting_types", "label": "Çekim Türleri", "type": "multiselect", "options": ["Düğün Belgeseli", "Düğün Hikayesi", "Katalog Çekimi", "Save the Date", "Trashday", "Nişan/Kına"]},
    {"key": "delivery_time_weeks", "label": "Teslim Süresi (Hafta)", "type": "number"},
    {"key": "team_size", "label": "Ekip Kişi Sayısı", "type": "number"},
    {"key": "services", "label": "Ek Hizmetler", "type": "multiselect", "options": ["Drone Çekimi", "Jimmy Jib", "Albüm Baskı", "Dijital Teslim", "Tüm Gün Çekim"]},
    {"key": "start_price", "label": "Başlangıç Fiyatı", "type": "number"}
]'::jsonb
WHERE name = 'Wedding Photography';

-- Musicians
UPDATE public.categories 
SET form_schema = '[
    {"key": "performance_type", "label": "Performans Türü", "type": "multiselect", "options": ["DJ", "Canlı Orkestra", "Fasıl Grubu", "Trio", "Bando", "Solist"]},
    {"key": "genres", "label": "Müzik Tarzları", "type": "multiselect", "options": ["Pop", "Caz", "Türkçe Pop", "Yabancı", "Yöresel/Oyun Havası", "Klasik", "Rock"]},
    {"key": "team_size", "label": "Orkestra Kişi Sayısı", "type": "number"},
    {"key": "equipment", "label": "Ekipman", "type": "multiselect", "options": ["Ses Sistemi", "Işık Sistemi", "Sahne Kurulumu", "Sis Makinesi"]},
    {"key": "demo_available", "label": "Demo İmkanı", "type": "boolean"}
]'::jsonb
WHERE name = 'Musicians';

-- Wedding Cars
UPDATE public.categories 
SET form_schema = '[
    {"key": "vehicle_types", "label": "Araç Tipi", "type": "multiselect", "options": ["Klasik", "Spor", "Limuzin", "Vosvos", "VIP Minibüs", "Cabrio"]},
    {"key": "driver_included", "label": "Şoförlü Hizmet", "type": "boolean"},
    {"key": "decoration_included", "label": "Süsleme Dahil", "type": "boolean"},
    {"key": "min_rental_hours", "label": "Min. Kiralama Süresi (Saat)", "type": "number"}
]'::jsonb
WHERE name = 'Wedding Cars';

-- Bridal Fashion
UPDATE public.categories 
SET form_schema = '[
    {"key": "service_type", "label": "Hizmet Türü", "type": "multiselect", "options": ["Hazır Model", "Özel Dikim", "Kiralama"]},
    {"key": "delivery_time_weeks", "label": "Teslim Süresi (Hafta)", "type": "number"},
    {"key": "accessory_services", "label": "Aksesuar İmkanı", "type": "multiselect", "options": ["Duvak", "Kese", "Eldiven", "Gelin Buketi"]},
    {"key": "appointment_required", "label": "Randevu Zorunlu", "type": "boolean"}
]'::jsonb
WHERE name = 'Bridal Fashion';
