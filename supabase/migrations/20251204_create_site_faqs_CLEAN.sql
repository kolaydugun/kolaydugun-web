-- Create Site FAQs Table
-- This table stores frequently asked questions for the platform
-- Supports multilingual content (TR, EN, DE)

CREATE TABLE IF NOT EXISTS public.site_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL CHECK (category IN ('general', 'couples', 'vendors', 'payment', 'technical')),
    question_tr TEXT NOT NULL,
    question_en TEXT NOT NULL,
    question_de TEXT NOT NULL,
    answer_tr TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    answer_de TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_site_faqs_category ON public.site_faqs(category);
CREATE INDEX idx_site_faqs_active ON public.site_faqs(is_active);
CREATE INDEX idx_site_faqs_order ON public.site_faqs(display_order);

-- Enable RLS
ALTER TABLE public.site_faqs ENABLE ROW LEVEL SECURITY;

-- Public read access (everyone can view active FAQs)
DROP POLICY IF EXISTS "Public read access for active FAQs" ON public.site_faqs;
CREATE POLICY "Public read access for active FAQs" ON public.site_faqs
    FOR SELECT
    USING (is_active = true);

-- Admin full access (service_role can manage all FAQs)
DROP POLICY IF EXISTS "Admin full access" ON public.site_faqs;
CREATE POLICY "Admin full access" ON public.site_faqs
    FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'authenticated'
    );


-- Insert seed data (initial FAQs)
INSERT INTO public.site_faqs (category, question_tr, question_en, question_de, answer_tr, answer_en, answer_de, display_order, is_active) VALUES

-- GENERAL CATEGORY
('general', 
 'KolayDugun nedir ve nasıl çalışır?',
 'What is KolayDugun and how does it work?',
 'Was ist KolayDugun und wie funktioniert es?',
 'KolayDugun, Almanya''da düğün planlayan çiftler ile profesyonel düğün tedarikçilerini bir araya getiren çok dilli bir platformdur. Çiftler ücretsiz olarak tedarikçileri keşfedebilir, teklif alabilir ve düğün planlama araçlarını kullanabilir. Tedarikçiler ise işletmelerini tanıtabilir ve potansiyel müşterilere ulaşabilir.',
 'KolayDugun is a multilingual platform that connects couples planning weddings in Germany with professional wedding vendors. Couples can discover vendors, request quotes, and use wedding planning tools for free. Vendors can showcase their businesses and reach potential customers.',
 'KolayDugun ist eine mehrsprachige Plattform, die Paare, die in Deutschland heiraten, mit professionellen Hochzeitsdienstleistern verbindet. Paare können kostenlos Anbieter entdecken, Angebote anfordern und Hochzeitsplanungstools nutzen. Anbieter können ihr Geschäft präsentieren und potenzielle Kunden erreichen.',
 1, true),

('general',
 'Platform kullanımı ücretli mi?',
 'Is the platform free to use?',
 'Ist die Nutzung der Plattform kostenlos?',
 'Çiftler için platform tamamen ücretsizdir! Tüm planlama araçlarını, tedarikçi arama ve teklif alma özelliklerini ücretsiz kullanabilirsiniz. Tedarikçiler için farklı üyelik paketleri mevcuttur.',
 'The platform is completely free for couples! You can use all planning tools, vendor search, and quote request features at no cost. Different membership packages are available for vendors.',
 'Die Plattform ist für Paare völlig kostenlos! Sie können alle Planungstools, die Anbietersuche und Angebotsanfragen kostenlos nutzen. Für Anbieter stehen verschiedene Mitgliedschaftspakete zur Verfügung.',
 2, true),

('general',
 'Hangi dillerde hizmet veriyorsunuz?',
 'Which languages do you support?',
 'Welche Sprachen unterstützen Sie?',
 'KolayDugun üç dilde hizmet vermektedir: Türkçe, Almanca ve İngilizce. Sağ üst köşedeki dil seçeneğinden dilleriniz arasında kolayca geçiş yapabilirsiniz.',
 'KolayDugun is available in three languages: Turkish, German, and English. You can easily switch between languages using the language selector in the top right corner.',
 'KolayDugun ist in drei Sprachen verfügbar: Türkisch, Deutsch und Englisch. Sie können über den Sprachumschalter in der oberen rechten Ecke einfach zwischen den Sprachen wechseln.',
 3, true),

