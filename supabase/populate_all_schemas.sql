
-- Update Wedding Venues
UPDATE public.categories 
SET form_schema = '[
    {"key": "venue_type", "label": "venue_type_label", "type": "multiselect", "options": ["venue_option_country", "venue_option_hotel", "venue_option_historic", "venue_option_restaurant", "venue_option_boat", "venue_option_social", "venue_option_hall"]},
    {"key": "capacity_meal", "label": "capacity_meal_label", "type": "number"},
    {"key": "capacity_cocktail", "label": "capacity_cocktail_label", "type": "number"},
    {"key": "view", "label": "view_label", "type": "multiselect", "options": ["view_sea", "view_nature", "view_city", "view_bosphorus", "view_historic", "view_lake", "view_forest"]},
    {"key": "features", "label": "features_label", "type": "multiselect", "options": ["feature_accommodation", "feature_parking", "feature_valet", "feature_disabled_access", "feature_after_party", "feature_menu_tasting", "feature_sound_light"]},
    {"key": "allowed_services", "label": "allowed_services_label", "type": "multiselect", "options": ["allowed_catering", "allowed_organization", "allowed_photography"]}
]'::jsonb
WHERE name = 'Wedding Venues';

-- Update Wedding Photography
UPDATE public.categories 
SET form_schema = '[
    {"key": "shooting_types", "label": "shooting_types_label", "type": "multiselect", "options": ["shoot_documentary", "shoot_story", "shoot_catalog", "shoot_save_the_date", "shoot_trashday", "shoot_engagement", "shoot_studio"]},
    {"key": "delivery_time_weeks", "label": "delivery_time_weeks_label", "type": "number"},
    {"key": "team_size", "label": "team_size_label", "type": "number"},
    {"key": "services", "label": "services_label", "type": "multiselect", "options": ["service_drone", "service_jimmy_jib", "service_album_print", "service_digital", "service_full_day", "service_video_clip"]},
    {"key": "start_price", "label": "start_price_label", "type": "number"}
]'::jsonb
WHERE name = 'Wedding Photography';

-- Update Musicians
UPDATE public.categories 
SET form_schema = '[
    {"key": "performance_type", "label": "performance_type_label", "type": "multiselect", "options": ["perf_dj", "perf_orchestra", "perf_fasil", "perf_trio", "perf_band", "perf_solist", "perf_duo"]},
    {"key": "genres", "label": "music_genres_label", "type": "multiselect", "options": ["genre_pop", "genre_jazz", "genre_turkish_pop", "genre_foreign", "genre_local", "genre_classic", "genre_rock", "genre_rnb", "genre_electronic"]},
    {"key": "team_size", "label": "orchestra_size_label", "type": "number"},
    {"key": "equipment", "label": "equipment_label", "type": "multiselect", "options": ["equip_sound", "equip_light", "equip_stage", "equip_fog", "equip_truss"]},
    {"key": "demo_available", "label": "demo_available_label", "type": "boolean"}
]'::jsonb
WHERE name = 'Musicians';

-- Update Wedding Planners
UPDATE public.categories 
SET form_schema = '[
    {"key": "services", "label": "services_label", "type": "multiselect", "options": ["service_table_chair", "service_decoration", "service_flowers", "service_rsvp", "service_barkovision", "service_fireworks", "service_artist", "service_catering"]},
    {"key": "concepts", "label": "concepts_label", "type": "multiselect", "options": ["concept_bohemian", "concept_rustic", "concept_modern", "concept_classic", "concept_vintage", "concept_romantic", "concept_industrial"]},
    {"key": "demo_table", "label": "demo_table_label", "type": "boolean"},
    {"key": "city_out", "label": "city_out_label", "type": "boolean"}
]'::jsonb
WHERE name = 'Wedding Planners';

-- Update Bridal Fashion
UPDATE public.categories 
SET form_schema = '[
    {"key": "service_type", "label": "service_type_label", "type": "multiselect", "options": ["service_ready_made", "service_custom_made", "service_rental", "service_haute_couture"]},
    {"key": "delivery_time_weeks", "label": "delivery_time_weeks_label", "type": "number"},
    {"key": "accessory_services", "label": "accessory_services_label", "type": "multiselect", "options": ["acc_veil", "acc_pouch", "acc_gloves", "acc_bouquet", "acc_hair", "acc_shoes"]},
    {"key": "appointment_required", "label": "appointment_required_label", "type": "boolean"},
    {"key": "rehearsals", "label": "rehearsals_label", "type": "number"}
]'::jsonb
WHERE name = 'Bridal Fashion';

