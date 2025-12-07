-- 1. Add credit_balance to vendors table if it doesn't exist
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS credit_balance INTEGER DEFAULT 0;

-- 2. Fix approve_transaction_admin RPC to use vendors table
CREATE OR REPLACE FUNCTION approve_transaction_admin(transaction_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_current_user_id UUID;
  v_user_role TEXT;
  v_txn RECORD;
BEGIN
  v_current_user_id := auth.uid();
  
  -- Check Admin Role
  SELECT role INTO v_user_role FROM profiles WHERE id = v_current_user_id;
  IF v_user_role IS DISTINCT FROM 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get Transaction
  SELECT * INTO v_txn FROM transactions WHERE id = transaction_id;
  
  IF v_txn IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
  END IF;

  IF v_txn.status = 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction already approved');
  END IF;

  -- Update Transaction Status
  UPDATE transactions 
  SET status = 'approved' 
  WHERE id = transaction_id;

  -- Add Credits to Vendor (using vendors table now)
  -- We use user_id to find the vendor, assuming 1:1 relationship or user_id matches vendor.id (which it does in our schema)
  UPDATE vendors
  SET credit_balance = COALESCE(credit_balance, 0) + v_txn.credits_added
  WHERE id = v_txn.user_id; -- vendors.id matches auth.users.id

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
