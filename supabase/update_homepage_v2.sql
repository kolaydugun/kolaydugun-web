UPDATE public.site_settings
SET 
    hero_title = '{
        "tr": "Hayalinizdeki Düğün İçin Kusursuz Başlangıç",
        "en": "The Perfect Start for Your Dream Wedding",
        "de": "Der perfekte Start für Ihre Traumhochzeit"
    }'::jsonb,
    hero_subtitle = '{
        "tr": "Almanya''nın en seçkin düğün mekanları ve organizasyon profesyonelleri ile unutulmaz bir gün planlayın.",
        "en": "Plan an unforgettable day with Germany''s most exclusive wedding venues and event professionals.",
        "de": "Planen Sie einen unvergesslichen Tag mit Deutschlands exklusivsten Hochzeitslocations und Event-Profis."
    }'::jsonb,
    hero_image_url = 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=2070&auto=format&fit=crop',
    updated_at = timezone('utc'::text, now())
WHERE id = 1;
