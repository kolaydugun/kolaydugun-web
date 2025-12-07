# Wedding Planner - Düğün Planlama Uygulaması

Bu proje, çiftlerin düğün süreçlerini organize etmelerine yardımcı olan kapsamlı bir web uygulamasıdır. React ve Vite kullanılarak geliştirilmiştir.

## 🚀 Özellikler

### 🌸 Planlama Araçları
- **Timeline (Ajanda):** Düğün tarihine göre otomatik oluşturulan aylık yapılacaklar listesi.
- **Budget Planner (Bütçe Planlayıcı):** Harcama kalemlerini yönetme, ödeme takibi ve bütçe analizi.
- **Seating Plan (Oturma Planı):** Sürükle-bırak özellikli interaktif oturma düzeni oluşturucu.
- **Weather (Hava Durumu):** Düğün tarihi ve şehri için tahmini hava durumu ve öneriler.

### 🏪 Satıcı Yönetimi (Vendor System)
- **Satıcılar İçin:** Profil oluşturma, hizmet detaylarını (kapasite, fiyat, galeri) yönetme paneli.
- **Çiftler İçin:** Satıcıları şehre, kategoriye ve fiyata göre filtreleme ve inceleme.

### 🎨 Tasarım ve UX
- **Modern Arayüz:** `theme.css` tabanlı tutarlı tasarım sistemi.
- **Responsive:** Mobil uyumlu tasarım.
- **Erişilebilirlik:** Görme engelli kullanıcılar için `aria-label` ve klavye desteği.

## 🛠️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Depoyu Klonlayın:**
    ```bash
    git clone <repo-url>
    cd wedding-planner
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Uygulamayı Başlatın:**
    ```bash
    npm run dev
    ```
    Tarayıcınızda `http://localhost:5173` adresine gidin.

## 📂 Proje Yapısı

- `src/components`: Tekrar kullanılabilir UI bileşenleri (Navbar, Footer, vb.).
- `src/context`: Global state yönetimi (Auth, Vendor, Planning).
- `src/pages`: Sayfa bileşenleri (Home, VendorDashboard, Tools, vb.).
- `src/hooks`: Özel hook'lar (usePageTitle, vb.).
- `src/theme.css`: Global stil değişkenleri ve utility sınıfları.

## 🤝 Katkıda Bulunma

1.  Forklayın.
2.  Yeni bir dal (branch) oluşturun (`git checkout -b feature/yeni-ozellik`).
3.  Değişikliklerinizi commitleyin (`git commit -m 'Yeni özellik eklendi'`).
4.  Dalınızı pushlayın (`git push origin feature/yeni-ozellik`).
5.  Bir Pull Request oluşturun.

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
