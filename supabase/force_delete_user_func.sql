-- ============================================
-- FORCE DELETE USER FUNCTION
-- Manually deletes all related records before deleting the user
-- This bypasses foreign key constraints by cleaning up children first
-- ============================================

CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if executor is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  -- 1. Delete from child tables (Manual Cascade)
  
  -- Vendor related
  DELETE FROM public.transactions WHERE vendor_id = target_user_id;
  DELETE FROM public.vendor_leads WHERE vendor_id = target_user_id;
  DELETE FROM public.featured_listings WHERE vendor_id = target_user_id;
  DELETE FROM public.lead_unlocks WHERE vendor_id = target_user_id;
  DELETE FROM public.vendor_ad_orders WHERE vendor_id = target_user_id;
  DELETE FROM public.vendor_profiles WHERE user_id = target_user_id;
  DELETE FROM public.vendors WHERE id = target_user_id;
  
  -- User related
  DELETE FROM public.leads WHERE user_id = target_user_id;
  DELETE FROM public.posts WHERE author_id = target_user_id;
  DELETE FROM public.favorites WHERE user_id = target_user_id;
  DELETE FROM public.messages WHERE sender_id = target_user_id OR receiver_id = target_user_id;
  
  -- Planning tools
  DELETE FROM public.budget_items WHERE user_id = target_user_id;
  DELETE FROM public.checklist_items WHERE user_id = target_user_id;
  DELETE FROM public.todos WHERE user_id = target_user_id;
  DELETE FROM public.seating_tables WHERE user_id = target_user_id;
  DELETE FROM public.guests WHERE user_id = target_user_id;
  DELETE FROM public.wedding_details WHERE user_id = target_user_id;

  -- 2. Finally delete the profile
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- 3. Delete from auth.users (Supabase handles this usually via trigger on profiles, but let's be safe)
  -- Note: We cannot delete from auth.users directly via RLS usually, 
  -- but deleting from profiles should trigger the cascade if configured correctly.
  -- If not, the profile deletion is the main part we care about for the app.

  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
