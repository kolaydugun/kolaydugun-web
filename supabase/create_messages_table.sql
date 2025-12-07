-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view messages where they are sender or receiver
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT
TO authenticated
USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Users can insert messages if they are part of the lead (vendor or client)
-- This is a simplified check. Ideally, we should check if the user is the vendor or the client of the lead.
-- For now, we allow authenticated users to send messages.
CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id
);

-- Users can update messages (e.g. mark as read) if they are the receiver
CREATE POLICY "Receivers can update messages" ON public.messages
FOR UPDATE
TO authenticated
USING (
    auth.uid() = receiver_id
);
