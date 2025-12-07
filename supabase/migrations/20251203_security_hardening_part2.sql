-- Security Hardening Migration Part 2
-- Date: 2025-12-03
-- Description: Enables RLS on remaining tables and fixes Security Definer views.

-- ============================================
-- 1. ENABLE RLS ON MISSING TABLES
-- ============================================

-- Leads
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

-- Reviews
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

-- Vendor Leads
ALTER TABLE IF EXISTS public.vendor_leads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. FIX SECURITY DEFINER VIEWS
-- ============================================
-- These views were flagged as "Security Definer". 
-- We change them to "Security Invoker" to respect the RLS policies of the user querying the view.

DO $$
BEGIN
    -- Fix admin_transactions_view
    IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'admin_transactions_view' AND schemaname = 'public') THEN
        ALTER VIEW public.admin_transactions_view SET (security_invoker = true);
    END IF;

    -- Fix budget_vs_actual
    IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'budget_vs_actual' AND schemaname = 'public') THEN
        ALTER VIEW public.budget_vs_actual SET (security_invoker = true);
    END IF;
END $$;
