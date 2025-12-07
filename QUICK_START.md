# KolayDugun Pazaryeri - Hızlı Başlangıç Rehberi

## 🚀 Adım 1: Supabase Migration'ları Çalıştırın (5 dakika)

### 1.1 Supabase Dashboard'a Giriş
1. https://app.supabase.com adresine gidin
2. Projenizi seçin (KolayDugun)

### 1.2 Faz 1 Migration (Temel Yapı)
1. Sol menüden **SQL Editor** tıklayın
2. **New Query** butonuna tıklayın
3. VSCode'da `supabase/marketplace_migration.sql` dosyasını açın
4. **Tüm içeriği** kopyalayın (Ctrl+A, Ctrl+C)
5. Supabase SQL Editor'a yapıştırın (Ctrl+V)
6. **Run** butonuna tıklayın (veya Ctrl+Enter)
7. ✅ "Success" mesajını bekleyin

### 1.3 Faz 2 Migration (PayPal Entegrasyonu)
1. Yeni bir query açın
2. VSCode'da `supabase/phase2_migration.sql` dosyasını açın
3. Tüm içeriği kopyalayın
4. Supabase SQL Editor'a yapıştırın
5. **Run** tıklayın
6. ✅ "Success" mesajını bekleyin

### 1.4 Manuel PayPal Migration
1. Yeni bir query açın
2. VSCode'da `supabase/manual_payment_migration.sql` dosyasını açın
3. Tüm içeriği kopyalayın
4. Supabase SQL Editor'a yapıştırın
5. **Run** tıklayın
6. ✅ "Success" mesajını bekleyin

### 1.5 Kontrol
1. Sol menüden **Table Editor** tıklayın
2. Şu tabloların oluştuğunu kontrol edin:
   - ✅ `vendor_profiles`
   - ✅ `leads`
   - ✅ `vendor_leads`
   - ✅ `transactions`
   - ✅ `featured_listings`
   - ✅ `marketplace_config`
   - ✅ `credit_requests`

---

## 📧 Adım 2: PayPal E-posta Adresinizi Ekleyin (2 dakika)

### 2.1 SQL Editor'da Config Güncelleme
1. Supabase SQL Editor'da yeni query açın
2. Şu SQL'i çalıştırın (e-postayı kendi adresinizle değiştirin):

```sql
UPDATE marketplace_config
SET value = '"your-paypal@email.com"'
WHERE key = 'paypal_email';
```

3. **Run** tıklayın
4. ✅ "Success. 1 rows affected" göreceksiniz

### 2.2 Kontrol
```sql
SELECT * FROM marketplace_config WHERE key = 'paypal_email';
```

---

## 🎯 Adım 3: İlk Testi Yapın (5 dakika)

### 3.1 Lead Formu Testi
1. Tarayıcıda `http://localhost:5173` açın
2. Ana sayfada **"📬 Ücretsiz Teklif Al"** butonuna tıklayın
3. Formu doldurun:
   - Kategori seçin
   - Şehir seçin
   - Tarih girin
   - İletişim bilgilerini girin
4. **Gönder** tıklayın
5. ✅ "Lead başarıyla gönderildi" mesajını görmelisiniz

### 3.2 Supabase'de Kontrol
1. Supabase → Table Editor → `leads` tablosuna gidin
2. ✅ Yeni lead kaydını görmelisiniz
3. `vendor_leads` tablosuna gidin
4. ✅ Otomatik eşleştirmeleri görmelisiniz (trigger çalıştı)

### 3.3 Vendor Dashboard Testi
1. Vendor hesabıyla giriş yapın
2. `/vendor/overview` adresine gidin
3. ✅ Dashboard açılmalı
4. `/vendor/leads` adresine gidin
5. ✅ Eşleştirilen lead'leri görmelisiniz

---

## 💳 Adım 4: Manuel Kredi Sistemi Testi (10 dakika)