-- Update Catering & Party Service
UPDATE public.categories 
SET form_schema = '[
    {"key": "cuisine_types", "label": "cuisine_types_label", "type": "multiselect", "options": ["cuisine_turkish", "cuisine_world", "cuisine_vegetarian", "cuisine_vegan", "cuisine_kosher", "cuisine_kids", "cuisine_ottoman"]},
    {"key": "services", "label": "services_label", "type": "multiselect", "options": ["service_waiters", "service_equipment", "service_menu_tasting", "service_cake_cutting", "service_beverage"]},
    {"key": "min_guests", "label": "min_guests_label", "type": "number"},
    {"key": "max_guests", "label": "max_guests_label", "type": "number"}
]'::jsonb
WHERE name = 'Catering & Party Service';

-- Update Wedding Cars
UPDATE public.categories 
SET form_schema = '[
    {"key": "vehicle_types", "label": "vehicle_types_label", "type": "multiselect", "options": ["car_classic", "car_sports", "car_limo", "car_vosvos", "car_vip_minibus", "car_cabrio", "car_helicopter", "car_boat"]},
    {"key": "driver_included", "label": "driver_included_label", "type": "boolean"},
    {"key": "decoration_included", "label": "decoration_included_label", "type": "boolean"},
    {"key": "min_rental_hours", "label": "min_rental_hours_label", "type": "number"}
]'::jsonb
WHERE name = 'Wedding Cars';

-- Update Hair & Make-Up
UPDATE public.categories 
SET form_schema = '[
    {"key": "service_location", "label": "service_location_label", "type": "multiselect", "options": ["loc_salon", "loc_home_hotel", "loc_out_city"]},
    {"key": "services", "label": "services_label", "type": "multiselect", "options": ["service_bridal_hair", "service_makeup", "service_manicure", "service_waxing", "service_skincare", "service_lashes", "service_massage"]},
    {"key": "rehearsal_available", "label": "rehearsal_available_label", "type": "boolean"},
    {"key": "team_size", "label": "team_capacity_label", "type": "number"}
]'::jsonb
WHERE name = 'Hair & Make-Up';

-- Update Invitations & Stationery
UPDATE public.categories 
SET form_schema = '[
    {"key": "products", "label": "products_label", "type": "multiselect", "options": ["prod_invitation", "prod_candy", "prod_gift", "prod_guestbook", "prod_table_card", "prod_menu_card", "prod_welcome_board"]},
    {"key": "delivery_time_weeks", "label": "delivery_time_weeks_label", "type": "number"},
    {"key": "min_order_quantity", "label": "min_order_quantity_label", "type": "number"},
    {"key": "design_service", "label": "design_service_label", "type": "boolean"}
]'::jsonb
WHERE name = 'Invitations & Stationery';

-- Update Flowers & Decoration
UPDATE public.categories 
SET form_schema = '[
    {"key": "services", "label": "services_label", "type": "multiselect", "options": ["service_bridal_bouquet", "service_boutonniere", "service_venue_decor", "service_car_decor", "service_aisle", "service_table_decor", "service_altar"]},
    {"key": "flower_types", "label": "flower_types_label", "type": "multiselect", "options": ["flower_fresh", "flower_artificial", "flower_dried", "flower_preserved"]},
    {"key": "delivery_available", "label": "delivery_setup_available_label", "type": "boolean"}
]'::jsonb
WHERE name = 'Flowers & Decoration';

-- Update Wedding Cakes
UPDATE public.categories 
SET form_schema = '[
    {"key": "products", "label": "products_label", "type": "multiselect", "options": ["prod_wedding_cake", "prod_cupcake", "prod_macaron", "prod_engagement_cake", "prod_candy_buffet"]},
    {"key": "dietary_options", "label": "dietary_options_label", "type": "multiselect", "options": ["diet_gluten_free", "diet_lactose_free", "diet_vegan", "diet_sugar_free", "diet_egg_free"]},
    {"key": "tasting_available", "label": "tasting_available_label", "type": "boolean"},
    {"key": "delivery_available", "label": "delivery_available_label", "type": "boolean"}
]'::jsonb
WHERE name = 'Wedding Cakes';

-- Update Groom Suits
UPDATE public.categories 
SET form_schema = '[
    {"key": "service_type", "label": "service_type_label", "type": "multiselect", "options": ["service_ready_made", "service_custom_made", "service_rental"]},
    {"key": "products", "label": "products_label", "type": "multiselect", "options": ["prod_groom_suit", "prod_tuxedo", "prod_tailcoat", "prod_shirt", "prod_shoes", "prod_cufflinks", "prod_bowtie"]},
    {"key": "delivery_time_weeks", "label": "delivery_time_weeks_label", "type": "number"},
    {"key": "alteration_service", "label": "alteration_service_label", "type": "boolean"}
]'::jsonb
WHERE name = 'Groom Suits';

