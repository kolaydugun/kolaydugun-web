-- Fix Admin Delete Policies for Blog and Pages

-- 1. Enable RLS (if not already)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can do everything on posts" ON public.posts;
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can do everything on pages" ON public.pages;
DROP POLICY IF EXISTS "Public can view active pages" ON public.pages;

-- 3. Create Policies for POSTS

-- Allow Admins to do EVERYTHING (Select, Insert, Update, Delete)
CREATE POLICY "Admins can do everything on posts" ON public.posts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow Public to VIEW published posts
CREATE POLICY "Public can view published posts" ON public.posts
    FOR SELECT TO anon, authenticated
    USING (status = 'published');


-- 4. Create Policies for PAGES

-- Allow Admins to do EVERYTHING (Select, Insert, Update, Delete)
CREATE POLICY "Admins can do everything on pages" ON public.pages
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow Public to VIEW active pages
CREATE POLICY "Public can view active pages" ON public.pages
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

-- 5. Grant permissions just in case
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.pages TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.pages TO anon;
