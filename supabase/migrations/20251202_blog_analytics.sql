-- Blog Analytics System
-- Migration: 20251202_blog_analytics.sql

-- ============================================
-- 1. POST VIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- NULL for anonymous users
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP DEFAULT NOW(),
  time_spent INTEGER DEFAULT 0 -- seconds spent on page
);

CREATE INDEX IF NOT EXISTS idx_post_views_post ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_date ON post_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_post_views_ip ON post_views(ip_address);

-- ============================================
-- 2. UPDATE POSTS TABLE
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS unique_views INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0; -- minutes

-- ============================================
-- 3. TRACK POST VIEW FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION track_post_view(
  p_post_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_is_unique BOOLEAN;
BEGIN
  -- Check if this is a unique view (same IP hasn't viewed in last 24 hours)
  SELECT NOT EXISTS (
    SELECT 1 FROM post_views
    WHERE post_id = p_post_id
      AND ip_address = p_ip_address
      AND viewed_at > NOW() - INTERVAL '24 hours'
  ) INTO v_is_unique;

  -- Insert view record
  INSERT INTO post_views (post_id, user_id, ip_address, user_agent)
  VALUES (p_post_id, p_user_id, p_ip_address, p_user_agent);

  -- Update post view counts
  UPDATE posts 
  SET 
    view_count = view_count + 1,
    unique_views = CASE WHEN v_is_unique THEN unique_views + 1 ELSE unique_views END
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. CALCULATE READING TIME FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  reading_time INTEGER;
BEGIN
  -- Remove HTML tags for accurate word count
  content_text := regexp_replace(content_text, '<[^>]+>', '', 'g');
  
  -- Count words (average reading speed: 200 words per minute)
  word_count := array_length(regexp_split_to_array(trim(content_text), '\s+'), 1);
  reading_time := CEIL(word_count::FLOAT / 200);
  
  -- Minimum 1 minute
  RETURN GREATEST(reading_time, 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. AUTO-UPDATE READING TIME TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION auto_update_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate reading time from Turkish content (primary language)
  IF NEW.content IS NOT NULL AND NEW.content->>'tr' IS NOT NULL THEN
    NEW.reading_time := calculate_reading_time(NEW.content->>'tr');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_reading_time
BEFORE INSERT OR UPDATE OF content ON posts
FOR EACH ROW EXECUTE FUNCTION auto_update_reading_time();

-- ============================================
-- 6. GET POPULAR POSTS FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_popular_posts(
  p_limit INTEGER DEFAULT 5,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title JSONB,
  excerpt JSONB,
  featured_image_url TEXT,
  view_count INTEGER,
  reading_time INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.slug,
    p.title,
    p.excerpt,
    p.featured_image_url,
    p.view_count,
    p.reading_time
  FROM posts p
  WHERE p.status = 'published'
    AND p.created_at > NOW() - (p_days || ' days')::INTERVAL
  ORDER BY p.view_count DESC, p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. RLS POLICIES
-- ============================================
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (for tracking)
CREATE POLICY "Anyone can track views"
ON post_views FOR INSERT
WITH CHECK (true);

-- Only admins can read view data
CREATE POLICY "Admins can view analytics"
ON post_views FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');