('general',
 'Hangi şehirlerde tedarikçi bulabilirim?',
 'In which cities can I find vendors?',
 'In welchen Städten kann ich Anbieter finden?',
 'Almanya genelinde tüm büyük şehirlerde tedarikçilerimiz bulunmaktadır. Berlin, Münih, Hamburg, Frankfurt, Köln, Stuttgart, Düsseldorf ve daha birçok şehirde hizmet veren profesyonel tedarikçilere ulaşabilirsiniz.',
 'We have vendors in all major cities across Germany. You can find professional vendors serving in Berlin, Munich, Hamburg, Frankfurt, Cologne, Stuttgart, Düsseldorf, and many more cities.',
 'Wir haben Anbieter in allen großen Städten in ganz Deutschland. Sie finden professionelle Anbieter in Berlin, München, Hamburg, Frankfurt, Köln, Stuttgart, Düsseldorf und vielen weiteren Städten.',
 4, true),

('general',
 'Verilerim güvende mi? GDPR uyumlu musunuz?',
 'Is my data safe? Are you GDPR compliant?',
 'Sind meine Daten sicher? Sind Sie GDPR-konform?',
 'Evet, verileriniz tamamen güvendedir. KolayDugun, GDPR (Genel Veri Koruma Yönetmeliği) gerekliliklerine tam uyumludur. Kişisel verileriniz şifrelenir ve güvenli sunucularda saklanır. Verilerinizi asla üçüncü taraflarla paylaşmayız.',
 'Yes, your data is completely safe. KolayDugun is fully compliant with GDPR (General Data Protection Regulation) requirements. Your personal data is encrypted and stored on secure servers. We never share your data with third parties.',
 'Ja, Ihre Daten sind vollkommen sicher. KolayDugun ist vollständig DSGVO-konform (Datenschutz-Grundverordnung). Ihre persönlichen Daten werden verschlüsselt und auf sicheren Servern gespeichert. Wir geben Ihre Daten niemals an Dritte weiter.',
 5, true),

-- COUPLES CATEGORY
('couples',
 'Nasıl üye olabilirim?',
 'How can I register?',
 'Wie kann ich mich registrieren?',
 'Sağ üst köşedeki "Kayıt Ol" butonuna tıklayın. E-posta adresiniz ve şifrenizle hızlıca hesap oluşturabilirsiniz. Kayıt olduktan sonra tüm planlama araçlarına ve tedarikçi arama özelliklerine erişim sağlayabilirsiniz.',
 'Click the "Register" button in the top right corner. You can quickly create an account with your email address and password. After registration, you''ll have access to all planning tools and vendor search features.',
 'Klicken Sie auf die Schaltfläche "Registrieren" in der oberen rechten Ecke. Sie können schnell ein Konto mit Ihrer E-Mail-Adresse und Ihrem Passwort erstellen. Nach der Registrierung haben Sie Zugriff auf alle Planungstools und Anbieter-Suchfunktionen.',
 10, true),

('couples',
 'Tedarikçilerden nasıl teklif alabilirim?',
 'How can I request quotes from vendors?',
 'Wie kann ich Angebote von Anbietern anfordern?',
 'Tedarikçi profilini ziyaret edin ve sağ taraftaki "Ücretsiz Teklif Al" formunu doldurun. Düğün tarihinizi, iletişim bilgilerinizi ve özel isteklerinizi belirtin. Tedarikçi size en kısa sürede geri dönüş yapacaktır. Teklif almak tamamen ücretsizdir!',
 'Visit the vendor''s profile and fill out the "Get Free Quote" form on the right side. Specify your wedding date, contact information, and special requests. The vendor will get back to you as soon as possible. Requesting quotes is completely free!',
 'Besuchen Sie das Profil des Anbieters und füllen Sie das Formular "Kostenloses Angebot" auf der rechten Seite aus. Geben Sie Ihr Hochzeitsdatum, Kontaktinformationen und besondere Wünsche an. Der Anbieter wird sich so schnell wie möglich bei Ihnen melden. Angebotsanfragen sind völlig kostenlos!',
 11, true),