### 4.1 Kredi Talebi Oluşturma (Vendor)
1. Vendor hesabıyla `/vendor/wallet` sayfasına gidin
2. **"Manuel Transfer"** modunda olduğundan emin olun
3. Bir kredi paketi seçin (örn: 10€ - 12 kredi)
4. **"Manuel Transfer ile Al"** butonuna tıklayın
5. PayPal e-posta adresinizi görün
6. Form doldurun:
   - PayPal e-postanız (opsiyonel)
   - Ödeme referansı: "TEST123" (test için)
7. **"Talep Gönder"** tıklayın
8. ✅ "Kredi talebi gönderildi" mesajını görün

### 4.2 Kredi Onaylama (Admin)
1. Admin hesabıyla giriş yapın
2. `/admin/credit-approval` adresine gidin
3. ✅ Bekleyen talebi görmelisiniz
4. **"✅ Onayla"** butonuna tıklayın
5. Not ekleyin (opsiyonel): "Test onayı"
6. ✅ "Kredi talebi onaylandı" mesajını görün

### 4.3 Kredi Kontrolü (Vendor)
1. Vendor hesabına geri dönün
2. `/vendor/wallet` sayfasını yenileyin
3. ✅ Kredi bakiyesi artmış olmalı (12 kredi)
4. ✅ "Kredi Talepleriniz" bölümünde onaylanmış talep görünmeli
5. ✅ "İşlem Geçmişi"nde kredi yükleme kaydı olmalı

---

## 🔓 Adım 5: Lead Unlock Testi (5 dakika)

### 5.1 Lead Açma
1. Vendor hesabıyla `/vendor/leads` sayfasına gidin
2. Bir lead seçin
3. **"Lead'i Aç"** butonuna tıklayın
4. ✅ Kredi kontrolü yapılır
5. ✅ "Lead başarıyla açıldı! X kredi harcandı" mesajını görün
6. ✅ İletişim bilgileri artık görünür olmalı

### 5.2 Yetersiz Kredi Testi
1. Tüm kredinizi bitirin (birkaç lead açın)
2. Başka bir lead açmaya çalışın
3. ✅ "Yetersiz kredi" uyarısı görmelisiniz
4. ✅ "Kredi yüklemek ister misiniz?" sorusu gelir
5. **Evet** derseniz `/vendor/wallet` sayfasına yönlendirilirsiniz

---

## ⭐ Adım 6: Featured Listing Testi (5 dakika)

### 6.1 İlan Öne Çıkarma
1. Vendor hesabıyla `/vendor/listings` sayfasına gidin
2. Bir ilan seçin
3. **"⭐ 7 Gün Öne Çıkar"** butonuna tıklayın
4. ✅ Kredi kontrolü yapılır
5. ✅ "İlan öne çıkarıldı! X kredi harcandı" mesajını görün
6. ✅ İlan artık "Öne Çıkarılmış" badge'i ile görünür

---

## 🎉 Tamamlandı!

Pazaryeri sisteminiz artık çalışıyor! 

### Sıradaki Adımlar:

**Şimdi:**
- ✅ Gerçek vendor hesapları oluşturun
- ✅ Manuel PayPal transferlerini kabul edin
- ✅ Sistemi kullanmaya başlayın

**İleride (Opsiyonel):**
- 🔄 PayPal API'ye geçiş yapın (otomatik kredi yükleme)
- 📧 E-posta bildirimleri ekleyin
- 📊 Gelişmiş analitikler ekleyin
- 🎨 Admin dashboard'u genişletin

---

## ⚠️ Sorun Giderme

### "relation does not exist" hatası
**Çözüm:** Migration'ları tekrar çalıştırın, tüm SQL'i kopyaladığınızdan emin olun.

### Lead eşleştirme çalışmıyor
**Çözüm:** `listings` tablosunda uygun ilanların olduğundan emin olun (aynı kategori ve şehir).

### Admin panele erişemiyorum
**Çözüm:** `profiles` tablosunda kullanıcınızın `role` alanını `'admin'` yapın:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### PayPal e-posta görünmüyor
**Çözüm:** Adım 2'yi tekrar yapın, config'i güncelleyin.

---

**Yardım mı gerekiyor?** Herhangi bir adımda takılırsanız bana sorun! 😊
