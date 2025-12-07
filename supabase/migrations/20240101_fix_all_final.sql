-- FINAL FIX SCRIPT
-- This script creates ALL missing tables for the Budget Planner and fixes the "Save" issue.

-- 1. Create 'budget_items' table
CREATE TABLE IF NOT EXISTS public.budget_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category text NOT NULL,
    estimated_cost decimal(12,2) DEFAULT 0,
    actual_cost decimal(12,2) DEFAULT 0,
    paid_amount decimal(12,2) DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create 'todos' table (Checklist)
CREATE TABLE IF NOT EXISTS public.todos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    category text,
    month text,
    is_completed boolean DEFAULT false,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create 'seating_tables' table
CREATE TABLE IF NOT EXISTS public.seating_tables (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'round', -- round, rectangle
    capacity integer DEFAULT 8,
    x numeric DEFAULT 0,
    y numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Update 'guests' table (Add table_id for seating plan)
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS table_id uuid REFERENCES public.seating_tables(id) ON DELETE SET NULL;

-- 5. Ensure 'wedding_details' has gallery_url
ALTER TABLE public.wedding_details 
ADD COLUMN IF NOT EXISTS gallery_url text;

-- 6. Enable RLS on all tables
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_details ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies (Allow Owners to do EVERYTHING)

-- Budget Items Policy
DROP POLICY IF EXISTS "Manage own budget" ON public.budget_items;
CREATE POLICY "Manage own budget" ON public.budget_items
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Todos Policy
DROP POLICY IF EXISTS "Manage own todos" ON public.todos;
CREATE POLICY "Manage own todos" ON public.todos
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Seating Tables Policy
DROP POLICY IF EXISTS "Manage own tables" ON public.seating_tables;
CREATE POLICY "Manage own tables" ON public.seating_tables
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Wedding Details Policy (Fixing the Save Issue)
DROP POLICY IF EXISTS "Manage own wedding details" ON public.wedding_details;
CREATE POLICY "Manage own wedding details" ON public.wedding_details
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Public Read Policy for Wedding Details
DROP POLICY IF EXISTS "Public read access" ON public.wedding_details;
CREATE POLICY "Public read access" ON public.wedding_details
    FOR SELECT TO anon, authenticated
    USING (slug IS NOT NULL);

-- 8. Grant Permissions
GRANT ALL ON public.budget_items TO authenticated;
GRANT ALL ON public.todos TO authenticated;
GRANT ALL ON public.seating_tables TO authenticated;
GRANT ALL ON public.wedding_details TO authenticated;
GRANT SELECT ON public.wedding_details TO anon;
