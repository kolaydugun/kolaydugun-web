-- Final Blog System Configuration Checklist
-- Run these in order after all migrations

-- ============================================
-- STEP 1: Run All Migrations (in order)
-- ============================================
-- ✅ 20251202_blog_categories_tags.sql
-- ✅ 20251202_blog_analytics.sql
-- ✅ 20251202_blog_comments.sql
-- ✅ 20251202_blog_storage_related.sql
-- ✅ 20251202_scheduled_publishing.sql
-- ✅ 20251202_assign_blog_categories.sql (this will auto-assign categories)

-- ============================================
-- STEP 2: Create Storage Bucket (Manual)
-- ============================================
-- Go to Supabase Dashboard → Storage → Create Bucket
-- Bucket name: blog-images
-- Public: Yes
-- 
-- Then run these policies:

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- ============================================
-- STEP 3: Add Route for AdminComments
-- ============================================
-- In your App.jsx or routes file, add:
-- 
-- import AdminComments from './pages/AdminComments';
-- 
-- <Route path="/admin/comments" element={<AdminComments />} />

-- ============================================
-- STEP 4: Verify Everything Works
-- ============================================
-- Run this query to check:

SELECT 
    'Posts' as table_name,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'published') as published,
    COUNT(*) FILTER (WHERE status = 'draft') as draft,
    COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled
FROM posts
UNION ALL
SELECT 
    'Categories',
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true),
    NULL,
    NULL
FROM blog_categories
UNION ALL
SELECT 
    'Tags',
    COUNT(*),
    NULL,
    NULL,
    NULL
FROM blog_tags
UNION ALL
SELECT 
    'Comments',
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'approved'),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'spam')
FROM blog_comments;

-- ============================================
-- STEP 5: Test Features
-- ============================================
-- 1. Create a blog post with categories and tags
-- 2. Upload an image
-- 3. Set scheduled publish date
-- 4. Submit a comment
-- 5. Moderate comment in /admin/comments
-- 6. Check analytics (view count, reading time)
-- 7. Verify related posts appear
-- 8. Test social sharing buttons

-- ============================================
-- OPTIONAL: Enable pg_cron for Auto-Publishing
-- ============================================
-- If you want automatic publishing without page visits:
-- 
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- 
-- SELECT cron.schedule(
--     'auto-publish-scheduled-posts',
--     '*/5 * * * *',
--     $$SELECT auto_publish_scheduled_posts();$$
-- );

-- ============================================
-- ALL DONE! 🎉
-- ============================================
