-- Security Hardening Migration
-- Date: 2025-12-03
-- Description: Drops permissive policies and applies strict RLS to resolve Supabase security warnings.

-- ============================================
-- 1. BLOG COMMENTS
-- ============================================
ALTER TABLE IF EXISTS blog_comments ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "Public can view approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Users can create comments" ON blog_comments;
DROP POLICY IF EXISTS "Users can edit own pending comments" ON blog_comments;
DROP POLICY IF EXISTS "Admins full access to comments" ON blog_comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON blog_comments; -- The culprit
DROP POLICY IF EXISTS "Public Create Comments" ON blog_comments;
DROP POLICY IF EXISTS "Auth Manage Comments" ON blog_comments;
DROP POLICY IF EXISTS "Public can insert comments" ON blog_comments;
DROP POLICY IF EXISTS "Admins have full access" ON blog_comments;

-- Re-create STRICT policies
CREATE POLICY "Public can view approved comments"
ON blog_comments FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can create comments"
ON blog_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit own pending comments"
ON blog_comments FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins full access to comments"
ON blog_comments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 2. BLOG CATEGORIES & TAGS
-- ============================================
ALTER TABLE IF EXISTS blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS post_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "Auth can manage categories" ON blog_categories; -- Potential culprit

DROP POLICY IF EXISTS "Public can view tags" ON blog_tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON blog_tags;
DROP POLICY IF EXISTS "Auth can manage tags" ON blog_tags; -- Potential culprit

DROP POLICY IF EXISTS "Public can view post categories" ON post_categories;
DROP POLICY IF EXISTS "Admins can manage post categories" ON post_categories;
DROP POLICY IF EXISTS "Auth can manage post categories" ON post_categories;

DROP POLICY IF EXISTS "Public can view post tags" ON post_tags;
DROP POLICY IF EXISTS "Admins can manage post tags" ON post_tags;
DROP POLICY IF EXISTS "Auth can manage post tags" ON post_tags;

-- Re-create STRICT policies
-- Categories
CREATE POLICY "Public can view active categories"
ON blog_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON blog_categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Tags
CREATE POLICY "Public can view tags"
ON blog_tags FOR SELECT
USING (true);

CREATE POLICY "Admins can manage tags"
ON blog_tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Post Categories
CREATE POLICY "Public can view post categories"
ON post_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage post categories"
ON post_categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Post Tags
CREATE POLICY "Public can view post tags"
ON post_tags FOR SELECT
USING (true);

CREATE POLICY "Admins can manage post tags"
ON post_tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 3. NOTIFICATIONS
-- ============================================
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications; -- Duplicate check

-- Re-create STRICT policies (Admin ONLY)
CREATE POLICY "Admins can view all notifications"
ON notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can insert notifications"
ON notifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update notifications"
ON notifications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 4. FINANCE RECORDS
-- ============================================
ALTER TABLE IF EXISTS income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expense_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recurring_income ENABLE ROW LEVEL SECURITY;

-- Drop policies
DROP POLICY IF EXISTS "Admins can view income" ON income_records;
DROP POLICY IF EXISTS "Admins can insert income" ON income_records;
DROP POLICY IF EXISTS "Admins can update income" ON income_records;
DROP POLICY IF EXISTS "Admins can delete income" ON income_records;

DROP POLICY IF EXISTS "Admins can view expenses" ON expense_records;
DROP POLICY IF EXISTS "Admins can insert expenses" ON expense_records;
DROP POLICY IF EXISTS "Admins can update expenses" ON expense_records;
DROP POLICY IF EXISTS "Admins can delete expenses" ON expense_records;

DROP POLICY IF EXISTS "Admins can view recurring expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Admins can insert recurring expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Admins can update recurring expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Admins can delete recurring expenses" ON recurring_expenses;

DROP POLICY IF EXISTS "Enable all for authenticated admins" ON recurring_income;

-- Re-create STRICT policies (Admin ONLY)
-- Income
CREATE POLICY "Admins can view income"
ON income_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can manage income"
ON income_records FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Expenses
CREATE POLICY "Admins can view expenses"
ON expense_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can manage expenses"
ON expense_records FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Recurring Expenses
CREATE POLICY "Admins can view recurring expenses"
ON recurring_expenses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can manage recurring expenses"
ON recurring_expenses FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Recurring Income
CREATE POLICY "Admins can view recurring income"
ON recurring_income FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can manage recurring income"
ON recurring_income FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 5. TRANSLATIONS (If exists)
-- ============================================
ALTER TABLE IF EXISTS translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage translations" ON translations;

CREATE POLICY "Public can view translations"
ON translations FOR SELECT
USING (true);

CREATE POLICY "Admins can manage translations"
ON translations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