('couples',
 'Düğün web sitesi nasıl oluşturulur?',
 'How do I create a wedding website?',
 'Wie erstelle ich eine Hochzeitswebsite?',
 'Panelinizdeki "Planlama Araçları" bölümünden "Web Sitem" seçeneğine tıklayın. Özel URL''nizi seçin, düğün tarihinizi girin, fotoğraflarınızı yükleyin ve hikayenizi paylaşın. Davetlileriniz bu site üzerinden RSVP yapabilir ve tüm detaylara ulaşabilir.',
 'Click on "My Website" from the "Planning Tools" section in your dashboard. Choose your custom URL, enter your wedding date, upload photos, and share your story. Your guests can RSVP through this site and access all details.',
 'Klicken Sie im Bereich "Planungstools" Ihres Dashboards auf "Meine Website". Wählen Sie Ihre individuelle URL, geben Sie Ihr Hochzeitsdatum ein, laden Sie Fotos hoch und teilen Sie Ihre Geschichte. Ihre Gäste können über diese Website zusagen und auf alle Details zugreifen.',
 12, true),

('couples',
 'Bütçe planlayıcı nasıl kullanılır?',
 'How do I use the budget planner?',
 'Wie verwende ich den Budgetplaner?',
 'Panelinizdeki "Bütçem" bölümünden toplam bütçenizi belirleyin. Sistem otomatik olarak kategorilere göre öneriler sunar. Her kategori için harcamalarınızı ekleyin ve gerçek zamanlı olarak kalan bütçenizi takip edin. Excel formatında da dışa aktarabilirsiniz.',
 'Set your total budget from the "My Budget" section in your dashboard. The system automatically suggests allocations by category. Add your expenses for each category and track your remaining budget in real-time. You can also export to Excel format.',
 'Legen Sie Ihr Gesamtbudget im Bereich "Mein Budget" Ihres Dashboards fest. Das System schlägt automatisch Zuweisungen nach Kategorien vor. Fügen Sie Ihre Ausgaben für jede Kategorie hinzu und verfolgen Sie Ihr verbleibendes Budget in Echtzeit. Sie können auch ins Excel-Format exportieren.',
 13, true),

('couples',
 'Favorilere ekleme özelliği nasıl çalışır?',
 'How does the favorites feature work?',
 'Wie funktioniert die Favoritenfunktion?',
 'Beğendiğiniz tedarikçilerin profilinde kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz. Tüm favorilerinizi panelinizdeki "Favorilerim" bölümünden görüntüleyebilir ve karşılaştırabilirsiniz. Bu özellik sayesinde beğendiğiniz tedarikçileri kaybetmezsiniz.',
 'Click the heart icon on vendor profiles you like to add them to your favorites. You can view and compare all your favorites from the "My Favorites" section in your dashboard. This feature ensures you never lose track of vendors you like.',
 'Klicken Sie auf das Herzsymbol in den Profilen der Anbieter, die Ihnen gefallen, um sie zu Ihren Favoriten hinzuzufügen. Sie können alle Ihre Favoriten im Bereich "Meine Favoriten" Ihres Dashboards anzeigen und vergleichen. Diese Funktion stellt sicher, dass Sie Anbieter, die Ihnen gefallen, nicht aus den Augen verlieren.',
 14, true),

('couples',
 'Yapılacaklar listesi nasıl kullanılır?',
 'How do I use the checklist?',
 'Wie verwende ich die Checkliste?',
 'Panelinizdeki "Ajandam" bölümünden ay ay yapılacakları görebilirsiniz. Kendi görevlerinizi de ekleyebilir, tamamladıklarınızı işaretleyebilirsiniz. Sistem size düğün tarihine göre öneriler sunar ve hiçbir detayı kaçırmamanızı sağlar.',
 'View month-by-month tasks from the "My Agenda" section in your dashboard. You can add your own tasks and mark completed ones. The system provides suggestions based on your wedding date to ensure you don''t miss any details.',
 'Sehen Sie sich die monatlichen Aufgaben im Bereich "Meine Agenda" Ihres Dashboards an. Sie können eigene Aufgaben hinzufügen und erledigte markieren. Das System gibt Vorschläge basierend auf Ihrem Hochzeitsdatum, damit Sie keine Details verpassen.',
 15, true),

