-- 1. Add status column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved'; -- Default to approved for existing records

-- 2. Create RPC for Admin Approval
CREATE OR REPLACE FUNCTION approve_transaction_admin(transaction_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_current_user_id UUID;
  v_user_role TEXT;
  v_txn RECORD;
  v_new_balance INT;
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

  -- Add Credits to Vendor Profile
  UPDATE vendor_profiles
  SET credit_balance = credit_balance + v_txn.credits_added
  WHERE user_id = v_txn.user_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create RPC for Admin Rejection
CREATE OR REPLACE FUNCTION reject_transaction_admin(transaction_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_current_user_id UUID;
  v_user_role TEXT;
BEGIN
  v_current_user_id := auth.uid();
  
  -- Check Admin Role
  SELECT role INTO v_user_role FROM profiles WHERE id = v_current_user_id;
  IF v_user_role IS DISTINCT FROM 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Update Transaction Status
  UPDATE transactions 
  SET status = 'rejected' 
  WHERE id = transaction_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
