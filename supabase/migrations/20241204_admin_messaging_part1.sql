-- Part 1: Create Tables and Indexes
-- Run this first

-- Table: admin_conversations
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