('couples',
 'Oturma planı nasıl oluşturulur?',
 'How do I create a seating chart?',
 'Wie erstelle ich einen Sitzplan?',
 'Panelinizdeki "Oturma Planım" bölümünden masa sayınızı belirleyin. Davetlilerinizi sürükle-bırak yöntemiyle masalara yerleştirin. Her masaya isim verebilir ve kişi sayısını ayarlayabilirsiniz. Plan PDF olarak indirilebilir.',
 'Set the number of tables from the "Seating Plan" section in your dashboard. Place guests at tables using drag-and-drop. You can name each table and adjust the number of seats. The plan can be downloaded as PDF.',
 'Legen Sie die Anzahl der Tische im Bereich "Sitzplan" Ihres Dashboards fest. Platzieren Sie Gäste per Drag-and-Drop an Tischen. Sie können jeden Tisch benennen und die Anzahl der Plätze anpassen. Der Plan kann als PDF heruntergeladen werden.',
 16, true),

('couples',
 'Hesabımı nasıl silebilirim?',
 'How can I delete my account?',
 'Wie kann ich mein Konto löschen?',
 'Panelinizdeki "Ayarlar" bölümünden "Hesabı Sil" seçeneğini bulabilirsiniz. Hesabınızı silmeden önce tüm verilerinizi yedeklemenizi öneririz. Hesap silme işlemi geri alınamaz ve tüm verileriniz kalıcı olarak silinir.',
 'You can find the "Delete Account" option in the "Settings" section of your dashboard. We recommend backing up all your data before deleting your account. Account deletion is irreversible and all your data will be permanently deleted.',
 'Sie finden die Option "Konto löschen" im Bereich "Einstellungen" Ihres Dashboards. Wir empfehlen, alle Ihre Daten zu sichern, bevor Sie Ihr Konto löschen. Die Kontolöschung ist unwiderruflich und alle Ihre Daten werden dauerhaft gelöscht.',
 17, true),

-- VENDORS CATEGORY
('vendors',
 'Tedarikçi olarak nasıl kayıt olabilirim?',
 'How can I register as a vendor?',
 'Wie kann ich mich als Anbieter registrieren?',
 'Ana sayfadaki "Tedarikçiler İçin" butonuna tıklayın veya doğrudan kayıt sayfasına gidin. İşletme bilgilerinizi, kategorinizi ve şehrinizi belirtin. Kayıt sonrası profilinizi tamamlayarak hemen görünür olabilirsiniz.',
 'Click the "For Vendors" button on the homepage or go directly to the registration page. Specify your business information, category, and city. After registration, complete your profile to become visible immediately.',
 'Klicken Sie auf die Schaltfläche "Für Anbieter" auf der Startseite oder gehen Sie direkt zur Registrierungsseite. Geben Sie Ihre Geschäftsinformationen, Kategorie und Stadt an. Nach der Registrierung vervollständigen Sie Ihr Profil, um sofort sichtbar zu werden.',
 20, true),

('vendors',
 'Hangi paketler var ve farkları nedir?',
 'What packages are available and what are the differences?',
 'Welche Pakete gibt es und was sind die Unterschiede?',
 'Üç paket sunuyoruz: Ücretsiz (temel listeleme), Basic (daha fazla görünürlük, sosyal medya linkleri) ve Premium (öncelikli listeleme, video, harita, sınırsız lead). Detaylı karşılaştırma için "Paketler" sayfasını ziyaret edin.',
 'We offer three packages: Free (basic listing), Basic (more visibility, social media links), and Premium (priority listing, video, map, unlimited leads). Visit the "Packages" page for detailed comparison.',
 'Wir bieten drei Pakete an: Kostenlos (Basis-Eintrag), Basic (mehr Sichtbarkeit, Social-Media-Links) und Premium (vorrangige Auflistung, Video, Karte, unbegrenzte Leads). Besuchen Sie die Seite "Pakete" für einen detaillierten Vergleich.',
 21, true),

