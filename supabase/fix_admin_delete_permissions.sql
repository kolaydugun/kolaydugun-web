-- ============================================
-- Fix Admin Delete Permissions
-- Allow admins to delete users and all related records
-- ============================================

-- 1. PROFILES - Allow admins to delete any profile
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile" ON public.profiles
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 2. VENDORS - Allow admins to delete any vendor
DROP POLICY IF EXISTS "Admins can delete any vendor" ON public.vendors;
CREATE POLICY "Admins can delete any vendor" ON public.vendors
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. VENDOR_PROFILES - Allow admins to delete any vendor profile
DROP POLICY IF EXISTS "Admins can delete any vendor_profile" ON public.vendor_profiles;
CREATE POLICY "Admins can delete any vendor_profile" ON public.vendor_profiles
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. TRANSACTIONS - Allow admins to delete any transaction
DROP POLICY IF EXISTS "Admins can delete any transaction" ON public.transactions;
CREATE POLICY "Admins can delete any transaction" ON public.transactions
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. VENDOR_LEADS - Allow admins to delete any vendor lead
DROP POLICY IF EXISTS "Admins can delete any vendor_lead" ON public.vendor_leads;
CREATE POLICY "Admins can delete any vendor_lead" ON public.vendor_leads
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 6. LEADS - Allow admins to delete any lead
DROP POLICY IF EXISTS "Admins can delete any lead" ON public.leads;
CREATE POLICY "Admins can delete any lead" ON public.leads
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 7. POSTS - Allow admins to delete any post (already covered by "Admins can manage all posts" but ensure DELETE is explicit)
-- The existing policy should cover this, but let's be explicit
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;
CREATE POLICY "Admins can delete any post" ON public.posts
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 8. FEATURED_LISTINGS - Allow admins to delete any featured listing
DROP POLICY IF EXISTS "Admins can delete any featured_listing" ON public.featured_listings;
CREATE POLICY "Admins can delete any featured_listing" ON public.featured_listings
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 9. VENDOR_AD_ORDERS - Allow admins to delete any ad order
DROP POLICY IF EXISTS "Admins can delete any vendor_ad_order" ON public.vendor_ad_orders;
CREATE POLICY "Admins can delete any vendor_ad_order" ON public.vendor_ad_orders
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 10. MESSAGES - Allow admins to delete any message
DROP POLICY IF EXISTS "Admins can delete any message" ON public.messages;
CREATE POLICY "Admins can delete any message" ON public.messages
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 11. LEAD_UNLOCKS - Allow admins to delete any lead unlock
DROP POLICY IF EXISTS "Admins can delete any lead_unlock" ON public.lead_unlocks;
CREATE POLICY "Admins can delete any lead_unlock" ON public.lead_unlocks
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 12. FAVORITES - Allow admins to delete any favorite
DROP POLICY IF EXISTS "Admins can delete any favorite" ON public.favorites;
CREATE POLICY "Admins can delete any favorite" ON public.favorites
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 13. BUDGET_ITEMS - Allow admins to delete any budget item
DROP POLICY IF EXISTS "Admins can delete any budget_item" ON public.budget_items;
CREATE POLICY "Admins can delete any budget_item" ON public.budget_items
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 14. CHECKLIST_ITEMS - Allow admins to delete any checklist item
DROP POLICY IF EXISTS "Admins can delete any checklist_item" ON public.checklist_items;
CREATE POLICY "Admins can delete any checklist_item" ON public.checklist_items
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 15. TODOS - Allow admins to delete any todo
DROP POLICY IF EXISTS "Admins can delete any todo" ON public.todos;
CREATE POLICY "Admins can delete any todo" ON public.todos
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 16. SEATING_TABLES - Allow admins to delete any seating table
DROP POLICY IF EXISTS "Admins can delete any seating_table" ON public.seating_tables;
CREATE POLICY "Admins can delete any seating_table" ON public.seating_tables
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 17. GUESTS - Allow admins to delete any guest
DROP POLICY IF EXISTS "Admins can delete any guest" ON public.guests;
CREATE POLICY "Admins can delete any guest" ON public.guests
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 18. WEDDING_DETAILS - Allow admins to delete any wedding details
DROP POLICY IF EXISTS "Admins can delete any wedding_details" ON public.wedding_details;
CREATE POLICY "Admins can delete any wedding_details" ON public.wedding_details
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 19. CREDIT_REQUESTS - Allow admins to delete any credit request (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'credit_requests') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any credit_request" ON public.credit_requests';
    EXECUTE 'CREATE POLICY "Admins can delete any credit_request" ON public.credit_requests
    FOR DELETE
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin''
    )';
  END IF;
END $$;

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify all policies are created:
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE policyname LIKE '%Admins can delete%'
-- ORDER BY tablename;
