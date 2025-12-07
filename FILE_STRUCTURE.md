# KolayDugun Pazaryeri - Tüm Dosyalar ve Açıklamalar

## 📁 Proje Yapısı

```
kolaydugun/
├── src/
│   ├── pages/
│   │   ├── LeadForm.jsx                    # Çift lead formu
│   │   ├── LeadForm.css
│   │   ├── VendorDashboardOverview.jsx     # Vendor ana dashboard
│   │   ├── VendorDashboardOverview.css
│   │   ├── VendorLeads.jsx                 # Lead yönetimi
│   │   ├── VendorLeads.css
│   │   ├── VendorListings.jsx              # İlan yönetimi
│   │   ├── VendorListings.css
│   │   ├── VendorWallet.jsx                # Kredi yükleme
│   │   ├── VendorWallet.css
│   │   ├── VendorPlan.jsx                  # Plan yönetimi
│   │   ├── VendorPlan.css
│   │   ├── AdminCreditApproval.jsx         # Admin kredi onay
│   │   └── AdminCreditApproval.css
│   ├── components/
│   │   └── Hero.jsx                        # Ana sayfa hero (güncellendi)
│   ├── App.jsx                             # Route'lar (güncellendi)
│   └── main.jsx                            # PayPal provider (güncellendi)
│
├── supabase/
│   ├── marketplace_migration.sql           # Faz 1: Temel yapı
│   ├── phase2_migration.sql                # Faz 2: PayPal RPC'ler
│   ├── manual_payment_migration.sql        # Manuel ödeme sistemi
│   ├── test_data.sql                       # Test verisi
│   └── MIGRATION_GUIDE.md                  # Migration rehberi
│
├── QUICK_START.md                          # Hızlı başlangıç (5 dk)
├── USER_MANUAL.md                          # Kullanım kılavuzu
├── MARKETPLACE_README.md                   # Genel bakış
├── DEPLOYMENT.md                           # Production deployment
├── .env.example                            # Environment variables
└── package.json                            # Dependencies (güncellendi)
```

---

## 📄 Dosya Açıklamaları

### Frontend Sayfaları

#### 1. LeadForm.jsx
**Amaç:** Çiftlerin ücretsiz teklif talebi göndermesi  
**Özellikler:**
- Kategori, şehir, tarih seçimi
- Bütçe aralığı
- İletişim bilgileri
- Supabase'e kayıt

**Route:** `/lead-form`

#### 2. VendorDashboardOverview.jsx
**Amaç:** Vendor'ın ana dashboard'u  
**Özellikler:**
- Plan tipi gösterimi (Free/Pro)
- Kredi bakiyesi
- Lead istatistikleri
- Hızlı aksiyonlar

**Route:** `/vendor/overview`

#### 3. VendorLeads.jsx
**Amaç:** Lead görüntüleme ve açma  
**Özellikler:**
- Eşleştirilen lead'ler listesi
- Bulanık iletişim bilgileri
- Lead açma (kredi kontrolü)
- Yetersiz kredi uyarısı

**Route:** `/vendor/leads`

#### 4. VendorListings.jsx
**Amaç:** İlan yönetimi ve öne çıkarma  
**Özellikler:**
- Tüm ilanları listeleme
- Featured badge gösterimi
- 7/30 gün öne çıkarma
- Kredi kontrolü

**Route:** `/vendor/listings`

#### 5. VendorWallet.jsx
**Amaç:** Kredi yükleme ve bakiye yönetimi  
**Özellikler:**
- Kredi bakiyesi gösterimi
- Manuel/API toggle
- Kredi paketleri (10€, 25€, 50€)
- PayPal Buttons
- Transaction geçmişi
- Pending requests

**Route:** `/vendor/wallet`

#### 6. VendorPlan.jsx
**Amaç:** Plan yönetimi (Free/Pro)  
**Özellikler:**
- Mevcut plan gösterimi
- Free vs Pro karşılaştırması
- PayPal Subscription Buttons
- Plan özellikleri listesi
- SSS

**Route:** `/vendor/plan`

#### 7. AdminCreditApproval.jsx
**Amaç:** Manuel kredi taleplerini onaylama  
**Özellikler:**
- Pending/Approved/Rejected filtreler
- Talep detayları
- Onay/Red butonları
- Admin notları

**Route:** `/admin/credit-approval`

---

### Backend (Supabase)

#### 1. marketplace_migration.sql (Faz 1)
**İçerik:**
- 6 yeni tablo:
  - `vendor_profiles` - Vendor bilgileri
  - `leads` - Çift talepleri
  - `vendor_leads` - Eşleştirmeler
  - `transactions` - Tüm işlemler
  - `featured_listings` - Öne çıkarılmış ilanlar
  - `marketplace_config` - Sistem ayarları
- `match_vendors_to_lead` trigger
- RLS policies
- `unlock_lead_phase1` RPC (kredi kontrolsüz)
- `feature_listing_phase1` RPC (kredi kontrolsüz)

#### 2. phase2_migration.sql (Faz 2)
**İçerik:**
- `add_credits()` - Kredi ekleme
- `unlock_lead()` - Kredi kontrolü ile lead açma
- `feature_listing()` - Kredi kontrolü ile öne çıkarma
- `activate_pro_plan()` - Pro plan aktivasyonu
- `cancel_pro_plan()` - Pro plan iptali