('vendors',
 'Lead sistemi nasıl çalışır?',
 'How does the lead system work?',
 'Wie funktioniert das Lead-System?',
 'Çiftler profilinizden teklif talep ettiğinde bir lead oluşur. Lead''i açmak için kredi kullanmanız gerekir. Lead''i açtığınızda müşterinin tüm iletişim bilgilerine ve detaylarına ulaşabilirsiniz. Premium pakette sınırsız lead açma hakkınız vardır.',
 'A lead is created when couples request a quote from your profile. You need to use credits to unlock the lead. Once unlocked, you can access all customer contact information and details. Premium package includes unlimited lead unlocking.',
 'Ein Lead wird erstellt, wenn Paare ein Angebot von Ihrem Profil anfordern. Sie müssen Credits verwenden, um den Lead freizuschalten. Nach dem Freischalten können Sie auf alle Kundenkontaktinformationen und Details zugreifen. Das Premium-Paket beinhaltet unbegrenztes Lead-Freischalten.',
 22, true),

('vendors',
 'Kredi sistemi nedir ve nasıl kullanılır?',
 'What is the credit system and how does it work?',
 'Was ist das Credit-System und wie funktioniert es?',
 'Krediler, lead açma ve profil öne çıkarma gibi özellikler için kullanılır. Kredi satın almak için "Cüzdan" bölümünden PayPal ile ödeme yapabilirsiniz. Her kategorinin lead açma maliyeti farklıdır. Kredi bakiyenizi panelinizdeki cüzdan bölümünden takip edebilirsiniz.',
 'Credits are used for features like unlocking leads and promoting your profile. You can purchase credits via PayPal from the "Wallet" section. Each category has different lead unlocking costs. You can track your credit balance in the wallet section of your dashboard.',
 'Credits werden für Funktionen wie das Freischalten von Leads und die Bewerbung Ihres Profils verwendet. Sie können Credits über PayPal im Bereich "Geldbörse" kaufen. Jede Kategorie hat unterschiedliche Kosten für das Freischalten von Leads. Sie können Ihren Credit-Saldo im Geldbörsen-Bereich Ihres Dashboards verfolgen.',
 23, true),

('vendors',
 'Profilimi nasıl öne çıkarabilirim?',
 'How can I promote my profile?',
 'Wie kann ich mein Profil bewerben?',
 'Panelinizdeki "Paket" bölümünden "Öne Çıkar" seçeneğini kullanabilirsiniz. 7 gün, 14 gün veya 30 gün süreyle profilinizi öne çıkarabilirsiniz. Öne çıkan profiller arama sonuçlarında üstte görünür ve daha fazla görüntüleme alır.',
 'Use the "Promote" option from the "Package" section in your dashboard. You can promote your profile for 7, 14, or 30 days. Featured profiles appear at the top of search results and receive more views.',
 'Verwenden Sie die Option "Bewerben" im Bereich "Paket" Ihres Dashboards. Sie können Ihr Profil für 7, 14 oder 30 Tage bewerben. Beworbene Profile erscheinen oben in den Suchergebnissen und erhalten mehr Aufrufe.',
 24, true),

('vendors',
 'Fotoğraf galerisi nasıl eklenir?',
 'How do I add a photo gallery?',
 'Wie füge ich eine Fotogalerie hinzu?',
 'Panelinizdeki "Profil" bölümünden "Galeri" sekmesine gidin. "Fotoğraf Ekle" butonuna tıklayarak görsellerinizi yükleyebilirsiniz. En az 5, en fazla 20 fotoğraf ekleyebilirsiniz. Yüksek kaliteli fotoğraflar daha fazla müşteri çeker!',
 'Go to the "Gallery" tab from the "Profile" section in your dashboard. Click the "Add Photo" button to upload your images. You can add a minimum of 5 and maximum of 20 photos. High-quality photos attract more customers!',
 'Gehen Sie zur Registerkarte "Galerie" im Bereich "Profil" Ihres Dashboards. Klicken Sie auf die Schaltfläche "Foto hinzufügen", um Ihre Bilder hochzuladen. Sie können mindestens 5 und maximal 20 Fotos hinzufügen. Hochwertige Fotos ziehen mehr Kunden an!',
 25, true),

