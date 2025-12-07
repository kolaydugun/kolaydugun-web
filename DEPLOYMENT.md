# KolayDugun Pazaryeri - Production Deployment Rehberi

## 🚀 Production'a Hazırlık

### 1. Environment Variables

**Production `.env` dosyası:**
```env
# Supabase (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# PayPal (Production)
VITE_PAYPAL_CLIENT_ID=your_production_client_id
VITE_PAYPAL_MODE=live

# Optional
VITE_APP_URL=https://kolaydugun.de
```

**⚠️ ÖNEMLİ:**
- Sandbox Client ID yerine Production Client ID kullanın
- `VITE_PAYPAL_MODE=live` olmalı
- `.env` dosyasını asla Git'e commit etmeyin

---

## 📦 Build ve Deploy

### Vercel (Önerilen)

#### 1. Vercel Hesabı Oluşturun
1. https://vercel.com adresine gidin
2. GitHub ile giriş yapın

#### 2. Projeyi Deploy Edin
```bash
# Vercel CLI kur
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

#### 3. Environment Variables Ekleyin
1. Vercel Dashboard → Projeniz → Settings → Environment Variables
2. Tüm `.env` değişkenlerini ekleyin
3. **Redeploy** yapın

---

### Netlify

#### 1. Build Ayarları
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy
```bash
# Netlify CLI kur
npm i -g netlify-cli

# Deploy
netlify deploy

