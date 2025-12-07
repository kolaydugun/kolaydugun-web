# Supabase Migration Kurulum Rehberi

## Adım 1: Supabase Dashboard'a Giriş

1. [Supabase Dashboard](https://app.supabase.com/) adresine gidin
2. Projenizi seçin (KolayDugun projesi)

## Adım 2: SQL Editor'ı Açın

1. Sol menüden **SQL Editor** sekmesine tıklayın
2. **New Query** butonuna tıklayın

## Adım 3: Migration SQL'ini Kopyalayın

1. [`marketplace_migration.sql`](file:///c:/Users/ok/Downloads/google/supabase/marketplace_migration.sql) dosyasını açın
2. **Tüm içeriği** kopyalayın (Ctrl+A, Ctrl+C)

## Adım 4: SQL'i Çalıştırın

1. SQL Editor'a yapıştırın (Ctrl+V)
2. **Run** butonuna tıklayın (veya Ctrl+Enter)
3. Hata olmadan tamamlanmasını bekleyin

### Beklenen Çıktı

Başarılı olursa şu mesajları görmelisiniz:
```
Success. No rows returned
```

### Olası Hatalar ve Çözümleri

#### Hata 1: "relation already exists"
**Sebep:** Tablolar zaten oluşturulmuş.
**Çözüm:** Normal, migration tekrar çalıştırılmış demektir. Sorun yok.

#### Hata 2: "column already exists"
**Sebep:** `profiles` tablosuna `role` alanı zaten eklenmiş.
**Çözüm:** Normal, devam edin.

#### Hata 3: "function already exists"
**Sebep:** RPC fonksiyonları zaten oluşturulmuş.
**Çözüm:** `CREATE OR REPLACE FUNCTION` kullandığımız için sorun yok.

## Adım 5: Tabloları Kontrol Edin

1. Sol menüden **Table Editor** sekmesine gidin
2. Şu tabloların oluşturulduğunu kontrol edin:
   - ✅ `vendor_profiles`
   - ✅ `leads`
   - ✅ `vendor_leads`
   - ✅ `transactions`
   - ✅ `featured_listings`
   - ✅ `marketplace_config`

## Adım 6: Test Verisi Ekleyin (Opsiyonel)

### Vendor Profile Oluşturma

1. **Table Editor** → `vendor_profiles` tablosuna gidin
2. **Insert** → **Insert row** tıklayın
3. Şu alanları doldurun:
   - `user_id`: Mevcut bir vendor kullanıcısının ID'si
   - `plan_type`: `free` veya `pro`
   - `credit_balance`: `50` (test için)
   - `whatsapp_number`: `+491234567890`
   - `phone_number`: `+491234567890`
   - `show_contact_info`: `true` (Pro plan için)

### Test Lead Oluşturma

1. **Table Editor** → `leads` tablosuna gidin
2. **Insert** → **Insert row** tıklayın
3. Şu alanları doldurun:
   - `category_id`: Mevcut bir kategori ID'si
   - `city_id`: Mevcut bir şehir ID'si
   - `event_date`: `2025-06-15`
   - `budget_min`: `1000`
   - `budget_max`: `5000`
   - `contact_name`: `Test Çift`
   - `contact_email`: `test@example.com`
   - `contact_phone`: `+491234567890`
   - `additional_notes`: `Test talebi`

4. **Save** tıklayın
5. Lead kaydedildiğinde, trigger otomatik olarak `vendor_leads` tablosuna eşleştirmeler ekleyecek

## Adım 7: Trigger'ı Kontrol Edin

1. **Table Editor** → `vendor_leads` tablosuna gidin
2. Az önce oluşturduğunuz lead için eşleştirmelerin otomatik oluşturulduğunu kontrol edin
3. Eğer eşleştirme yoksa:
   - `listings` tablosunda aynı kategori ve şehirde aktif ilan var mı kontrol edin
   - Trigger'ın doğru çalıştığını SQL Editor'dan test edin:
     ```sql
     SELECT * FROM vendor_leads WHERE lead_id = 'YOUR_LEAD_ID';
     ```

## Adım 8: RPC Fonksiyonlarını Test Edin

### `unlock_lead_phase1` Testi

SQL Editor'da:
```sql
SELECT unlock_lead_phase1('VENDOR_LEAD_ID');
```

Beklenen çıktı:
```json
{"success": true}
```

### `feature_listing_phase1` Testi

SQL Editor'da:
```sql
SELECT feature_listing_phase1('LISTING_ID', 7);
```

Beklenen çıktı:
```json
{"success": true}
```

## Adım 9: RLS Policy'lerini Kontrol Edin

1. **Authentication** → **Policies** sekmesine gidin
2. Her tablo için policy'lerin aktif olduğunu kontrol edin
3. Özellikle şunları kontrol edin:
   - `vendor_profiles`: Vendor'lar sadece kendi profillerini görebilmeli
   - `vendor_leads`: Vendor'lar sadece kendilerine eşleştirilmiş lead'leri görebilmeli
   - `transactions`: Vendor'lar sadece kendi transaction'larını görebilmeli

## Adım 10: Frontend'i Test Edin

1. Tarayıcıda `http://localhost:5173` adresine gidin
2. Ana sayfada **"📬 Ücretsiz Teklif Al"** butonunu görmelisiniz
3. Butona tıklayın ve lead formu açılmalı
4. Formu doldurup gönderin
5. Vendor hesabıyla giriş yapın
6. `/vendor/overview` adresine gidin ve dashboard'u görün
7. `/vendor/leads` adresine gidin ve lead'leri görün
8. Bir lead'i unlock edin ve iletişim bilgilerinin göründüğünü kontrol edin

## Sorun Giderme

### Problem: "permission denied for table"
**Çözüm:** RLS policy'leri doğru kurulmamış olabilir. Migration'ı tekrar çalıştırın.

### Problem: "relation does not exist"
**Çözüm:** Tablo oluşturulmamış. Migration'ın tamamını çalıştırdığınızdan emin olun.

### Problem: "function does not exist"
**Çözüm:** RPC fonksiyonları oluşturulmamış. Migration'ın tamamını çalıştırın.

### Problem: Lead eşleştirme çalışmıyor
**Çözüm:** 
1. `listings` tablosunda uygun ilanların olduğundan emin olun
2. Trigger'ın doğru kurulduğunu kontrol edin:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_match_vendors';
   ```

## Tamamlandı! 🎉

Migration başarıyla tamamlandı. Artık pazaryeri sistemi kullanıma hazır!

**Sıradaki adım:** Frontend'i test edin ve Faz 2 için PayPal entegrasyonuna geçin.
