
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';
const supabase = createClient(supabaseUrl, supabaseKey);

const schemas = {
    "Wedding Venues": [
        { "key": "venue_type", "label": "Mekan Tipi", "type": "multiselect", "options": ["Kır Düğünü", "Otel", "Tarihi Mekan", "Restoran", "Tekne", "Sosyal Tesis", "Düğün Salonu"] },
        { "key": "capacity_meal", "label": "Yemekli Kapasite", "type": "number" },
        { "key": "capacity_cocktail", "label": "Kokteyl Kapasite", "type": "number" },
        { "key": "view", "label": "Manzara", "type": "multiselect", "options": ["Deniz", "Doğa", "Şehir", "Boğaz", "Tarihi", "Göl", "Orman"] },
        { "key": "features", "label": "İmkanlar", "type": "multiselect", "options": ["Konaklama", "Otopark", "Vale", "Engelli Girişi", "After Party Alanı", "Menü Tadımı", "Işık, Ses ve Sahne"] },
        { "key": "allowed_services", "label": "Dışarıdan İzin Verilenler", "type": "multiselect", "options": ["Dışarıdan Catering", "Dışarıdan Organizasyon", "Dışarıdan Fotoğrafçı"] }
    ],
    "Wedding Photography": [
        { "key": "shooting_types", "label": "Çekim Türleri", "type": "multiselect", "options": ["Düğün Belgeseli", "Düğün Hikayesi", "Katalog Çekimi", "Save the Date", "Trashday", "Nişan/Kına", "Stüdyo Çekimi"] },
        { "key": "delivery_time_weeks", "label": "Teslim Süresi (Hafta)", "type": "number" },
        { "key": "team_size", "label": "Ekip Kişi Sayısı", "type": "number" },
        { "key": "services", "label": "Ek Hizmetler", "type": "multiselect", "options": ["Drone Çekimi", "Jimmy Jib", "Albüm Baskı", "Dijital Teslim", "Tüm Gün Çekim", "Video Klip"] },
        { "key": "start_price", "label": "Başlangıç Fiyatı", "type": "number" }
    ],
    "Musicians": [
        { "key": "performance_type", "label": "Performans Türü", "type": "multiselect", "options": ["DJ", "Canlı Orkestra", "Fasıl Grubu", "Trio", "Bando", "Solist", "Duo"] },
        { "key": "genres", "label": "Müzik Tarzları", "type": "multiselect", "options": ["Pop", "Caz", "Türkçe Pop", "Yabancı", "Yöresel/Oyun Havası", "Klasik", "Rock", "R&B", "Elektronik"] },
        { "key": "team_size", "label": "Orkestra Kişi Sayısı", "type": "number" },
        { "key": "equipment", "label": "Ekipman", "type": "multiselect", "options": ["Ses Sistemi", "Işık Sistemi", "Sahne Kurulumu", "Sis Makinesi", "Truss Sistemi"] },
        { "key": "demo_available", "label": "Demo Dinletisi Var mı?", "type": "boolean" }
    ],
    "Wedding Planners": [
        { "key": "services", "label": "Hizmetler", "type": "multiselect", "options": ["Masa/Sandalye Temini", "Mekan Süsleme", "Çiçek", "LCV Hizmeti", "Barkovizyon", "Havai Fişek", "Sanatçı Temini", "Catering"] },
        { "key": "concepts", "label": "Konsept Seçenekleri", "type": "multiselect", "options": ["Bohem", "Rustik", "Modern", "Klasik", "Vintage", "Romantik", "Endüstriyel"] },
        { "key": "demo_table", "label": "Demo Masa Hazırlığı", "type": "boolean" },
        { "key": "city_out", "label": "Şehir Dışına Hizmet", "type": "boolean" }
    ],
    "Bridal Fashion": [
        { "key": "service_type", "label": "Hizmet Türü", "type": "multiselect", "options": ["Hazır Model", "Özel Dikim", "Kiralama", "Haute Couture"] },
        { "key": "delivery_time_weeks", "label": "Teslim Süresi (Hafta)", "type": "number" },
        { "key": "accessory_services", "label": "Aksesuar", "type": "multiselect", "options": ["Duvak", "Kese", "Eldiven", "Gelin Buketi", "Saç Aksesuarı", "Ayakkabı"] },
        { "key": "appointment_required", "label": "Randevu Zorunlu mu?", "type": "boolean" },
        { "key": "rehearsals", "label": "Prova Sayısı", "type": "number" }
    ],
    "Catering & Party Service": [
        { "key": "cuisine_types", "label": "Mutfak Türleri", "type": "multiselect", "options": ["Türk Mutfağı", "Dünya Mutfağı", "Vejetaryen", "Vegan", "Kosher", "Çocuk Menüsü", "Osmanlı Mutfağı"] },
        { "key": "services", "label": "Hizmetler", "type": "multiselect", "options": ["Servis Personeli", "Ekipman Kiralama", "Menü Tadımı", "Pasta Kesimi", "İçecek Servisi"] },
        { "key": "min_guests", "label": "Minimum Kişi Sayısı", "type": "number" },
        { "key": "max_guests", "label": "Maksimum Kişi Sayısı", "type": "number" }
    ],
    "Wedding Cars": [
        { "key": "vehicle_types", "label": "Araç Tipi", "type": "multiselect", "options": ["Klasik", "Spor", "Limuzin", "Vosvos", "VIP Minibüs", "Cabrio", "Helikopter", "Tekne"] },
        { "key": "driver_included", "label": "Şoförlü Hizmet", "type": "boolean" },
        { "key": "decoration_included", "label": "Süsleme Dahil mi?", "type": "boolean" },
        { "key": "min_rental_hours", "label": "Minimum Kiralama Süresi (Saat)", "type": "number" }
    ],
    "Hair & Make-Up": [
        { "key": "service_location", "label": "Hizmet Yeri", "type": "multiselect", "options": ["Salonda", "Evde/Otelde Hizmet", "Şehir Dışında Hizmet"] },
        { "key": "services", "label": "Hizmetler", "type": "multiselect", "options": ["Gelin Başı", "Makyaj", "Manikür/Pedikür", "Ağda", "Cilt Bakımı", "Takma Kirpik", "El/Ayak Masajı"] },
        { "key": "rehearsal_available", "label": "Prova İmkanı", "type": "boolean" },
        { "key": "team_size", "label": "Aynı Anda Hizmet Kapasitesi", "type": "number" }
    ],
    "Invitations & Stationery": [
        { "key": "products", "label": "Ürünler", "type": "multiselect", "options": ["Davetiye", "Nikah Şekeri", "Hediyelik", "Anı Defteri", "Masa Kartı", "Menü Kartı", "Karşılama Panosu"] },
        { "key": "delivery_time_weeks", "label": "Teslim Süresi (Hafta)", "type": "number" },
        { "key": "min_order_quantity", "label": "Minimum Sipariş Adedi", "type": "number" },
        { "key": "design_service", "label": "Özel Tasarım Hizmeti", "type": "boolean" }
    ],
    "Flowers & Decoration": [
        { "key": "services", "label": "Hizmetler", "type": "multiselect", "options": ["Gelin Buketi", "Damat Yaka Çiçeği", "Mekan Süsleme", "Araç Süsleme", "Gelin Yolu", "Masa Süsleme", "Nikah Kürsüsü"] },
        { "key": "flower_types", "label": "Çiçek Türleri", "type": "multiselect", "options": ["Canlı Çiçek", "Yapay Çiçek", "Kurutulmuş Çiçek", "Şoklanmış Çiçek"] },
        { "key": "delivery_available", "label": "Teslimat/Kurulum Var mı?", "type": "boolean" }
    ],
    "Wedding Cakes": [
        { "key": "products", "label": "Ürünler", "type": "multiselect", "options": ["Düğün Pastası", "Cupcake", "Makaron", "Nişan Pastası", "Şeker Büfesi"] },
        { "key": "dietary_options", "label": "Özel Beslenme Seçenekleri", "type": "multiselect", "options": ["Glutensiz", "Laktozsuz", "Vegan", "Şekersiz", "Yumurta İçermeyen"] },
        { "key": "tasting_available", "label": "Tadım İmkanı", "type": "boolean" },
        { "key": "delivery_available", "label": "Teslimat Var mı?", "type": "boolean" }
    ],
    "Groom Suits": [
        { "key": "service_type", "label": "Hizmet Türü", "type": "multiselect", "options": ["Hazır Model", "Özel Dikim", "Kiralama"] },
        { "key": "products", "label": "Ürünler", "type": "multiselect", "options": ["Damatlık", "Smokin", "Frak", "Gömlek", "Ayakkabı", "Kol Düğmesi", "Papyon/Kravat"] },
        { "key": "delivery_time_weeks", "label": "Teslim Süresi (Hafta)", "type": "number" },
        { "key": "alteration_service", "label": "Tadilat Hizmeti", "type": "boolean" }
    ],
    "Wedding Videography": [
        { "key": "shooting_types", "label": "Çekim Türleri", "type": "multiselect", "options": ["Düğün Hikayesi", "Düğün Klibi", "Düğün Belgeseli", "Save the Date", "Trashday", "Teaser"] },
        { "key": "delivery_time_weeks", "label": "Teslim Süresi (Hafta)", "type": "number" },
        { "key": "services", "label": "Hizmetler", "type": "multiselect", "options": ["Drone Çekimi", "Jimmy Jib", "4K Çekim", "Montaj/Kurgu", "Sosyal Medya Klibi"] },
        { "key": "team_size", "label": "Ekip Kişi Sayısı", "type": "number" }
    ],
    "Photobox": [
        { "key": "features", "label": "Özellikler", "type": "multiselect", "options": ["Sınırsız Baskı", "GIF Yapma", "Boomerang", "Yeşil Perde (Green Screen)", "Özel Arka Plan", "Aksesuar Temini"] },
        { "key": "print_size", "label": "Baskı Boyutu", "type": "multiselect", "options": ["10x15", "Şerit (Strip)", "Polaroid"] },
        { "key": "digital_copy", "label": "Dijital Kopya Teslimi", "type": "boolean" },
        { "key": "assistant_included", "label": "Asistan Dahil mi?", "type": "boolean" }
    ],
    "Wedding Speakers (Trauredner)": [
        { "key": "languages", "label": "Diller", "type": "multiselect", "options": ["Türkçe", "Almanca", "İngilizce", "Fransızca", "İspanyolca"] },
        { "key": "services", "label": "Hizmetler", "type": "multiselect", "options": ["Kişiye Özel Metin", "Sembolik Nikah", "Yemin Yenileme", "Hikaye Yazımı"] },
        { "key": "meeting_count", "label": "Görüşme Sayısı", "type": "number" },
        { "key": "duration_minutes", "label": "Ortalama Süre (Dakika)", "type": "number" }
    ],
    "Wedding Rings": [
        { "key": "products", "label": "Ürünler", "type": "multiselect", "options": ["Alyans", "Tektaş", "Beştaş", "Gerdanlık", "Küpe", "Bileklik", "Saat"] },
        { "key": "material", "label": "Materyaller", "type": "multiselect", "options": ["Altın (Sarı)", "Altın (Beyaz)", "Altın (Rose)", "Platin", "Gümüş", "Elmas", "Pırlanta"] },
        { "key": "custom_design", "label": "Özel Tasarım", "type": "boolean" },
        { "key": "maintenance_service", "label": "Bakım/Onarım Hizmeti", "type": "boolean" }
    ],
    "DJs": [
        { "key": "music_genres", "label": "Müzik Tarzları", "type": "multiselect", "options": ["Pop", "Türkçe Pop", "Yabancı Pop", "R&B", "Hip Hop", "Elektronik", "House", "Techno", "90'lar", "80'ler"] },
        { "key": "equipment", "label": "Ekipman", "type": "multiselect", "options": ["Ses Sistemi", "Işık Sistemi", "Sis Makinesi", "DJ Kabini", "Mikrofon"] },
        { "key": "performance_duration", "label": "Performans Süresi (Saat)", "type": "number" },
        { "key": "experience_years", "label": "Deneyim (Yıl)", "type": "number" }
    ],
    "Entertainment": [
        { "key": "act_type", "label": "Gösteri Türü", "type": "multiselect", "options": ["Dans Ekibi", "Sihirbaz", "Ateş Gösterisi", "Akrobasi", "Komedyen", "Karikatürist", "Havai Fişek"] },
        { "key": "duration_minutes", "label": "Gösteri Süresi (Dakika)", "type": "number" },
        { "key": "team_size", "label": "Ekip Kişi Sayısı", "type": "number" },
        { "key": "requirements", "label": "Mekan Gereksinimleri", "type": "multiselect", "options": ["Sahne", "Ses Sistemi", "Kulis", "Yüksek Tavan"] }
    ]
};

async function updateSchemas() {
    console.log('Fetching categories...');
    const { data: categories, error: fetchError } = await supabase.from('categories').select('id, name');

    if (fetchError) {
        console.error('Error fetching categories:', fetchError);
        return;
    }

    console.log(`Found ${categories.length} categories.`);

    for (const category of categories) {
        const schema = schemas[category.name];
        if (schema) {
            console.log(`Updating schema for: ${category.name} (ID: ${category.id})`);
            const { error: updateError } = await supabase
                .from('categories')
                .update({ form_schema: schema })
                .eq('id', category.id);

            if (updateError) {
                console.error(`Error updating ${category.name}:`, updateError);
            } else {
                console.log(`Success: ${category.name}`);
            }
        } else {
            console.log(`No schema defined for: ${category.name}`);
        }
    }

    console.log('All updates finished.');
}

updateSchemas();
