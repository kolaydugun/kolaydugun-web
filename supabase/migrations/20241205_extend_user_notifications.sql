-- Migration: Extend user_notifications table to support message notifications
-- 20241205_extend_user_notifications.sql

-- Add new columns to user_notifications table
ALTER TABLE public.user_notifications
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'admin_announcement' CHECK (type IN ('admin_announcement', 'new_message')),
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS related_conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS related_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE;

-- Make notification_id nullable (it will be NULL for message notifications)
ALTER TABLE public.user_notifications
ALTER COLUMN notification_id DROP NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read 
ON public.user_notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_user_notifications_conversation 
ON public.user_notifications(related_conversation_id) 
WHERE related_conversation_id IS NOT NULL;

-- Update RLS policy to allow users to insert their own message notifications
-- First, drop the existing policies if they exist
DROP POLICY IF EXISTS "users can read own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "users can create message notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "users can update own notifications" ON public.user_notifications;

-- Recreate SELECT policy
CREATE POLICY "users can read own notifications" ON public.user_notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Add INSERT policy for message notifications
CREATE POLICY "users can create message notifications" ON public.user_notifications
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        type = 'new_message' AND
        notification_id IS NULL
    );

-- Add UPDATE policy for marking as read
CREATE POLICY "users can update own notifications" ON public.user_notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.user_notifications TO authenticated;

-- Add comment for documentation
COMMENT ON COLUMN public.user_notifications.type IS 'Type of notification: admin_announcement or new_message';
COMMENT ON COLUMN public.user_notifications.title IS 'Title for message notifications (sender name)';
COMMENT ON COLUMN public.user_notifications.message IS 'Message preview for message notifications';
COMMENT ON COLUMN public.user_notifications.related_conversation_id IS 'FK to conversations table for message notifications';
COMMENT ON COLUMN public.user_notifications.related_message_id IS 'FK to messages table for message notifications';
