-- Fix admin access to messages table
-- Admin should be able to see all messages for monitoring

-- First, check if admin policy exists and drop it
DROP POLICY IF EXISTS "admins_view_all_messages" ON public.messages;

-- Create policy for admins to view all messages
CREATE POLICY "admins_view_all_messages" ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