-- Update Wedding Videography
UPDATE public.categories 
SET form_schema = '[
    {"key": "shooting_types", "label": "shooting_types_label", "type": "multiselect", "options": ["shoot_story", "shoot_clip", "shoot_documentary", "shoot_save_the_date", "shoot_trashday", "shoot_teaser"]},
    {"key": "delivery_time_weeks", "label": "delivery_time_weeks_label", "type": "number"},
    {"key": "services", "label": "services_label", "type": "multiselect", "options": ["service_drone", "service_jimmy_jib", "service_4k", "service_editing", "service_social_clip"]},
    {"key": "team_size", "label": "team_size_label", "type": "number"}
]'::jsonb
WHERE name = 'Wedding Videography';

-- Update Photobox
UPDATE public.categories 
SET form_schema = '[
    {"key": "features", "label": "features_label", "type": "multiselect", "options": ["feat_unlimited_print", "feat_gif", "feat_boomerang", "feat_green_screen", "feat_custom_bg", "feat_props"]},
    {"key": "print_size", "label": "print_size_label", "type": "multiselect", "options": ["size_10x15", "size_strip", "size_polaroid"]},
    {"key": "digital_copy", "label": "digital_copy_label", "type": "boolean"},
    {"key": "assistant_included", "label": "assistant_included_label", "type": "boolean"}
]'::jsonb
WHERE name = 'Photobox';

-- Update Wedding Speakers (Trauredner)
UPDATE public.categories 
SET form_schema = '[
    {"key": "languages", "label": "languages_label", "type": "multiselect", "options": ["lang_turkish", "lang_german", "lang_english", "lang_french", "lang_spanish"]},
    {"key": "services", "label": "services_label", "type": "multiselect", "options": ["service_custom_text", "service_symbolic", "service_vow_renewal", "service_story_writing"]},
    {"key": "meeting_count", "label": "meeting_count_label", "type": "number"},
    {"key": "duration_minutes", "label": "duration_minutes_label", "type": "number"}
]'::jsonb
WHERE name = 'Wedding Speakers (Trauredner)';

-- Update Wedding Rings
UPDATE public.categories 
SET form_schema = '[
    {"key": "products", "label": "products_label", "type": "multiselect", "options": ["prod_wedding_ring", "prod_solitaire", "prod_five_stone", "prod_necklace", "prod_earrings", "prod_bracelet", "prod_watch"]},
    {"key": "material", "label": "material_label", "type": "multiselect", "options": ["mat_gold_yellow", "mat_gold_white", "mat_gold_rose", "mat_platinum", "mat_silver", "mat_diamond", "mat_brilliant"]},
    {"key": "custom_design", "label": "custom_design_label", "type": "boolean"},
    {"key": "maintenance_service", "label": "maintenance_service_label", "type": "boolean"}
]'::jsonb
WHERE name = 'Wedding Rings';

-- Update DJs
UPDATE public.categories 
SET form_schema = '[
    {"key": "music_genres", "label": "music_genres_label", "type": "multiselect", "options": ["genre_pop", "genre_turkish_pop", "genre_foreign_pop", "genre_rnb", "genre_hiphop", "genre_electronic", "genre_house", "genre_techno", "genre_90s", "genre_80s"]},
    {"key": "equipment", "label": "equipment_label", "type": "multiselect", "options": ["equip_sound", "equip_light", "equip_fog", "equip_dj_booth", "equip_mic"]},
    {"key": "performance_duration", "label": "performance_duration_label", "type": "number"},
    {"key": "experience_years", "label": "experience_years_label", "type": "number"}
]'::jsonb
WHERE name = 'DJs';

-- Update Entertainment
UPDATE public.categories 
SET form_schema = '[
    {"key": "act_type", "label": "act_type_label", "type": "multiselect", "options": ["act_dance", "act_magician", "act_fire", "act_acrobatics", "act_comedian", "act_caricature", "act_fireworks"]},
    {"key": "duration_minutes", "label": "duration_minutes_label", "type": "number"},
    {"key": "team_size", "label": "team_size_label", "type": "number"},
    {"key": "requirements", "label": "requirements_label", "type": "multiselect", "options": ["req_stage", "req_sound", "req_backstage", "req_high_ceiling"]}
]'::jsonb
WHERE name = 'Entertainment';
