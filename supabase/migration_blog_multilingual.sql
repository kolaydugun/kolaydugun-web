-- Migration to make blog posts multilingual
-- We will convert title, content, excerpt, and slug to JSONB
-- Existing data will be preserved by setting the 'tr' (Turkish) field to the current value, 
-- and copying it to 'en' and 'de' as fallback.

-- 1. Title
ALTER TABLE posts 
ALTER COLUMN title TYPE jsonb 
USING jsonb_build_object('tr', title, 'en', title, 'de', title);

-- 2. Content
ALTER TABLE posts 
ALTER COLUMN content TYPE jsonb 
USING jsonb_build_object('tr', content, 'en', content, 'de', content);

-- 3. Excerpt
ALTER TABLE posts 
ALTER COLUMN excerpt TYPE jsonb 
USING jsonb_build_object('tr', excerpt, 'en', excerpt, 'de', excerpt);

-- 4. Slug (Optional: keeping slug as text might be easier for routing, but let's make it multilingual for SEO)
-- For now, let's keep slug as TEXT to avoid complex routing changes. 
-- We will use the same slug for all languages, or we can add slug_en, slug_de later.
-- Decision: Keep slug as TEXT for now to simplify routing. The URL will be /blog/slug-name regardless of language.
-- If user wants translated URLs, we can add that later.

-- 5. Add SEO columns (Multilingual)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title jsonb DEFAULT '{"tr": "", "en": "", "de": ""}'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description jsonb DEFAULT '{"tr": "", "en": "", "de": ""}'::jsonb;

-- 6. Update RLS policies if needed (existing ones should still work as they check rows, not column types)
