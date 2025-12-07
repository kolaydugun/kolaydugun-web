-- Part 2: Enable RLS and Create Policies
-- Run this AFTER Part 1

-- Enable RLS
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
