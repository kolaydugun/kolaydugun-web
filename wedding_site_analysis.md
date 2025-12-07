# Düğün Planlama Sitesi Analizi: KolayDugun.de

Bu belge, **KolayDugun.de** platformunun mevcut kod yapısı, işlevselliği, kullanıcı akışları ve pazar konumu üzerinden yapılan derinlemesine analizi içerir. Tanıtım videoları, sosyal medya içerikleri ve sistem geliştirmeleri için referans olarak hazırlanmıştır.

---

## 🟦 1. Sitenin Amacı ve Genel Tanımı

| Başlık | Analiz ve Tespitler |
| :--- | :--- |
| **Temel Amaç** | Almanya başta olmak üzere Avrupa'daki çiftlerin (özellikle Türk toplumu) düğün planlama süreçlerini dijitalleştirmek, karmaşayı azaltmak ve güvenilir tedarikçilerle buluşmalarını sağlamak. |
| **Çözülen Sorun** | Geleneksel düğün planlamanın karmaşıklığı, dil bariyerleri ve dağınık tedarikçi bilgilerini tek bir çatı altında, çok dilli (TR/EN/DE) ve organize bir yapıda toplamak. |
| **Değer Önerisi** | "Avrupa'da Düğün Planlamanın En Kolay Yolu." Hem kültürel ihtiyaçları (Türk düğünü gelenekleri) hem de modern dijital araçları (bütçe, LCV takibi) birleştiren hibrit bir çözüm. |

---

## 🟦 2. Kullanıcı Tipleri ve Kullanıcı Akışı

Platformda iki temel kullanıcı tipi ve bir yönetici rolü bulunmaktadır.

### 👤 Çiftler (Couples)
*   **Kayıt:** E-posta veya Google ile kayıt. İsim ve şifre yeterli.
*   **Onboarding:** Kayıt sonrası doğrudan "Araçlar" (Tools) paneline veya Anasayfaya yönlendiriliyorlar.
*   **Akış:** Araçları kullanır -> Tedarikçi arar -> Favoriler -> Mesajlaşır/Teklif Alır.

### 🏢 Tedarikçiler (Vendors)
*   **Kayıt:** İşletme adı, Kategori (Mekan, Fotoğrafçı vb.) ve Şehir seçimi ile kayıt.
*   **Paket Seçimi:** Kayıt sırasında "Premium" veya "Free" paket seçimi yapılıyor (Beta sürecinde ücretsiz teşvik var).
*   **Profil Yönetimi:** Hizmet detayları, galeri, fiyatlandırma ve iletişim bilgilerini yönetirler.

---

## 🟦 3. Çift Paneli Özellikleri

Çiftlerin düğünlerini adım adım planlamaları için sunulan araçlar:

1.  **💌 Düğün Web Sitesi (Wedding Website):** Çiftlerin misafirlerine özel, şifreli veya açık bilgilendirme sitesi kurmasını sağlar.
2.  **📋 Ajanda & Görev Listesi (Timeline):** Düğüne kalan süreye göre otomatik görev önerileri.
3.  **💰 Bütçe Planlayıcı (Budget):** Tahmini ve gerçekleşen harcamaların takibi.
4.  **🌤️ Hava Durumu (Weather):** Düğün tarihi ve şehri için hava durumu tahmini.
5.  **🪑 Masa Düzeni (Seating Chart):** Misafirlerin oturma düzenini görsel olarak planlama (Sürükle-Bırak).
6.  **👥 Misafir Listesi:** LCV takibi ve kişi sayısı yönetimi.

**Kritik Özellikler:**
*   Çok dilli arayüz (Tüm araçlar TR/DE/EN).
*   Tedarikçilerle doğrudan mesajlaşma (Admin/Çift/Tedarikçi entegre mesaj kutusu).

---

## 🟦 4. Tedarikçi Kategorileri ve Profil Yapısı

**Kategoriler:** `Düğün Mekanları`, `Düğün Fotoğrafçıları`, `Müzik ve Eğlence`, `Gelinlik & Moda`, `Saç & Makyaj` ve diğer temel düğün hizmetleri.

**Profil Verileri:**
*   **Genel:** İşletme adı, açıklama, profil fotoğrafı, kapak fotoğrafı.
*   **Detaylar:** Başlangıç fiyatları, kapasite bilgisi (mekanlar için), hizmet verdiği bölgeler.
*   **Medya:** Fotoğraf galerisi.
*   **İletişim:** Telefon, Adres (Harita entegrasyonu), Sosyal Medya Linkleri (Premium).

---

## 🟦 5. Kredi Sistemi ve Gelir Modeli

Platform **Freemium** abonelik modelini benimsemiştir.