('vendors',
 'Müşterilerle nasıl iletişim kurarım?',
 'How do I communicate with customers?',
 'Wie kommuniziere ich mit Kunden?',
 'Premium pakette mesajlaşma özelliği mevcuttur. Lead açtığınızda müşterinin e-posta ve telefon bilgilerine ulaşabilirsiniz. Ayrıca panelinizdeki "Mesajlar" bölümünden doğrudan platform üzerinden iletişim kurabilirsiniz.',
 'Messaging feature is available in the Premium package. When you unlock a lead, you can access customer email and phone information. You can also communicate directly through the platform from the "Messages" section in your dashboard.',
 'Die Messaging-Funktion ist im Premium-Paket verfügbar. Wenn Sie einen Lead freischalten, können Sie auf E-Mail- und Telefoninformationen des Kunden zugreifen. Sie können auch direkt über die Plattform im Bereich "Nachrichten" Ihres Dashboards kommunizieren.',
 26, true),

('vendors',
 'Video ve sosyal medya linkleri ekleyebilir miyim?',
 'Can I add video and social media links?',
 'Kann ich Video- und Social-Media-Links hinzufügen?',
 'Evet! Basic ve Premium paketlerde YouTube/Vimeo video linki ve sosyal medya hesaplarınızı (Instagram, Facebook, TikTok) ekleyebilirsiniz. Bu özellikler profilinizi daha profesyonel gösterir ve müşteri güvenini artırır.',
 'Yes! In Basic and Premium packages, you can add YouTube/Vimeo video links and your social media accounts (Instagram, Facebook, TikTok). These features make your profile more professional and increase customer trust.',
 'Ja! In den Basic- und Premium-Paketen können Sie YouTube/Vimeo-Videolinks und Ihre Social-Media-Konten (Instagram, Facebook, TikTok) hinzufügen. Diese Funktionen machen Ihr Profil professioneller und erhöhen das Kundenvertrauen.',
 27, true),

('vendors',
 'Harita konumu nasıl eklenir?',
 'How do I add map location?',
 'Wie füge ich einen Kartenstandort hinzu?',
 'Premium pakette harita özelliği mevcuttur. Profil düzenleme sayfasında şehrinizi seçtiğinizde sistem otomatik olarak koordinatları belirler. İsterseniz manuel olarak da konum ayarlayabilirsiniz. Harita müşterilerin sizi bulmasını kolaylaştırır.',
 'Map feature is available in the Premium package. When you select your city on the profile editing page, the system automatically determines coordinates. You can also manually set the location if desired. The map makes it easier for customers to find you.',
 'Die Kartenfunktion ist im Premium-Paket verfügbar. Wenn Sie Ihre Stadt auf der Profilbearbeitungsseite auswählen, bestimmt das System automatisch die Koordinaten. Sie können den Standort auch manuell festlegen. Die Karte erleichtert es Kunden, Sie zu finden.',
 28, true),

('vendors',
 'Paketimi nasıl değiştirebilirim?',
 'How can I change my package?',
 'Wie kann ich mein Paket ändern?',
 'Panelinizdeki "Paket" bölümünden istediğiniz zaman paket yükseltmesi yapabilirsiniz. Ücretsiz''den Basic''e veya Premium''a geçiş anında aktif olur. Paket düşürme işlemi için mevcut paketinizin süresinin dolmasını beklemeniz gerekir.',
 'You can upgrade your package anytime from the "Package" section in your dashboard. Upgrades from Free to Basic or Premium are activated immediately. For downgrades, you need to wait for your current package to expire.',
 'Sie können Ihr Paket jederzeit im Bereich "Paket" Ihres Dashboards upgraden. Upgrades von Kostenlos zu Basic oder Premium werden sofort aktiviert. Für Downgrades müssen Sie warten, bis Ihr aktuelles Paket abläuft.',
 29, true),

