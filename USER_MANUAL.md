# KolayDugun Pazaryeri - Kullanım Kılavuzu

## 👥 Çiftler İçin (Lead Gönderme)

### Lead Nasıl Gönderilir?

1. **Ana Sayfaya Gidin**
   - https://kolaydugun.de

2. **"Ücretsiz Teklif Al" Butonuna Tıklayın**
   - Ana sayfada büyük bir buton göreceksiniz

3. **Formu Doldurun**
   - **Kategori:** Ne tür hizmet arıyorsunuz? (Mekan, Fotoğrafçı, vb.)
   - **Şehir:** Düğününüz nerede?
   - **Tarih:** Düğün tarihiniz
   - **Misafir Sayısı:** Kaç kişi gelecek?
   - **Bütçe:** Min-Max bütçe aralığı
   - **İletişim Bilgileri:** Adınız, e-posta, telefon
   - **Notlar:** Özel istekleriniz

4. **Gönder**
   - Form gönderildikten sonra, uygun vendor'lar otomatik eşleştirilir
   - Vendor'lar sizinle iletişime geçecek

### Ne Kadar Sürer?
- Lead gönderimi anında
- Vendor'lar genelde 24-48 saat içinde cevap verir

### Ücretsiz mi?
- ✅ Evet, çiftler için tamamen ücretsiz!

---

## 🏪 Vendor'lar İçin

### 1. Dashboard'a Giriş

**Adres:** `/vendor/overview`

**Ne Görürsünüz:**
- Mevcut planınız (Free/Pro)
- Kredi bakiyeniz
- Lead istatistikleriniz
- Öne çıkarılmış ilan sayınız
- Hızlı aksiyonlar

### 2. Lead'leri Görüntüleme

**Adres:** `/vendor/leads`

**Nasıl Çalışır:**
1. Size eşleştirilen lead'ler listelenir
2. İletişim bilgileri **bulanık** görünür
3. Lead'i açmak için kredi gerekir

**Lead Açma:**
1. **"Lead'i Aç"** butonuna tıklayın
2. Kredi kontrolü yapılır
3. Yeterli kredi varsa:
   - İletişim bilgileri açılır
   - Kredi düşer
   - Transaction kaydedilir
4. Yetersiz kredi varsa:
   - Uyarı alırsınız
   - Kredi yükleme sayfasına yönlendirilirsiniz

**Lead Bilgileri:**
- ✅ İsim, e-posta, telefon
- ✅ Düğün tarihi
- ✅ Misafir sayısı
- ✅ Bütçe aralığı
- ✅ Özel notlar

### 3. Kredi Yükleme

**Adres:** `/vendor/wallet`

**İki Yöntem:**

#### A) Manuel Transfer (Varsayılan)
1. Kredi paketi seçin (10€, 25€, 50€)
2. **"Manuel Transfer ile Al"** tıklayın
3. PayPal e-posta adresini görün
4. PayPal'dan transfer yapın
5. Formu doldurun:
   - PayPal e-postanız
   - Transaction ID/Referans
6. **"Talep Gönder"** tıklayın
7. Admin onayını bekleyin (genelde 24 saat)
8. ✅ Kredi hesabınıza eklenir

#### B) Otomatik (PayPal API) - İleride
1. Kredi paketi seçin
2. PayPal butonu görünür
3. PayPal ile öde
4. ✅ Kredi anında eklenir

**Kredi Paketleri:**
- 10€ = 12 kredi (+2 bonus)
- 25€ = 32 kredi (+7 bonus)
- 50€ = 70 kredi (+20 bonus)

**Kredi Kullanımı:**
- Lead açma: ~5 kredi (kategoriye göre değişir)
- 7 gün featured: ~14 kredi
- 30 gün featured: ~60 kredi

### 4. İlan Yönetimi

**Adres:** `/vendor/listings`

**İlanlarınızı Görün:**
- Tüm aktif ilanlarınız
- Öne çıkarılmış ilanlar badge ile gösterilir

**İlan Öne Çıkarma:**
1. İlan seçin
2. **"⭐ 7 Gün Öne Çıkar"** veya **"⭐ 30 Gün Öne Çıkar"** tıklayın
3. Kredi kontrolü yapılır
4. ✅ İlan öne çıkarılır
5. Arama sonuçlarında üstte görünür

