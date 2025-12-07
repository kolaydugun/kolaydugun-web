
-- Enable RLS on transactions table (if not already enabled)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy for Admins: View ALL transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (
  auth.jwt() ->> 'user_role' = 'admin' OR 
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy for Admins: Update transactions (approve/reject)
CREATE POLICY "Admins can update transactions"
ON public.transactions
FOR UPDATE
USING (
  auth.jwt() ->> 'user_role' = 'admin' OR 
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy for Vendors: View own transactions
CREATE POLICY "Vendors can view own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for Vendors: Insert own transactions (for credit purchase)
CREATE POLICY "Vendors can insert own transactions"
ON public.transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);
