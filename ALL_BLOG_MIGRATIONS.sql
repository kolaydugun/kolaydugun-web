-- QUICK FIX: Run ALL Blog Migrations in Correct Order
-- Copy and paste this ENTIRE file into Supabase SQL Editor

-- ============================================
-- MIGRATION 1: Categories & Tags
-- ============================================
-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description JSONB,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create junction tables
CREATE TABLE IF NOT EXISTS post_categories (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (post_id, category_id)
);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

-- Enable RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Public read, authenticated write)
DROP POLICY IF EXISTS "Public can view categories" ON blog_categories;
CREATE POLICY "Public can view categories" ON blog_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view tags" ON blog_tags;
CREATE POLICY "Public can view tags" ON blog_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view post categories" ON post_categories;
CREATE POLICY "Public can view post categories" ON post_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view post tags" ON post_tags;
CREATE POLICY "Public can view post tags" ON post_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON blog_categories;
CREATE POLICY "Authenticated users can manage categories" ON blog_categories 
FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage post categories" ON post_categories;
CREATE POLICY "Authenticated users can manage post categories" ON post_categories 
FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage post tags" ON post_tags;
CREATE POLICY "Authenticated users can manage post tags" ON post_tags 
FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample categories
INSERT INTO blog_categories (name, slug, description, icon, color, sort_order) VALUES
(
    '{"tr": "Düğün Planlaması", "en": "Wedding Planning", "de": "Hochzeitsplanung"}',
    'wedding-planning',
    '{"tr": "Düğün organizasyonu ve planlama ipuçları", "en": "Wedding organization and planning tips", "de": "Hochzeitsorganisation und Planungstipps"}',
    '📋',
    '#3b82f6',
    1
),
(
    '{"tr": "Düğün Bütçesi", "en": "Budget & Finance", "de": "Budget & Finanzen"}',
    'budget-finance',
    '{"tr": "Bütçe yönetimi ve tasarruf önerileri", "en": "Budget management and saving tips", "de": "Budgetverwaltung und Spartipps"}',
    '💰',
    '#10b981',
    2
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- MIGRATION 2: Comments
-- ============================================
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved comments" ON blog_comments;
CREATE POLICY "Public can view approved comments" ON blog_comments 
FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Anyone can create comments" ON blog_comments;
CREATE POLICY "Anyone can create comments" ON blog_comments 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage comments" ON blog_comments;
CREATE POLICY "Authenticated users can manage comments" ON blog_comments 
FOR ALL USING (auth.role() = 'authenticated');

-- Add comment columns to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN DEFAULT true;

-- ============================================
-- MIGRATION 3: Analytics
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS unique_views INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS post_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    viewed_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MIGRATION 4: Image Upload
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_alt_text JSONB;

-- ============================================
-- MIGRATION 5: Scheduled Publishing
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

-- ============================================
-- DONE! Now test your blog system
-- ============================================
