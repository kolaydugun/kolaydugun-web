-- Scheduled Publishing Feature - SIMPLIFIED VERSION
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ADD COLUMNS (if not exists)
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'scheduled_for'
    ) THEN
        ALTER TABLE posts ADD COLUMN scheduled_for TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'published_at'
    ) THEN
        ALTER TABLE posts ADD COLUMN published_at TIMESTAMP;
    END IF;
END $$;

-- ============================================
-- 2. AUTO-PUBLISH FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION auto_publish_scheduled_posts()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE posts
    SET 
        status = 'published',
        published_at = NOW()
    WHERE status = 'scheduled'
        AND scheduled_for IS NOT NULL
        AND scheduled_for <= NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. TRIGGER: Set published_at automatically
-- ============================================
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
        NEW.published_at := COALESCE(NEW.published_at, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_published_at ON posts;
CREATE TRIGGER trigger_set_published_at
BEFORE UPDATE OF status ON posts
FOR EACH ROW EXECUTE FUNCTION set_published_at();

-- ============================================
-- DONE! 
-- ============================================
-- The auto_publish_scheduled_posts() function will be called
-- automatically from Blog.jsx when users visit the blog page.
-- 
-- Scheduled posts will be published when:
-- 1. Someone visits /blog page
-- 2. The scheduled_for time has passed
