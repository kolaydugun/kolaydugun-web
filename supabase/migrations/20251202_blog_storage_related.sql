-- Blog Storage and Related Posts
-- Migration: 20251202_blog_storage_related.sql

-- ============================================
-- 1. UPDATE POSTS TABLE FOR IMAGES
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_alt_text JSONB; -- {tr: "...", en: "...", de: "..."}

-- ============================================
-- 2. STORAGE BUCKET (Run in Supabase Dashboard)
-- ============================================
-- Note: This needs to be run in Supabase Dashboard SQL Editor
-- or via Supabase CLI as it requires storage schema access

/*
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
*/

-- ============================================
-- 3. GET RELATED POSTS FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_related_posts(
  p_post_id UUID,
  p_limit INTEGER DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title JSONB,
  excerpt JSONB,
  featured_image_url TEXT,
  view_count INTEGER,
  reading_time INTEGER,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  -- Get posts from same categories
  SELECT DISTINCT 
    p.id,
    p.slug,
    p.title,
    p.excerpt,
    p.featured_image_url,
    p.view_count,
    p.reading_time,
    p.created_at
  FROM posts p
  INNER JOIN post_categories pc1 ON p.id = pc1.post_id
  INNER JOIN post_categories pc2 ON pc1.category_id = pc2.category_id
  WHERE pc2.post_id = p_post_id
    AND p.id != p_post_id
    AND p.status = 'published'
  ORDER BY p.view_count DESC, p.created_at DESC
  LIMIT p_limit;
  
  -- If not enough related posts, fill with recent popular posts
  IF (SELECT COUNT(*) FROM posts WHERE id = p_post_id) < p_limit THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.slug,
      p.title,
      p.excerpt,
      p.featured_image_url,
      p.view_count,
      p.reading_time,
      p.created_at
    FROM posts p
    WHERE p.id != p_post_id
      AND p.status = 'published'
      AND p.id NOT IN (
        SELECT DISTINCT p2.id
        FROM posts p2
        INNER JOIN post_categories pc1 ON p2.id = pc1.post_id
        INNER JOIN post_categories pc2 ON pc1.category_id = pc2.category_id
        WHERE pc2.post_id = p_post_id
      )
    ORDER BY p.view_count DESC, p.created_at DESC
    LIMIT (p_limit - (SELECT COUNT(*) FROM posts WHERE id = p_post_id));
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. GET POSTS BY CATEGORY FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_posts_by_category(
  p_category_slug TEXT,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title JSONB,
  excerpt JSONB,
  featured_image_url TEXT,
  view_count INTEGER,
  reading_time INTEGER,
  created_at TIMESTAMP
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
    p.reading_time,
    p.created_at
  FROM posts p
  INNER JOIN post_categories pc ON p.id = pc.post_id
  INNER JOIN blog_categories bc ON pc.category_id = bc.id
  WHERE bc.slug = p_category_slug
    AND p.status = 'published'
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. GET POSTS BY TAG FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_posts_by_tag(
  p_tag_slug TEXT,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title JSONB,
  excerpt JSONB,
  featured_image_url TEXT,
  view_count INTEGER,
  reading_time INTEGER,
  created_at TIMESTAMP
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
    p.reading_time,
    p.created_at
  FROM posts p
  INNER JOIN post_tags pt ON p.id = pt.post_id
  INNER JOIN blog_tags bt ON pt.tag_id = bt.id
  WHERE bt.slug = p_tag_slug
    AND p.status = 'published'
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. SEARCH POSTS FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION search_posts(
  p_query TEXT,
  p_limit INTEGER DEFAULT 10
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
    AND (
      p.title::text ILIKE '%' || p_query || '%'
      OR p.excerpt::text ILIKE '%' || p_query || '%'
      OR p.content::text ILIKE '%' || p_query || '%'
    )
  ORDER BY p.view_count DESC, p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