**Öne Çıkarma Avantajları:**
- 🔝 Arama sonuçlarında üst sıralarda
- ⭐ Özel badge ile gösterilir
- 📈 Daha fazla görünürlük
- 💼 Daha fazla lead

### 5. Plan Yönetimi

**Adres:** `/vendor/plan`

**Free Plan:**
- ✅ Temel profil
- ✅ 3 adete kadar ilan
- ✅ Site içi mesajlaşma
- ❌ WhatsApp/Telefon gösterimi
- ❌ Sınırsız ilan
- ❌ Üst sıralarda görünme

**Pro Plan (29.99€/ay):**
- ✅ Premium profil
- ✅ Sınırsız ilan
- ✅ Site içi mesajlaşma
- ✅ WhatsApp/Telefon gösterimi
- ✅ Üst sıralarda görünme
- ✅ Öncelikli destek
- ✅ Gelişmiş analitikler

**Pro Plan'a Geçiş:**
1. **"Pro'ya Geç"** butonuna tıklayın
2. PayPal ile ödeme yapın
3. ✅ Plan aktif olur
4. İletişim bilgileriniz otomatik gösterilir

---

## 👨‍💼 Admin'ler İçin

### 1. Kredi Onay Paneli

**Adres:** `/admin/credit-approval`

**Görevler:**
1. Bekleyen kredi taleplerini görün
2. PayPal'da ödemeyi kontrol edin
3. Talebi onaylayın veya reddedin

**Onaylama Adımları:**
1. Talep listesini görün
2. Vendor bilgilerini kontrol edin
3. PayPal'da ödemeyi doğrulayın
4. **"✅ Onayla"** tıklayın
5. Not ekleyin (opsiyonel)
6. ✅ Kredi otomatik eklenir

**Reddetme:**
1. **"❌ Reddet"** tıklayın
2. Red nedenini yazın
3. ✅ Vendor bilgilendirilir

**Filtreler:**
- ⏳ Bekleyen
- ✅ Onaylanan
- ❌ Reddedilen
- 📋 Tümü

### 2. Supabase Yönetimi

**Vendor Rolü Verme:**
```sql
UPDATE profiles 
SET role = 'vendor' 
WHERE email = 'vendor@email.com';
```

**Admin Rolü Verme:**
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@email.com';
```

**Manuel Kredi Ekleme:**
```sql
UPDATE vendor_profiles 
SET credit_balance = credit_balance + 50 
WHERE user_id = 'VENDOR_USER_ID';
```

**PayPal E-posta Güncelleme:**
```sql
UPDATE marketplace_config 
SET value = '"new-paypal@email.com"' 
WHERE key = 'paypal_email';
```

---

## 📊 İstatistikler ve Raporlar

### Vendor İstatistikleri
- Toplam lead sayısı
- Açılan lead sayısı
- Kredi harcaması
- Featured listing performansı

### Admin İstatistikleri
- Toplam vendor sayısı
- Aktif lead sayısı
- Toplam gelir
- Pending credit requests

---

## 💡 İpuçları

### Vendor'lar İçin:
1. **Profilinizi Tamamlayın:** Dolu profiller daha fazla lead alır
2. **Hızlı Cevap Verin:** Lead'leri 24 saat içinde cevaplayın
3. **Pro Plan Düşünün:** Daha fazla görünürlük = Daha fazla iş
4. **Featured Listing Kullanın:** Özel günlerde öne çıkın

### Admin'ler İçin:
1. **Hızlı Onay:** Kredi taleplerini 24 saat içinde onaylayın
2. **PayPal Kontrol:** Her zaman PayPal'da ödemeyi doğrulayın
3. **İletişim:** Vendor'larla düzenli iletişimde olun

---

## ❓ SSS

**S: Lead'ler ne kadar süre görünür?**
C: Lead'ler süresiz görünür, ancak eski lead'ler önceliği kaybeder.

**S: Kredi iade edilir mi?**
C: Hayır, açılan lead'ler için kredi iadesi yoktur.

**S: Pro plan iptal edilebilir mi?**
C: Evet, istediğiniz zaman iptal edebilirsiniz.

**S: Featured listing ne kadar etkili?**
C: Ortalama %300 daha fazla görünürlük sağlar.

**S: Birden fazla kategori için ilan verebilir miyim?**
C: Evet, her kategori için ayrı ilan oluşturabilirsiniz.

---

**Daha fazla yardım mı gerekiyor?** Bize ulaşın! 📧
