-- Admin Messaging System Tables
-- This migration creates tables for direct messaging between admin and users (vendors/couples)

-- Table: admin_conversations
-- Stores conversation metadata between admin and users
CREATE TABLE IF NOT EXISTS admin_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_type TEXT CHECK (user_type IN ('vendor', 'couple', 'admin')),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(admin_id, user_id)
);

-- Table: admin_messages
-- Stores individual messages within conversations
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES admin_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_conversations_admin_id ON admin_conversations(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_conversations_user_id ON admin_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_conversations_last_message ON admin_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_messages_conversation_id ON admin_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_messages_receiver_id ON admin_messages(receiver_id);

-- RLS Policies
ALTER TABLE admin_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view conversations they're part of
CREATE POLICY "Users can view their own conversations"
    ON admin_conversations FOR SELECT
    USING (auth.uid() = admin_id OR auth.uid() = user_id);

-- Policy: Users can create conversations
CREATE POLICY "Users can create conversations"
    ON admin_conversations FOR INSERT
    WITH CHECK (auth.uid() = admin_id OR auth.uid() = user_id);

-- Policy: Users can update conversations they're part of
CREATE POLICY "Users can update their conversations"
    ON admin_conversations FOR UPDATE
    USING (auth.uid() = admin_id OR auth.uid() = user_id);

-- Policy: Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
    ON admin_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_conversations
            WHERE id = admin_messages.conversation_id
            AND (admin_id = auth.uid() OR user_id = auth.uid())
        )
    );

-- Policy: Users can send messages in their conversations
CREATE POLICY "Users can send messages in their conversations"
    ON admin_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM admin_conversations
            WHERE id = conversation_id
            AND (admin_id = auth.uid() OR user_id = auth.uid())
        )
    );

-- Policy: Users can update their own messages (for read receipts)
CREATE POLICY "Users can update messages sent to them"
    ON admin_messages FOR UPDATE
    USING (auth.uid() = receiver_id);
