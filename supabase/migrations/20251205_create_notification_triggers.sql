-- Migration: create notification triggers for quotes and messages
-- 20251205_create_notification_triggers.sql

-- 1. Make created_by nullable in admin_notifications to allow system-generated notifications
ALTER TABLE public.admin_notifications ALTER COLUMN created_by DROP NOT NULL;

-- 2. Function to handle New Quote Request Notification
CREATE OR REPLACE FUNCTION public.handle_new_quote_notification()
RETURNS TRIGGER AS $$
DECLARE
    contact_name_text TEXT;
    notif_id UUID;
    target_user_id UUID;
BEGIN
    -- Get contact name from leads table
    SELECT contact_name, user_id INTO contact_name_text, target_user_id
    FROM public.leads
    WHERE id = NEW.lead_id;

    -- If no user_id on lead (guest), we can't capture sender ID easily, so leave created_by null
    -- Insert into admin_notifications (System Notification specific to this event)
    -- Prepare notification title and message with JSON payload for localization
    -- Use jsonb_build_object for safe JSON generation
    INSERT INTO public.admin_notifications (
        title,
        message,
        type,
        target_type,
        created_by
    ) VALUES (
        jsonb_build_object('key', 'dashboard.notifications.new_quote_title'),
        jsonb_build_object('key', 'dashboard.notifications.new_quote_message', 'args', jsonb_build_object('name', COALESCE(contact_name_text, 'Misafir'))),
        'system',
        'custom', -- Targeted to specific user
        target_user_id -- Can be NULL if guest
    ) RETURNING id INTO notif_id;

    -- Link to Vendor (The Recipient)
    INSERT INTO public.user_notifications (user_id, notification_id, notification, is_read, created_at, related_lead_id)
    VALUES (
        NEW.vendor_id, 
        notif_id,
        jsonb_build_object(
            'type', 'system',
            'title', jsonb_build_object('key', 'dashboard.notifications.new_quote_title'),
            'message', jsonb_build_object('key', 'dashboard.notifications.new_quote_message', 'args', jsonb_build_object('name', COALESCE(contact_name_text, 'Misafir')))
        ),
        false,
        NOW(),
        NEW.lead_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for New Quote
DROP TRIGGER IF EXISTS on_quote_received ON public.vendor_leads;
CREATE TRIGGER on_quote_received
AFTER INSERT ON public.vendor_leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_quote_notification();


-- 3. Function to handle New Message Notification
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    notif_id UUID;
BEGIN
    -- Try to get business_name if it's a vendor
    SELECT business_name INTO sender_name
    FROM public.vendors
    WHERE user_id = NEW.sender_id;

    -- If not found (or null), try profile (couple or admin)
    IF sender_name IS NULL THEN
        SELECT COALESCE(first_name || ' ' || last_name, email) INTO sender_name
        FROM public.users -- Assuming 'users' view
        WHERE id = NEW.sender_id;
        
        -- If still null
        IF sender_name IS NULL THEN
             SELECT COALESCE(first_name || ' ' || last_name, 'Kullanıcı') INTO sender_name
             FROM public.profiles
             WHERE id = NEW.sender_id;
        END IF;
    END IF;

    -- Fallback
    sender_name := COALESCE(sender_name, 'Bir Kullanıcı');

    -- Insert Notification
    INSERT INTO public.admin_notifications (
        title,
        message,
        type,
        target_type,
        created_by
    ) VALUES (
        jsonb_build_object('key', 'dashboard.notifications.new_message_title'),
        jsonb_build_object('key', 'dashboard.notifications.new_message_message', 'args', jsonb_build_object('name', sender_name)),
        'system',
        'custom',
        NEW.sender_id
    ) RETURNING id INTO notif_id;

    -- Link to Receiver
    INSERT INTO public.user_notifications (user_id, notification_id, notification, is_read, created_at, related_lead_id)
    VALUES (
        NEW.receiver_id, 
        notif_id,
        jsonb_build_object(
            'type', 'system',
            'title', jsonb_build_object('key', 'dashboard.notifications.new_message_title'),
            'message', jsonb_build_object('key', 'dashboard.notifications.new_message_message', 'args', jsonb_build_object('name', sender_name))
        ),
        false,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for New Message
DROP TRIGGER IF EXISTS on_message_received ON public.admin_messages;
CREATE TRIGGER on_message_received
AFTER INSERT ON public.admin_messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_message_notification();