('vendors',
 'Hesabımı nasıl silebilirim?',
 'How can I delete my account?',
 'Wie kann ich mein Konto löschen?',
 'Panelinizdeki "Ayarlar" bölümünden hesap silme talebinde bulunabilirsiniz. Aktif paketiniz varsa önce iptal etmeniz gerekir. Hesap silme işlemi 30 gün içinde tamamlanır ve tüm verileriniz kalıcı olarak silinir.',
 'You can request account deletion from the "Settings" section in your dashboard. If you have an active package, you need to cancel it first. Account deletion is completed within 30 days and all your data is permanently deleted.',
 'Sie können die Kontolöschung im Bereich "Einstellungen" Ihres Dashboards beantragen. Wenn Sie ein aktives Paket haben, müssen Sie es zuerst kündigen. Die Kontolöschung wird innerhalb von 30 Tagen abgeschlossen und alle Ihre Daten werden dauerhaft gelöscht.',
 30, true),

-- PAYMENT CATEGORY
('payment',
 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
 'Which payment methods do you accept?',
 'Welche Zahlungsmethoden akzeptieren Sie?',
 'Şu anda PayPal ile ödeme kabul ediyoruz. PayPal üzerinden kredi kartı veya banka hesabınızla güvenli ödeme yapabilirsiniz. Yakında daha fazla ödeme yöntemi eklenecektir.',
 'We currently accept payments via PayPal. You can make secure payments through PayPal using your credit card or bank account. More payment methods will be added soon.',
 'Wir akzeptieren derzeit Zahlungen über PayPal. Sie können sichere Zahlungen über PayPal mit Ihrer Kreditkarte oder Ihrem Bankkonto tätigen. Weitere Zahlungsmethoden werden bald hinzugefügt.',
 40, true),

('payment',
 'Kredi satın alma işlemi güvenli mi?',
 'Is credit purchase secure?',
 'Ist der Kreditkauf sicher?',
 'Evet, tüm ödemeler PayPal''ın güvenli ödeme sistemi üzerinden gerçekleşir. Kredi kartı bilgileriniz bizimle paylaşılmaz, doğrudan PayPal tarafından işlenir. SSL şifrelemesi ile korunursunuz.',
 'Yes, all payments are processed through PayPal''s secure payment system. Your credit card information is not shared with us, it is processed directly by PayPal. You are protected with SSL encryption.',
 'Ja, alle Zahlungen werden über das sichere Zahlungssystem von PayPal abgewickelt. Ihre Kreditkarteninformationen werden nicht mit uns geteilt, sie werden direkt von PayPal verarbeitet. Sie sind durch SSL-Verschlüsselung geschützt.',
 41, true),

('payment',
 'İptal ve iade politikanız nedir?',
 'What is your cancellation and refund policy?',
 'Was ist Ihre Stornierung- und Rückerstattungsrichtlinie?',
 'Kredi satın alımları için 14 gün içinde iade talep edebilirsiniz (kredileri kullanmamış olmanız gerekir). Paket abonelikleri için iptal talebiniz mevcut dönem sonunda geçerli olur. Kullanılmış krediler iade edilemez.',
 'You can request a refund within 14 days for credit purchases (credits must not have been used). For package subscriptions, your cancellation request takes effect at the end of the current period. Used credits are non-refundable.',
 'Sie können innerhalb von 14 Tagen eine Rückerstattung für Kreditkäufe beantragen (Credits dürfen nicht verwendet worden sein). Bei Paketabonnements wird Ihre Kündigungsanfrage am Ende des aktuellen Zeitraums wirksam. Verwendete Credits sind nicht erstattungsfähig.',
 42, true),

('payment',
 'Fatura alabilir miyim?',
 'Can I get an invoice?',
 'Kann ich eine Rechnung erhalten?',
 'Evet, her ödeme sonrası otomatik olarak fatura e-posta adresinize gönderilir. Ayrıca panelinizdeki "Cüzdan" bölümünden geçmiş tüm işlemlerinizin faturalarını indirebilirsiniz.',
 'Yes, an invoice is automatically sent to your email address after each payment. You can also download invoices for all your past transactions from the "Wallet" section in your dashboard.',
 'Ja, nach jeder Zahlung wird automatisch eine Rechnung an Ihre E-Mail-Adresse gesendet. Sie können auch Rechnungen für alle Ihre vergangenen Transaktionen im Bereich "Geldbörse" Ihres Dashboards herunterladen.',
 43, true),

