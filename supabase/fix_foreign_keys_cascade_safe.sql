-- ============================================
-- FIX FOREIGN KEYS TO CASCADE DELETE (SAFE VERSION)
-- Checks if columns exist before altering constraints
-- ============================================

-- 1. Vendors
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'id') THEN
    ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_id_fkey;
    ALTER TABLE public.vendors ADD CONSTRAINT vendors_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Vendor Profiles
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vendor_profiles' AND column_name = 'user_id') THEN
    ALTER TABLE public.vendor_profiles DROP CONSTRAINT IF EXISTS vendor_profiles_user_id_fkey;
    ALTER TABLE public.vendor_profiles ADD CONSTRAINT vendor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Transactions
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'vendor_id') THEN
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_vendor_id_fkey;
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Leads
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'user_id') THEN
    ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_user_id_fkey;
    ALTER TABLE public.leads ADD CONSTRAINT leads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Vendor Leads
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vendor_leads' AND column_name = 'vendor_id') THEN
    ALTER TABLE public.vendor_leads DROP CONSTRAINT IF EXISTS vendor_leads_vendor_id_fkey;
    ALTER TABLE public.vendor_leads ADD CONSTRAINT vendor_leads_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Posts
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_id') THEN
    ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
    ALTER TABLE public.posts ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 7. Messages (Sender)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id') THEN
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
    ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 8. Messages (Receiver)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'receiver_id') THEN
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
    ALTER TABLE public.messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 9. Favorites
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'favorites' AND column_name = 'user_id') THEN
    ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
    ALTER TABLE public.favorites ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 10. Featured Listings
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'featured_listings' AND column_name = 'vendor_id') THEN
    ALTER TABLE public.featured_listings DROP CONSTRAINT IF EXISTS featured_listings_vendor_id_fkey;
    ALTER TABLE public.featured_listings ADD CONSTRAINT featured_listings_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 11. Lead Unlocks
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'lead_unlocks' AND column_name = 'vendor_id') THEN
    ALTER TABLE public.lead_unlocks DROP CONSTRAINT IF EXISTS lead_unlocks_vendor_id_fkey;
    ALTER TABLE public.lead_unlocks ADD CONSTRAINT lead_unlocks_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 12. Budget Items
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'user_id') THEN
    ALTER TABLE public.budget_items DROP CONSTRAINT IF EXISTS budget_items_user_id_fkey;
    ALTER TABLE public.budget_items ADD CONSTRAINT budget_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 13. Checklist Items
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'checklist_items' AND column_name = 'user_id') THEN
    ALTER TABLE public.checklist_items DROP CONSTRAINT IF EXISTS checklist_items_user_id_fkey;
    ALTER TABLE public.checklist_items ADD CONSTRAINT checklist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 14. Todos
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'user_id') THEN
    ALTER TABLE public.todos DROP CONSTRAINT IF EXISTS todos_user_id_fkey;
    ALTER TABLE public.todos ADD CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 15. Seating Tables
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'seating_tables' AND column_name = 'user_id') THEN
    ALTER TABLE public.seating_tables DROP CONSTRAINT IF EXISTS seating_tables_user_id_fkey;
    ALTER TABLE public.seating_tables ADD CONSTRAINT seating_tables_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 16. Guests
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'user_id') THEN
    ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_user_id_fkey;
    ALTER TABLE public.guests ADD CONSTRAINT guests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 17. Wedding Details
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'wedding_details' AND column_name = 'user_id') THEN
    ALTER TABLE public.wedding_details DROP CONSTRAINT IF EXISTS wedding_details_user_id_fkey;
    ALTER TABLE public.wedding_details ADD CONSTRAINT wedding_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
