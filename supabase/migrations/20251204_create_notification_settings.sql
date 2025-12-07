-- Migration: create user_notification_settings table
-- 20251204_create_notification_settings.sql

CREATE TABLE IF NOT EXISTS public.user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own notification settings" ON public.user_notification_settings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own notification settings" ON public.user_notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own settings (if not exists)
CREATE POLICY "Users can insert own notification settings" ON public.user_notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_settings_timestamp
    BEFORE UPDATE ON public.user_notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_settings_updated_at();
