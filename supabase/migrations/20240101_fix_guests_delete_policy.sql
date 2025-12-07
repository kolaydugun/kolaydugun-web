-- Add DELETE policy for guests table to allow users to delete their own guests

-- Enable RLS on guests table if not already enabled
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can manage their own guests" ON public.guests;

-- Create comprehensive policy for guests table
CREATE POLICY "Users can manage their own guests" ON public.guests
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.guests TO authenticated;