*   **Free Plan:** Sınırlı özellikler, listeleme.
*   **Premium Plan (Aylık/Yıllık):**
    *   Onaylı Rozeti (Verified Badge).
    *   Üst sıralarda gösterim.
    *   Sosyal medya linkleri ve Harita görünümü.
    *   **Aylık Hediye Kredi:** Müşterilerle mesajlaşmak veya teklif vermek için kullanılır (Örn: Ayda 12 kredi).
    *   **Kredi Sistemi:** Tedarikçiler çiftlere ulaşmak ("Lead" satın almak veya mesaj atmak) için kredi harcar. Premium üyeler her ay yenilenen krediye sahiptir.

---

## 🟦 6. Blog ve İçerik Yapısı

*   **İçerik:** Düğün trendleri, rehberler, ipuçları ("Gelinlik Seçimi", "Düğün Bütçesi Nasıl Yapılır").
*   **Dil:** İçerikler TR, EN ve DE dillerinde (Yapay zeka veya manuel çeviri ile) sunulur.
*   **Strateji:** SEO (Arama Motoru Optimizasyonu) trafiğini çekmek ve platforma potansiyel çiftleri organik olarak getirmek. Blog yazıları içinden ilgili tedarikçilere veya araçlara "Linkle" özelliği ile yönlendirme yapılır.

---

## 🟦 7. Marka Kimliği ve Görsel Stil

*   **Renk Paleti:**
    *   Birincil: **Mercan Pembesi** (`#FF6B9D`) - Romantizm ve sıcaklık.
    *   İkincil: **Zümrüt Yeşili** (`#10B981`) - Güven ve doğallık.
    *   Vurgu: **Kehribar/Altın** (`#F59E0B`) - Premium hissi, lüks.
    *   Arkaplan: Açık Krem/Beyaz (`#FFF9F5`) - Temiz ve ferah.
*   **Fontlar:**
    *   Başlıklar: `Playfair Display` (Serif, şık, geleneksel).
    *   Gövde: `Inter` (Sans-serif, modern, okunabilir).
*   **Ton:** Modern, samimi, yardımsever ve profesyonel.

---

## 🟦 8. Hedef Kitle ve Pazar Konumu

*   **Profil:** Almanya, Avusturya, İsviçre veya Türkiye'de yaşayan; evlilik hazırlığındaki çiftler. Özellikle Türk kökenli Avrupa vatandaşları (Gurbetçiler) ana niş pazar olabilir.
*   **Yaş:** 24-35 yaş aralığı.
*   **Rakipler:**
    *   *Global:* TheKnot, WeddingWire.
    *   *Yerel (DE):* Hochzeitsplaza, WeddyPlace.
    *   *Yerel (TR):* Düğün.com.

---

## 🟦 9. Tanıtım Videosu ve İçerik Hedefleri

Tanıtım materyalleri şu üç sütun üzerine kurulmalıdır:

1.  **Duygusal Bağ (Hero Video):** "Hayalindeki düğün, parmaklarının ucunda." (Anasayfa için sinematik kurgu).
2.  **Fonksiyonel Fayda (Süreç Videoları):** "Masa düzenini 5 dakikada nasıl yaparsın?", "Bütçeni nasıl yönetirsin?" (Reels/TikTok odaklı).
3.  **Güven (Tedarikçi Hikayeleri):** Başarılı tedarikçilerin referansları.

---

## 🟧 Gelecek İçin Öneri Analizi

Mevcut yapı sağlam bir temele sahip ancak viral büyüme ve kullanıcı bağlılığı için eklenebilecek özellikler:

### 🚀 Kısa Vadeli (Hemen Uygulanabilir)
1.  **AI Düğün Asistanı (Chatbot):** Çiftlerin sorularını anlık cevaplayan (bütçe önerisi, mekan önerisi) basit bir AI asistan. *Fayda: Etkileşim artışı.*
2.  **Hazır Şablonlar:** LCV metinleri, davetiye sözleri için hazır kütüphane. *Fayda: İçerik zenginliği.*

### 🌟 Orta Vadeli (Büyüme Odaklı)
1.  **Topluluk / Forum:** Gelinlerin birbirine soru sorabileceği "Gelinler Soruyor" bölümü. *Fayda: SEO ve Kullanıcıda geri dönüş (Retention).*
2.  **Sanal Tur (360°):** Mekan profillerine 360 derece fotoğraf veya video turu ekleme. *Fayda: Premium tedarikçi satışı.*

### 💎 Uzun Vadeli (Vizyoner)
1.  **Pazaryeri Ödeme Sistemi:** Çiftlerin doğrudan site üzerinden tedarikçiye ödeme yapması ve komisyon/güvence sistemi. *Fayda: Yeni gelir modeli.*
2.  **Mobil Uygulama:** LCV bildirimleri ve anlık mesajlaşma için native iOS/Android uygulama.

---
*Hazırlayan: Antigravity AI Agent*
