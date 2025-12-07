UPDATE public.site_settings
SET 
    hero_title = '{
        "tr": "Hayalinizdeki Düğün İçin Kusursuz Başlangıç",
        "en": "The Perfect Start for Your Dream Wedding",
        "de": "Der perfekte Start für Ihre Traumhochzeit"
    }'::jsonb,
    hero_subtitle = '{
        "tr": "Almanya''nın en seçkin düğün mekanları ve organizasyon profesyonelleri parmaklarınızın ucunda.",
        "en": "Germany''s most exclusive wedding venues and event professionals at your fingertips.",
        "de": "Deutschlands exklusivste Hochzeitslocations und Event-Profis direkt griffbereit."
    }'::jsonb,
    hero_image_url = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop',
    updated_at = timezone('utc'::text, now())
WHERE id = 1;
