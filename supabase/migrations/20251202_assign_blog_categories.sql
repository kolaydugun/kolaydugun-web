-- Assign Existing Blog Posts to Categories
-- Based on your actual blog posts

-- ============================================
-- MANUAL CATEGORY ASSIGNMENT FOR YOUR POSTS
-- ============================================

-- Post 1: "Stressiz Bir Düğün Günü İçin Sırlar"
-- Category: Wedding Planning (Düğün Planlaması)
INSERT INTO post_categories (post_id, category_id)
SELECT 
    p.id,
    c.id
FROM posts p
CROSS JOIN blog_categories c
WHERE c.slug = 'wedding-planning'
AND (
    p.title->>'tr' ILIKE '%Stressiz Bir Düğün%'
    OR p.title->>'tr' ILIKE '%Düğün Günü%'
    OR p.excerpt->>'tr' ILIKE '%rahatlayın%'
)
ON CONFLICT DO NOTHING;

-- Post 2: "Düğün Bütçenizi Yönetmek İçin Akıllı İpuçları"
-- Category: Budget & Finance (Düğün Bütçesi)
INSERT INTO post_categories (post_id, category_id)
SELECT 
    p.id,
    c.id
FROM posts p
CROSS JOIN blog_categories c
WHERE c.slug = 'budget-finance'
AND (
    p.title->>'tr' ILIKE '%Bütçe%'
    OR p.title->>'tr' ILIKE '%Yönetmek%'
    OR p.excerpt->>'tr' ILIKE '%fonlar%'
)
ON CONFLICT DO NOTHING;

-- Post 3: "SCSSS" (xcdsccfv)
-- Category: Trends & Ideas (Trend ve İlham) - generic post
INSERT INTO post_categories (post_id, category_id)
SELECT 
    p.id,
    c.id
FROM posts p
CROSS JOIN blog_categories c
WHERE c.slug = 'trends-ideas'
AND p.title->>'tr' = 'SCSSS'
ON CONFLICT DO NOTHING;

-- ============================================
-- ASSIGN ALL REMAINING POSTS TO DEFAULT CATEGORY
-- ============================================
-- Any post without a category gets "Trends & Ideas"
INSERT INTO post_categories (post_id, category_id)
SELECT 
    p.id,
    (SELECT id FROM blog_categories WHERE slug = 'trends-ideas' LIMIT 1)
FROM posts p
WHERE NOT EXISTS (
    SELECT 1 FROM post_categories pc WHERE pc.post_id = p.id
)
ON CONFLICT DO NOTHING;

-- ============================================
-- UPDATE CATEGORY POST COUNTS
-- ============================================
UPDATE blog_categories
SET post_count = (
    SELECT COUNT(*)
    FROM post_categories pc
    JOIN posts p ON p.id = pc.post_id
    WHERE pc.category_id = blog_categories.id
    AND p.status IN ('published', 'draft')
);

-- ============================================
-- VERIFY ASSIGNMENTS
-- ============================================
SELECT 
    p.title->>'tr' as post_title,
    c.name->>'tr' as category_name,
    p.status,
    p.created_at
FROM posts p
LEFT JOIN post_categories pc ON pc.post_id = p.id
LEFT JOIN blog_categories c ON c.id = pc.category_id
ORDER BY p.created_at DESC;

-- ============================================
-- CHECK POSTS WITHOUT CATEGORIES
-- ============================================
SELECT 
    id,
    title->>'tr' as title,
    excerpt->>'tr' as excerpt,
    status
FROM posts
WHERE NOT EXISTS (
    SELECT 1 FROM post_categories pc WHERE pc.post_id = posts.id
);
