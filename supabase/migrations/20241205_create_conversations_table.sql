-- Migration: Create conversations table for vendor-user messaging
-- This table is referenced by the unlock_lead function

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    
    -- Ensure unique conversation per vendor-user-lead combination
    UNIQUE(vendor_id, user_id, lead_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_vendor_id ON public.conversations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON public.conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Vendors can view conversations they're part of
CREATE POLICY "Vendors can view their conversations"
    ON public.conversations FOR SELECT
    USING (vendor_id = auth.uid());

-- Users can view conversations they're part of
CREATE POLICY "Users can view their conversations"
    ON public.conversations FOR SELECT
    USING (user_id = auth.uid());

-- Vendors can create conversations
CREATE POLICY "Vendors can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (vendor_id = auth.uid());

-- Users can create conversations
CREATE POLICY "Users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Vendors can update their conversations
CREATE POLICY "Vendors can update their conversations"
    ON public.conversations FOR UPDATE
    USING (vendor_id = auth.uid());

-- Users can update their conversations
CREATE POLICY "Users can update their conversations"
    ON public.conversations FOR UPDATE
    USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
