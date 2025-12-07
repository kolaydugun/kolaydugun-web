-- 1. Fix RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions"
  ON transactions
  FOR SELECT
  USING (is_admin());

-- Allow admins to update transactions (approve/reject)
DROP POLICY IF EXISTS "Admins can update transactions" ON transactions;
CREATE POLICY "Admins can update transactions"
  ON transactions
  FOR UPDATE
  USING (is_admin());

-- 2. Add Foreign Key to profiles for easier joining
-- This assumes transactions.user_id exists. 
-- We add a constraint to link it to profiles.id so PostgREST can detect the relationship.

ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS fk_transactions_profiles;

ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;
