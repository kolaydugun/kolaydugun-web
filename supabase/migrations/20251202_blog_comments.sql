-- Blog Comments System with Moderation
-- Migration: 20251202_blog_comments.sql

-- ============================================
-- 1. BLOG COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE, -- For nested replies
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, spam
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON blog_comments(created_at);

-- ============================================
-- 2. UPDATE POSTS TABLE
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN DEFAULT true;

-- ============================================
-- 3. UPDATE COMMENT COUNT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE posts 
    SET comment_count = comment_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
      UPDATE posts 
      SET comment_count = comment_count + 1
      WHERE id = NEW.post_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      UPDATE posts 
      SET comment_count = comment_count - 1
      WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE posts 
    SET comment_count = comment_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR UPDATE OF status OR DELETE ON blog_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- ============================================
-- 4. COMMENT MODERATION FUNCTIONS
-- ============================================

-- Approve comment
CREATE OR REPLACE FUNCTION approve_comment(p_comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_comments
  SET 
    status = 'approved',
    approved_at = NOW(),
    approved_by = auth.uid()
  WHERE id = p_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject comment
CREATE OR REPLACE FUNCTION reject_comment(p_comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_comments
  SET status = 'rejected'
  WHERE id = p_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark as spam
CREATE OR REPLACE FUNCTION mark_comment_spam(p_comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_comments
  SET status = 'spam'
  WHERE id = p_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bulk approve comments
CREATE OR REPLACE FUNCTION bulk_approve_comments(p_comment_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE blog_comments
  SET 
    status = 'approved',
    approved_at = NOW(),
    approved_by = auth.uid()
  WHERE id = ANY(p_comment_ids)
    AND status = 'pending';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pending comments count
CREATE OR REPLACE FUNCTION get_pending_comments_count()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM blog_comments
  WHERE status = 'pending';
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. SPAM DETECTION (Basic)
-- ============================================
CREATE OR REPLACE FUNCTION check_comment_spam(
  p_content TEXT,
  p_ip_address TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_recent_count INTEGER;
  v_is_spam BOOLEAN := false;
BEGIN
  -- Check for too many comments from same IP in last hour
  SELECT COUNT(*) INTO v_recent_count
  FROM blog_comments
  WHERE ip_address = p_ip_address
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF v_recent_count > 5 THEN
    v_is_spam := true;
  END IF;
  
  -- Check for common spam keywords
  IF p_content ~* '(viagra|cialis|casino|poker|lottery|prize|winner)' THEN
    v_is_spam := true;
  END IF;
  
  -- Check for excessive links (more than 3)
  IF (SELECT array_length(regexp_matches(p_content, 'https?://', 'g'), 1)) > 3 THEN
    v_is_spam := true;
  END IF;
  
  RETURN v_is_spam;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. RLS POLICIES
-- ============================================
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Public can read approved comments
CREATE POLICY "Public can view approved comments"
ON blog_comments FOR SELECT
USING (status = 'approved');

-- Authenticated users can create comments
CREATE POLICY "Users can create comments"
ON blog_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending comments
CREATE POLICY "Users can edit own pending comments"
ON blog_comments FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins have full access
CREATE POLICY "Admins full access to comments"
ON blog_comments FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');
