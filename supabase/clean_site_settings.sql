UPDATE public.site_settings
SET hero_title = jsonb_set(hero_title, '{tr}', '"Test Başlık 123"')
WHERE id = 1;
