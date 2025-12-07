-- Add translations for Home Pricing section
INSERT INTO public.translations (key, tr, en, de, created_at, updated_at)
VALUES 
  ('homePricing.title', 'Tedarikçiler İçin Paketler', 'Packages for Vendors', 'Pakete für Dienstleister', now(), now()),
  ('homePricing.subtitle', 'İşletmenizi büyütmek için size en uygun paketi seçin.', 'Choose the best plan to grow your business.', 'Wählen Sie das beste Paket, um Ihr Geschäft auszubauen.', now(), now()),
  ('pricing.free', 'Ücretsiz', 'Free', 'Kostenlos', now(), now()),
  ('pricing.premium', 'Premium', 'Premium', 'Premium', now(), now())
ON CONFLICT (key) DO UPDATE 
SET 
  tr = EXCLUDED.tr,
  en = EXCLUDED.en,
  de = EXCLUDED.de,
  updated_at = now();
