-- ============================================
-- Fix Admin Delete Permissions (v2 - Safe Version)
-- Allow admins to delete users and all related records
-- Only creates policies for tables that exist
-- ============================================

-- 1. PROFILES - Allow admins to delete any profile
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile" ON public.profiles
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 2. VENDORS - Allow admins to delete any vendor (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vendors') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any vendor" ON public.vendors';
    EXECUTE 'CREATE POLICY "Admins can delete any vendor" ON public.vendors
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 3. VENDOR_PROFILES - Allow admins to delete any vendor profile (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vendor_profiles') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any vendor_profile" ON public.vendor_profiles';
    EXECUTE 'CREATE POLICY "Admins can delete any vendor_profile" ON public.vendor_profiles
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 4. TRANSACTIONS - Allow admins to delete any transaction (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any transaction" ON public.transactions';
    EXECUTE 'CREATE POLICY "Admins can delete any transaction" ON public.transactions
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 5. VENDOR_LEADS - Allow admins to delete any vendor lead (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vendor_leads') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any vendor_lead" ON public.vendor_leads';
    EXECUTE 'CREATE POLICY "Admins can delete any vendor_lead" ON public.vendor_leads
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 6. LEADS - Allow admins to delete any lead (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any lead" ON public.leads';
    EXECUTE 'CREATE POLICY "Admins can delete any lead" ON public.leads
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 7. POSTS - Allow admins to delete any post (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts';
    EXECUTE 'CREATE POLICY "Admins can delete any post" ON public.posts
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 8. FEATURED_LISTINGS - Allow admins to delete any featured listing (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'featured_listings') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any featured_listing" ON public.featured_listings';
    EXECUTE 'CREATE POLICY "Admins can delete any featured_listing" ON public.featured_listings
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 9. VENDOR_AD_ORDERS - Allow admins to delete any ad order (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vendor_ad_orders') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any vendor_ad_order" ON public.vendor_ad_orders';
    EXECUTE 'CREATE POLICY "Admins can delete any vendor_ad_order" ON public.vendor_ad_orders
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 10. MESSAGES - Allow admins to delete any message (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any message" ON public.messages';
    EXECUTE 'CREATE POLICY "Admins can delete any message" ON public.messages
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 11. LEAD_UNLOCKS - Allow admins to delete any lead unlock (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lead_unlocks') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any lead_unlock" ON public.lead_unlocks';
    EXECUTE 'CREATE POLICY "Admins can delete any lead_unlock" ON public.lead_unlocks
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 12. FAVORITES - Allow admins to delete any favorite (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any favorite" ON public.favorites';
    EXECUTE 'CREATE POLICY "Admins can delete any favorite" ON public.favorites
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 13. BUDGET_ITEMS - Allow admins to delete any budget item (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'budget_items') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any budget_item" ON public.budget_items';
    EXECUTE 'CREATE POLICY "Admins can delete any budget_item" ON public.budget_items
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 14. CHECKLIST_ITEMS - Allow admins to delete any checklist item (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'checklist_items') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any checklist_item" ON public.checklist_items';
    EXECUTE 'CREATE POLICY "Admins can delete any checklist_item" ON public.checklist_items
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 15. TODOS - Allow admins to delete any todo (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'todos') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any todo" ON public.todos';
    EXECUTE 'CREATE POLICY "Admins can delete any todo" ON public.todos
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 16. SEATING_TABLES - Allow admins to delete any seating table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'seating_tables') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any seating_table" ON public.seating_tables';
    EXECUTE 'CREATE POLICY "Admins can delete any seating_table" ON public.seating_tables
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 17. GUESTS - Allow admins to delete any guest (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'guests') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any guest" ON public.guests';
    EXECUTE 'CREATE POLICY "Admins can delete any guest" ON public.guests
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 18. WEDDING_DETAILS - Allow admins to delete any wedding details (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wedding_details') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any wedding_details" ON public.wedding_details';
    EXECUTE 'CREATE POLICY "Admins can delete any wedding_details" ON public.wedding_details
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 19. CREDIT_REQUESTS - Allow admins to delete any credit request (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'credit_requests') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any credit_request" ON public.credit_requests';
    EXECUTE 'CREATE POLICY "Admins can delete any credit_request" ON public.credit_requests
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- 20. LISTINGS - Allow admins to delete any listing (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listings') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any listing" ON public.listings';
    EXECUTE 'CREATE POLICY "Admins can delete any listing" ON public.listings
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;
