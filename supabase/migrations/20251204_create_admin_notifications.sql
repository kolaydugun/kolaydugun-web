-- Migration: create admin_notifications, user_notifications, admin_conversations, admin_messages tables
-- 20251204_create_admin_notifications.sql

-- 1. admin_notifications: admin gönderdiği duyurular
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('announcement','campaign','system')) NOT NULL,
    target_type TEXT CHECK (target_type IN ('all','couples','vendors','category','city','custom')) NOT NULL,
    target_category_id UUID,
    target_city TEXT,
    send_email BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    expires_at TIMESTAMP
);

-- 2. user_notifications: her kullanıcıya kopya
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    notification_id UUID REFERENCES public.admin_notifications(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- 3. admin_conversations: admin ile tekil konuşma
CREATE TABLE IF NOT EXISTS public.admin_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    is_job_related BOOLEAN DEFAULT FALSE
);

-- 4. admin_messages: admin ve kullanıcı arasındaki mesajlar
CREATE TABLE IF NOT EXISTS public.admin_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.admin_conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    message TEXT NOT NULL,
    is_admin_sender BOOLEAN NOT NULL,
    is_job_offer BOOLEAN DEFAULT FALSE,
    job_details JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- RLS Policies (admin only can insert notifications, users can read their own notifications)

-- admin_notifications: only admin (role = 'admin') can insert/update/delete
CREATE POLICY "admin can manage notifications" ON public.admin_notifications
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- user_notifications: users can select their own rows
CREATE POLICY "users can read own notifications" ON public.user_notifications
    FOR SELECT USING (auth.uid() = user_id);

-- admin_conversations: users can select their own conversations
CREATE POLICY "users can read own conversations" ON public.admin_conversations
    FOR SELECT USING (auth.uid() = user_id);

-- admin_messages: users can read/write messages where they are sender or receiver
CREATE POLICY "users can access their messages" ON public.admin_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "users can insert their messages" ON public.admin_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Enable row level security
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
