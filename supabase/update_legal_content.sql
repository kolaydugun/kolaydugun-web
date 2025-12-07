-- Update Impressum with realistic placeholder data
UPDATE pages
SET content = '{
  "en": "<h1>Imprint</h1><h2>Information according to § 5 TMG</h2><p>KolayDugun GmbH<br>Musterstraße 1<br>10115 Berlin<br>Germany</p><h2>Represented by:</h2><p>Ahmet Yılmaz</p><h2>Contact:</h2><p>Phone: +49 123 456789<br>Email: contact@kolaydugun.de</p><h2>Register Entry:</h2><p>Entry in the Commercial Register.<br>Register Court: Amtsgericht Berlin-Charlottenburg<br>Register Number: HRB 123456</p><h2>VAT ID:</h2><p>Sales tax identification number according to §27 a sales tax law:<br>DE 123 456 789</p>",
  "de": "<h1>Impressum</h1><h2>Angaben gemäß § 5 TMG</h2><p>KolayDugun GmbH<br>Musterstraße 1<br>10115 Berlin<br>Deutschland</p><h2>Vertreten durch:</h2><p>Ahmet Yılmaz</p><h2>Kontakt:</h2><p>Telefon: +49 123 456789<br>E-Mail: contact@kolaydugun.de</p><h2>Registereintrag:</h2><p>Eintragung im Handelsregister.<br>Registergericht: Amtsgericht Berlin-Charlottenburg<br>Registernummer: HRB 123456</p><h2>Umsatzsteuer-ID:</h2><p>Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br>DE 123 456 789</p>",
  "tr": "<h1>Künye</h1><h2>5 TMG Uyarınca Bilgiler</h2><p>KolayDugun GmbH<br>Musterstraße 1<br>10115 Berlin<br>Almanya</p><h2>Temsil Eden:</h2><p>Ahmet Yılmaz</p><h2>İletişim:</h2><p>Telefon: +49 123 456789<br>E-posta: contact@kolaydugun.de</p><h2>Sicil Kaydı:</h2><p>Ticaret Siciline Kayıt.<br>Kayıt Mahkemesi: Amtsgericht Berlin-Charlottenburg<br>Kayıt Numarası: HRB 123456</p><h2>KDV Kimlik No:</h2><p>Satış vergisi yasası §27 a uyarınca satış vergisi kimlik numarası:<br>DE 123 456 789</p>"
}'::jsonb
WHERE slug = 'impressum';

-- Update Privacy Policy
UPDATE pages
SET content = '{
  "en": "<h1>Privacy Policy</h1><p><strong>1. Data Protection at a Glance</strong></p><h3>General Information</h3><p>The following notes provide a simple overview of what happens to your personal data when you visit this website. Personal data is all data with which you can be personally identified.</p><h3>Data Collection on this Website</h3><p><strong>Who is responsible for data collection on this website?</strong></p><p>The data processing on this website is carried out by the website operator. You can find their contact details in the imprint of this website.</p>",
  "de": "<h1>Datenschutzerklärung</h1><p><strong>1. Datenschutz auf einen Blick</strong></p><h3>Allgemeine Hinweise</h3><p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p><h3>Datenerfassung auf dieser Website</h3><p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong></p><p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>",
  "tr": "<h1>Gizlilik Politikası</h1><p><strong>1. Bir Bakışta Veri Koruma</strong></p><h3>Genel Bilgiler</h3><p>Aşağıdaki notlar, bu web sitesini ziyaret ettiğinizde kişisel verilerinize ne olduğuna dair basit bir genel bakış sunar. Kişisel veriler, kişisel olarak tanımlanabileceğiniz tüm verilerdir.</p><h3>Bu Web Sitesinde Veri Toplama</h3><p><strong>Bu web sitesinde veri toplamadan kim sorumludur?</strong></p><p>Bu web sitesindeki veri işleme, web sitesi operatörü tarafından gerçekleştirilir. İletişim bilgilerini bu web sitesinin künyesinde bulabilirsiniz.</p>"
}'::jsonb
WHERE slug = 'privacy';

-- Update Terms of Service
UPDATE pages
SET content = '{
  "en": "<h1>Terms of Service</h1><h2>1. Scope</h2><p>These Terms of Service apply to all business relationships between KolayDugun and its customers.</p><h2>2. Conclusion of Contract</h2><p>The presentation of services on our website does not constitute a legally binding offer, but an invitation to order.</p><h2>3. Liability</h2><p>We are liable for intent and gross negligence. Further liability is excluded.</p>",
  "de": "<h1>Allgemeine Geschäftsbedingungen (AGB)</h1><h2>1. Geltungsbereich</h2><p>Diese AGB gelten für alle Geschäftsbeziehungen zwischen KolayDugun und ihren Kunden.</p><h2>2. Vertragsschluss</h2><p>Die Darstellung der Dienstleistungen auf unserer Website stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung dar.</p><h2>3. Haftung</h2><p>Wir haften für Vorsatz und grobe Fahrlässigkeit. Eine weitergehende Haftung ist ausgeschlossen.</p>",
  "tr": "<h1>Kullanım Koşulları</h1><h2>1. Kapsam</h2><p>Bu Kullanım Koşulları, KolayDugun ile müşterileri arasındaki tüm iş ilişkileri için geçerlidir.</p><h2>2. Sözleşmenin Kurulması</h2><p>Hizmetlerin web sitemizde sunulması, yasal olarak bağlayıcı bir teklif değil, sipariş vermeye davettir.</p><h2>3. Sorumluluk</h2><p>Kasıt ve ağır ihmalden sorumluyuz. Daha ileri sorumluluk hariç tutulmuştur.</p>"
}'::jsonb
WHERE slug = 'terms';