-- TECHNICAL CATEGORY
('technical',
 'Şifremi unuttum, ne yapmalıyım?',
 'I forgot my password, what should I do?',
 'Ich habe mein Passwort vergessen, was soll ich tun?',
 'Giriş sayfasında "Şifremi Unuttum" linkine tıklayın. E-posta adresinizi girin, size şifre sıfırlama linki gönderilecektir. Link 1 saat geçerlidir. E-posta gelmezse spam klasörünüzü kontrol edin.',
 'Click the "Forgot Password" link on the login page. Enter your email address and a password reset link will be sent to you. The link is valid for 1 hour. If you don''t receive the email, check your spam folder.',
 'Klicken Sie auf der Anmeldeseite auf den Link "Passwort vergessen". Geben Sie Ihre E-Mail-Adresse ein und ein Link zum Zurücksetzen des Passworts wird Ihnen zugesandt. Der Link ist 1 Stunde gültig. Wenn Sie die E-Mail nicht erhalten, überprüfen Sie Ihren Spam-Ordner.',
 50, true),

('technical',
 'Mobil uygulama var mı?',
 'Is there a mobile app?',
 'Gibt es eine mobile App?',
 'Şu anda mobil uygulamamız bulunmamaktadır, ancak web sitemiz tamamen mobil uyumludur. Telefonunuzun tarayıcısından tüm özelliklere sorunsuz erişebilirsiniz. Mobil uygulama geliştirme planlarımız mevcuttur.',
 'We currently don''t have a mobile app, but our website is fully mobile-responsive. You can access all features seamlessly from your phone''s browser. We have plans to develop a mobile app.',
 'Wir haben derzeit keine mobile App, aber unsere Website ist vollständig mobilfreundlich. Sie können alle Funktionen nahtlos über den Browser Ihres Telefons aufrufen. Wir haben Pläne, eine mobile App zu entwickeln.',
 51, true),

('technical',
 'Hangi tarayıcılar destekleniyor?',
 'Which browsers are supported?',
 'Welche Browser werden unterstützt?',
 'KolayDugun tüm modern tarayıcılarda sorunsuz çalışır: Chrome, Firefox, Safari, Edge. En iyi deneyim için tarayıcınızın güncel versiyonunu kullanmanızı öneririz. Internet Explorer desteklenmemektedir.',
 'KolayDugun works seamlessly on all modern browsers: Chrome, Firefox, Safari, Edge. We recommend using the latest version of your browser for the best experience. Internet Explorer is not supported.',
 'KolayDugun funktioniert nahtlos auf allen modernen Browsern: Chrome, Firefox, Safari, Edge. Wir empfehlen die Verwendung der neuesten Version Ihres Browsers für das beste Erlebnis. Internet Explorer wird nicht unterstützt.',
 52, true),

('technical',
 'Teknik bir sorun yaşıyorum, nasıl destek alabilirim?',
 'I''m experiencing a technical issue, how can I get support?',
 'Ich habe ein technisches Problem, wie kann ich Unterstützung erhalten?',
 'Teknik destek için info@kolaydugun.de adresine e-posta gönderebilirsiniz. Sorununuzu detaylı açıklayın ve mümkünse ekran görüntüsü ekleyin. Genellikle 24 saat içinde yanıt veriyoruz. Acil durumlar için telefon desteği de mevcuttur.',
 'For technical support, you can send an email to info@kolaydugun.de. Describe your issue in detail and attach a screenshot if possible. We usually respond within 24 hours. Phone support is also available for urgent matters.',
 'Für technischen Support können Sie eine E-Mail an info@kolaydugun.de senden. Beschreiben Sie Ihr Problem detailliert und fügen Sie wenn möglich einen Screenshot bei. Wir antworten normalerweise innerhalb von 24 Stunden. Telefonsupport ist auch für dringende Angelegenheiten verfügbar.',
 53, true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_site_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_faqs_updated_at ON public.site_faqs;
CREATE TRIGGER site_faqs_updated_at
    BEFORE UPDATE ON public.site_faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_site_faqs_updated_at();

-- Grant permissions
GRANT SELECT ON public.site_faqs TO anon, authenticated;
GRANT ALL ON public.site_faqs TO service_role;
