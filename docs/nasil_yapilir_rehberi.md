# 🚀 Adım Adım Vendor Ekleme Rehberi

Merhaba! Hiç teknik bilgin olmasa bile, bu rehberle kolayca vendor ekleyebilirsin.

---

## 1. Adım: Excel Dosyası Hazırla

Önce bilgisayarında boş bir Excel dosyası aç. En üst satıra şu başlıkları **aynen** yaz (İngilizce olması önemli):

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| **Business Name** | **Category** | **City** | **Description** | **Instagram URL** | **Website URL** |

### Örnek Doldurma:

| Business Name | Category | City | Description | Instagram URL | Website URL |
|---|---|---|---|---|---|
| Salon Royal | Wedding Venues | Berlin | Harika bir düğün salonu. | @salonroyalberlin | www.salonroyal.com |
| Foto Ahmet | Wedding Photography | Hamburg | Profesyonel çekimler. | @fotoahmet | www.ahmetfoto.de |

> **Dikkat:**
> - **Category:** İngilizce olmalı (Wedding Venues, Photographers, vb.)
> - **City:** Şehir adı (Berlin, Hamburg...)
> - **Instagram:** @kullaniciadi şeklinde yaz.

---

## 2. Adım: Instagram'dan Vendor Bul

1.  Instagram'ı aç.
2.  Arama kısmına `#hochzeitslocationberlin` yaz (veya diğer hashtagler).
3.  Beğendiğin bir mekanı bul.
4.  Bilgilerini Excel'e kopyala:
    *   İsmini -> **Business Name**'e
    *   Şehrini -> **City**'ye
    *   Kullanıcı adını -> **Instagram URL**'ye
    *   Bio'sunda ne yazıyorsa -> **Description**'a

Bunu 10-20 vendor için yap.

---

## 3. Adım: Dosyayı CSV Olarak Kaydet

Excel'de işin bitince:
1.  **Dosya > Farklı Kaydet** (File > Save As) tıkla.
2.  Dosya türü olarak **CSV (Virgülle Ayrılmış)** seç.
3.  Masaüstüne kaydet.

---

## 4. Adım: Sisteme Yükle

1.  KolayDugun Admin Paneline gir: `http://localhost:5173/admin/vendors`
2.  **"📥 Import CSV"** butonuna tıkla.
3.  Açılan pencerede **"Dosya Seç"** de ve kaydettiğin CSV dosyasını seç.
4.  Ekranda listeyi göreceksin. Her şey doğruysa **"İçe Aktar"** butonuna bas.
5.  Bitti! 🎉

---

## 5. Adım: DM Gönder

Artık vendorlar sistemde! Şimdi Instagram'a geri dön ve onlara mesaj at:

> "Merhaba! Sizi KolayDugun platformuna ekledik. Profilinizi buradan görebilirsiniz: [LİNK]"

Link'i admin panelinde vendor ismine tıklayarak bulabilirsin.

---

### 💡 İpuçları
*   Kategorileri tam olarak sistemdeki gibi yazmaya çalış (Wedding Venues, Catering, vb.).
*   Hata alırsan bana sorabilirsin!
