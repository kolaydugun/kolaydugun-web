# KolayDugun Pazaryeri Sistemi

## 🎯 Genel Bakış

KolayDugun platformuna entegre edilmiş, self-servis pazaryeri ve gelir modeli sistemi. Çiftlerin ücretsiz teklif almasını, vendor'ların lead satın almasını ve platform geliri elde etmesini sağlar.

---

## ✨ Özellikler

### Çiftler İçin
- ✅ Ücretsiz teklif formu
- ✅ Otomatik vendor eşleştirme
- ✅ Kategori ve şehir bazlı arama
- ✅ Bütçe filtreleme

### Vendor'lar İçin
- ✅ Lead yönetimi (kredi ile açma)
- ✅ Kredi sistemi (manuel + API)
- ✅ Featured listing (öne çıkarma)
- ✅ Free/Pro plan seçenekleri
- ✅ Dashboard ve istatistikler

### Admin'ler İçin
- ✅ Kredi onay paneli
- ✅ Transaction yönetimi
- ✅ Vendor yönetimi
- ✅ Marketplace konfigürasyonu

---

## 🚀 Hızlı Başlangıç

### 1. Migration'ları Çalıştırın
```bash
# Supabase Dashboard → SQL Editor'da sırayla çalıştırın:
1. supabase/marketplace_migration.sql
2. supabase/phase2_migration.sql
3. supabase/manual_payment_migration.sql
```

### 2. PayPal E-posta Ekleyin
```sql
UPDATE marketplace_config
SET value = '"your-paypal@email.com"'
WHERE key = 'paypal_email';
```

### 3. Test Edin
```bash
npm run dev
# http://localhost:5173
```

**Detaylı kurulum:** [`QUICK_START.md`](./QUICK_START.md)

---

## 📚 Dokümantasyon

- **[Hızlı Başlangıç](./QUICK_START.md)** - Adım adım kurulum rehberi
- **[Kullanım Kılavuzu](./USER_MANUAL.md)** - Çift, vendor ve admin kullanımı
- **[Migration Rehberi](./supabase/MIGRATION_GUIDE.md)** - Detaylı migration talimatları
- **[Walkthrough](./walkthrough.md)** - Teknik implementasyon detayları
- **[Implementation Plan](./implementation_plan.md)** - Faz 2 planı

---

## 🗂️ Proje Yapısı

```
src/
├── pages/
│   ├── LeadForm.jsx              # Çift lead formu
│   ├── VendorDashboardOverview.jsx  # Vendor ana dashboard
│   ├── VendorLeads.jsx           # Lead yönetimi
│   ├── VendorListings.jsx        # İlan yönetimi + featured
│   ├── VendorWallet.jsx          # Kredi yükleme
│   ├── VendorPlan.jsx            # Free/Pro plan
│   └── AdminCreditApproval.jsx   # Admin kredi onay
│
supabase/
├── marketplace_migration.sql     # Faz 1: Temel yapı
├── phase2_migration.sql          # Faz 2: PayPal RPC'ler
├── manual_payment_migration.sql  # Manuel ödeme sistemi
├── test_data.sql                 # Test verisi
└── MIGRATION_GUIDE.md            # Migration rehberi
```

---

## 💳 Gelir Modelleri

### 1. Pay-Per-Lead (Kredi Sistemi)
- Vendor'lar kredi satın alır
- Lead açmak için kredi harcar
- Fiyat: ~5-10 kredi/lead (kategoriye göre)

### 2. Pro Membership
- Free Plan: Temel özellikler
- Pro Plan: 29.99€/ay
  - Sınırsız ilan
  - İletişim bilgileri gösterimi
  - Üst sıralarda görünme

### 3. Featured Listings
- 7 gün: 14 kredi
- 30 gün: 60 kredi
- Arama sonuçlarında üstte görünme

---

## 🔧 Teknolojiler

- **Frontend:** React, React Router
- **Backend:** Supabase (PostgreSQL + Auth)
- **Ödeme:** PayPal (API + Manuel)
- **Styling:** Vanilla CSS

---

## 📊 Veritabanı Şeması

### Yeni Tablolar
- `vendor_profiles` - Vendor bilgileri ve kredi
- `leads` - Çift talepleri
- `vendor_leads` - Lead eşleştirmeleri
- `transactions` - Tüm finansal işlemler
- `featured_listings` - Öne çıkarılmış ilanlar
- `marketplace_config` - Sistem ayarları
- `credit_requests` - Manuel ödeme talepleri

### RPC Fonksiyonlar
- `add_credits()` - Kredi ekleme
- `unlock_lead()` - Lead açma (kredi kontrolü)
- `feature_listing()` - İlan öne çıkarma
- `activate_pro_plan()` - Pro plan aktivasyonu
- `approve_credit_request()` - Manuel ödeme onayı

---

## 🔐 Güvenlik

- ✅ Row Level Security (RLS) tüm tablolarda aktif
- ✅ Role-based access control (couple/vendor/admin)
- ✅ Kredi işlemleri SECURITY DEFINER ile korunuyor
- ✅ PayPal webhook doğrulaması (Faz 2)

---

## 🎯 Kullanım Akışları

### Çift → Lead Gönderme
1. Lead formu doldurur
2. Sistem otomatik vendor eşleştirir
3. Vendor'lar lead'i görür (bulanık)

### Vendor → Lead Açma
1. Dashboard'da lead'leri görür
2. "Lead'i Aç" tıklar
3. Kredi kontrolü yapılır
4. İletişim bilgileri açılır

### Vendor → Kredi Yükleme (Manuel)
1. Kredi paketi seçer
2. PayPal'a transfer yapar
3. Talep gönderir
4. Admin onaylar
5. Kredi eklenir

### Admin → Kredi Onaylama
1. Pending talepleri görür
2. PayPal'da ödemeyi kontrol eder
3. Onayla/Reddet
4. Kredi otomatik eklenir

---

## 📈 Gelecek Geliştirmeler (Faz 3)

- [ ] E-posta bildirimleri
- [ ] SMS bildirimleri
- [ ] Gelişmiş analitikler
- [ ] Vendor performans metrikleri
- [ ] Lead kalite skorlaması
- [ ] Otomatik lead dağıtımı
- [ ] Multi-currency desteği
- [ ] Mobile app

---

## 🐛 Sorun Giderme

### Migration Hataları
```sql
-- Tabloları kontrol et
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%vendor%' OR table_name LIKE '%lead%';
```

### Admin Rolü Verme
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### Kredi Manuel Ekleme
```sql
UPDATE vendor_profiles 
SET credit_balance = credit_balance + 50 
WHERE user_id = 'USER_ID';
```

---

## 📞 Destek

Sorun mu yaşıyorsunuz? 

1. [`QUICK_START.md`](./QUICK_START.md) - Kurulum sorunları
2. [`USER_MANUAL.md`](./USER_MANUAL.md) - Kullanım soruları
3. GitHub Issues - Bug raporları

---

## 📝 Lisans

Proprietary - KolayDugun

---

## 🙏 Teşekkürler

Bu pazaryeri sistemi, tek kişilik bir ekip tarafından yönetilebilecek şekilde tasarlanmıştır. Self-servis yapısı sayesinde minimal manuel işlem gerektirir.

**Başarılar!** 🎉
