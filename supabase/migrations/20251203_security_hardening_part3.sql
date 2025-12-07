-- Security Hardening Migration Part 3
-- Date: 2025-12-03
-- Description: Fixes "Function Search Path Mutable" warnings by setting search_path to public for all identified functions.

DO $$
DECLARE
    func_name text;
    func_signature text;
    target_functions text[] := ARRAY[
        'generate_slug',
        'get_vendor_subscription',
        'create_notification',
        'delete_lead_admin',
        'get_admin_analytics',
        'toggle_featured_vendor',
        'notify_low_rating',
        'auto_assign_city_coordinates',
        'reject_transaction_admin',
        'approve_transaction_admin',
        'search_posts',
        'notify_new_vendor',
        'notify_high_value_lead',
        'notify_five_star_review',
        'is_admin',
        'get_posts_by_category',
        'get_related_posts',
        'get_posts_by_tag',
        'update_category_post_count',
        'update_tag_usage_count',
        'force_delete_vendor',
        'update_vendor_rating',
        'get_monthly_finance_summary',
        'auto_publish_scheduled_posts',
        'set_published_at',
        'track_post_view',
        'calculate_reading_time',
        'auto_update_reading_time',
        'get_popular_posts',
        'admin_delete_user',
        'process_recurring_expenses',
        'debug_get_vendor_references',
        'submit_rsvp',
        'unlock_lead',
        'delete_post_admin',
        'process_recurring_income',
        'update_post_comment_count',
        'approve_comment',
        'reject_comment',
        'mark_comment_spam',
        'bulk_approve_comments',
        'get_pending_comments_count',
        'check_comment_spam',
        'delete_page_admin',
        'handle_new_user'
    ];
BEGIN
    -- Loop through each function name
    FOREACH func_name IN ARRAY target_functions
    LOOP
        -- Find all functions with this name in public schema (handles overloads)
        FOR func_signature IN 
            SELECT oid::regprocedure::text
            FROM pg_proc
            WHERE proname = func_name
            AND pronamespace = 'public'::regnamespace
        LOOP
            -- Execute ALTER FUNCTION for each signature
            EXECUTE format('ALTER FUNCTION %s SET search_path = public', func_signature);
            RAISE NOTICE 'Fixed search_path for: %', func_signature;
        END LOOP;
    END LOOP;
END $$;
