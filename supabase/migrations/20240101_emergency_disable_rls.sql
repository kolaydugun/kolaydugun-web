-- EMERGENCY: DISABLE RLS ON POSTS AND PAGES
-- This will allow ANYONE to delete posts/pages. Use with caution.
-- This is to fix the "Delete button not working" issue immediately.

ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages DISABLE ROW LEVEL SECURITY;
