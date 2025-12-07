-- Add admin delete policy for messages
DROP POLICY IF EXISTS "admins_delete_messages" ON public.messages;

CREATE POLICY "admins_delete_messages" ON public.messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