#### 3. manual_payment_migration.sql
**İçerik:**
- `credit_requests` tablosu
- `approve_credit_request()` RPC
- `reject_credit_request()` RPC
- PayPal e-posta config

#### 4. test_data.sql
**İçerik:**
- Örnek vendor profiles
- Örnek leads
- Örnek credit requests
- Config değerleri

---

### Dokümantasyon

#### 1. QUICK_START.md
**Hedef Kitle:** Yeni başlayanlar  
**İçerik:**
- Adım adım kurulum (5 dakika)
- Migration çalıştırma
- PayPal e-posta ekleme
- İlk test

#### 2. USER_MANUAL.md
**Hedef Kitle:** Çift, Vendor, Admin  
**İçerik:**
- Çiftler için: Lead gönderme
- Vendor'lar için: Tüm özellikler
- Admin'ler için: Yönetim paneli
- SSS

#### 3. MARKETPLACE_README.md
**Hedef Kitle:** Geliştiriciler  
**İçerik:**
- Genel bakış
- Özellikler listesi
- Proje yapısı
- Teknolojiler
- Gelir modelleri

#### 4. DEPLOYMENT.md
**Hedef Kitle:** DevOps/Admin  
**İçerik:**
- Production deployment
- Vercel/Netlify/VPS
- Güvenlik kontrol listesi
- Monitoring
- Troubleshooting

#### 5. MIGRATION_GUIDE.md
**Hedef Kitle:** Backend geliştiriciler  
**İçerik:**
- Detaylı migration talimatları
- Hata çözümleri
- Kontrol adımları

---

## 🔑 Önemli Değişiklikler

### Güncellenen Dosyalar

#### App.jsx
**Değişiklik:** 7 yeni route eklendi
```javascript
/lead-form
/vendor/overview
/vendor/leads
/vendor/listings
/vendor/wallet
/vendor/plan
/admin/credit-approval
```

#### main.jsx
**Değişiklik:** PayPalScriptProvider eklendi
```javascript
<PayPalScriptProvider options={paypalOptions}>
  <App />
</PayPalScriptProvider>
```

#### Hero.jsx
**Değişiklik:** "Ücretsiz Teklif Al" butonu eklendi
```javascript
<button onClick={() => navigate('/lead-form')}>
  📬 Ücretsiz Teklif Al
</button>
```

#### package.json
**Değişiklik:** PayPal SDK eklendi
```json
"@paypal/react-paypal-js": "^latest"
```

---

## 📊 Veritabanı İlişkileri

```
auth.users (Supabase Auth)
    ↓
profiles (role: couple/vendor/admin)
    ↓
vendor_profiles (plan, credits)
    ↓
    ├── vendor_leads ← leads (otomatik eşleştirme)
    ├── transactions (kredi hareketleri)
    ├── featured_listings ← listings
    └── credit_requests (manuel ödeme)
```

---

## 🎯 Kullanım Akışları

### 1. Lead Gönderme (Çift)
```
Çift → LeadForm → Supabase (leads)
                      ↓
                  Trigger (match_vendors_to_lead)
                      ↓
                  vendor_leads (eşleştirmeler)
```

### 2. Lead Açma (Vendor)
```
Vendor → VendorLeads → unlock_lead RPC
                            ↓
                    Kredi kontrolü
                            ↓
                    ✅ Yeterli → Lead açılır, kredi düşer
                    ❌ Yetersiz → Hata, wallet'a yönlendir
```

### 3. Kredi Yükleme (Manuel)
```
Vendor → VendorWallet → Manuel transfer
                            ↓
                    PayPal'a transfer
                            ↓
                    credit_requests (pending)
                            ↓
Admin → AdminCreditApproval → Onayla
                            ↓
                    approve_credit_request RPC
                            ↓
                    Kredi eklenir, transaction kaydedilir
```

### 4. Featured Listing
```
Vendor → VendorListings → Öne Çıkar
                            ↓
                    feature_listing RPC
                            ↓
                    Kredi kontrolü
                            ↓
                    featured_listings + transaction
```

---

## 🔐 Güvenlik Katmanları

1. **Authentication:** Supabase Auth
2. **Authorization:** RLS Policies
3. **Role-Based:** profiles.role (couple/vendor/admin)
4. **RPC Security:** SECURITY DEFINER
5. **PayPal:** Webhook signature verification (Faz 2)

---

## 📈 Metrikler ve KPI'lar

### Vendor Metrikleri
- Toplam lead sayısı
- Açılan lead sayısı
- Conversion rate
- Kredi harcaması
- Featured listing kullanımı

### Platform Metrikleri
- Toplam lead sayısı
- Vendor sayısı (Free/Pro)
- Toplam gelir
- Ortalama lead fiyatı
- Featured listing geliri

---

## 🚀 Sonraki Adımlar

1. ✅ Migration'ları çalıştır
2. ✅ PayPal e-posta ekle
3. ✅ Test et
4. ✅ Production'a deploy et
5. 📧 E-posta bildirimleri ekle (Faz 3)
6. 📊 Gelişmiş analitikler (Faz 3)
7. 📱 Mobile app (Faz 4)

---

**Tüm dosyalar hazır ve kullanıma hazır!** 🎉