# Production deploy
netlify deploy --prod
```

#### 3. Environment Variables
1. Netlify Dashboard → Site settings → Environment variables
2. Tüm değişkenleri ekleyin

---

### Manual (VPS/Server)

#### 1. Build
```bash
npm run build
```

#### 2. Nginx Config
```nginx
server {
    listen 80;
    server_name kolaydugun.de;
    root /var/www/kolaydugun/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### 3. SSL (Let's Encrypt)
```bash
sudo certbot --nginx -d kolaydugun.de
```

---

## 🗄️ Supabase Production Setup

### 1. Production Projesini Oluşturun
1. Supabase Dashboard → New Project
2. Production için ayrı proje oluşturun
3. Region seçin (EU için Frankfurt)

### 2. Migration'ları Çalıştırın
```bash
# Sırayla:
1. marketplace_migration.sql
2. phase2_migration.sql
3. manual_payment_migration.sql
```

### 3. RLS Policies Kontrol
```sql
-- Tüm tabloların RLS aktif mi kontrol et
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%vendor%' OR tablename LIKE '%lead%';
```

### 4. Backup Ayarları
1. Supabase Dashboard → Settings → Database
2. **Point-in-time Recovery** aktif edin (Pro plan)
3. Günlük otomatik backup

---

## 💳 PayPal Production Setup

### 1. Production App Oluşturun
1. https://developer.paypal.com
2. **Live** sekmesine geçin
3. **Create App**
4. Production Client ID'yi alın

### 2. Webhook Ayarları (Opsiyonel)
1. PayPal Dashboard → Webhooks
2. Webhook URL ekleyin: `https://your-api.com/webhooks/paypal`
3. Events seçin:
   - `PAYMENT.SALE.COMPLETED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`

### 3. Test Ödemeleri
⚠️ **Production'da gerçek para kullanılır!**
- Küçük miktarlarla test edin
- Test hesapları kullanmayın

---

## 🔐 Güvenlik Kontrol Listesi

### Environment
- [ ] `.env` dosyası `.gitignore`'da
- [ ] Production keys kullanılıyor
- [ ] API keys güvenli saklanıyor

### Supabase
- [ ] RLS tüm tablolarda aktif
- [ ] Admin rolleri doğru atanmış
- [ ] Backup ayarları yapıldı
- [ ] Rate limiting aktif

### PayPal
- [ ] Production mode aktif
- [ ] Webhook signature doğrulaması
- [ ] SSL sertifikası geçerli

### Frontend
- [ ] Console.log'lar temizlendi
- [ ] Error handling eklendi
- [ ] Loading states var
- [ ] SEO meta tags eklendi

---

## 📊 Monitoring ve Analytics

### 1. Supabase Monitoring
```sql
-- Günlük lead sayısı
SELECT DATE(created_at), COUNT(*) 
FROM leads 
GROUP BY DATE(created_at) 
ORDER BY DATE(created_at) DESC;

-- Vendor kredi kullanımı
SELECT vendor_id, SUM(credits) as total_credits
FROM transactions
WHERE type = 'lead_unlock'
GROUP BY vendor_id
ORDER BY total_credits DESC;

-- Pending credit requests
SELECT COUNT(*) FROM credit_requests WHERE status = 'pending';
```

### 2. Error Tracking (Sentry - Opsiyonel)
```bash
npm install @sentry/react
```

```javascript
// main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

### 3. Analytics (Google Analytics)
```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

---

## 🔄 Deployment Workflow

### Git Workflow
```bash
# Development
git checkout develop
git pull
# Değişiklikler yap
git add .
git commit -m "feat: new feature"
git push

# Production
git checkout main
git merge develop
git push origin main
# Otomatik deploy tetiklenir (Vercel/Netlify)
```

### CI/CD (GitHub Actions - Opsiyonel)
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🧪 Production Testing

### Pre-Launch Checklist
- [ ] Lead formu çalışıyor
- [ ] Vendor dashboard erişilebilir
- [ ] Kredi yükleme test edildi
- [ ] PayPal ödemeleri çalışıyor
- [ ] Admin paneli erişilebilir
- [ ] E-posta bildirimleri (varsa)
- [ ] Mobile responsive
- [ ] Tüm linkler çalışıyor
- [ ] SEO meta tags doğru

### Load Testing (Opsiyonel)
```bash
# Apache Bench
ab -n 1000 -c 10 https://kolaydugun.de/

# Artillery
npm install -g artillery
artillery quick --count 10 --num 100 https://kolaydugun.de/
```

---

## 📈 Post-Launch

### İlk Hafta
1. **Günlük Monitoring:**
   - Error logs kontrol
   - Performance metrikleri
   - User feedback

2. **Backup Kontrol:**
   - Supabase backup çalışıyor mu?
   - Database export al

3. **PayPal Kontrol:**
   - Ödemeler düzgün işleniyor mu?
   - Webhook'lar çalışıyor mu?

### İlk Ay
1. **Analytics Review:**
   - Kaç lead geldi?
   - Vendor conversion rate?
   - Kredi satışları?

2. **User Feedback:**
   - Vendor'lardan geri bildirim
   - Çiftlerden geri bildirim
   - Bug reports

3. **Optimization:**
   - Slow queries optimize et
   - Caching ekle
   - CDN kullan

---

## 🆘 Troubleshooting

### PayPal Ödemeleri Çalışmıyor
```javascript
// Console'da kontrol et
console.log('PayPal Mode:', import.meta.env.VITE_PAYPAL_MODE);
console.log('Client ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID);
```

### Supabase Connection Error
```javascript
// Supabase URL ve Key kontrol
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

### Build Hatası
```bash
# Cache temizle
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

---

## 📞 Support

**Production Sorunları:**
1. Error logs kontrol et
2. Supabase logs kontrol et
3. PayPal transaction history kontrol et
4. Backup'tan restore et (gerekirse)

**Yardım:**
- Supabase: https://supabase.com/docs
- PayPal: https://developer.paypal.com/docs
- Vercel: https://vercel.com/docs

---

## ✅ Launch Checklist

**Pre-Launch:**
- [ ] Tüm migration'lar çalıştırıldı
- [ ] Production environment variables set
- [ ] PayPal production mode aktif
- [ ] SSL sertifikası kuruldu
- [ ] Backup ayarları yapıldı
- [ ] Monitoring kuruldu
- [ ] Test ödemeleri yapıldı

**Launch Day:**
- [ ] DNS ayarları yapıldı
- [ ] Production deploy edildi
- [ ] Smoke tests geçti
- [ ] Error tracking aktif
- [ ] Team bilgilendirildi

**Post-Launch:**
- [ ] İlk lead geldi mi?
- [ ] İlk ödeme alındı mı?
- [ ] Monitoring çalışıyor mu?
- [ ] Backup alındı mı?

---

**Başarılar!** 🚀 Production'a geçiş kolay olsun!
