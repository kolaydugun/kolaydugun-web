-- Create lead_unlocks table to track which vendors have unlocked which leads
CREATE TABLE IF NOT EXISTS lead_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  credits_spent INTEGER NOT NULL DEFAULT 5,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, lead_id)
);

-- Enable RLS on lead_unlocks
ALTER TABLE lead_unlocks ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own unlocks
CREATE POLICY "Vendors can view own unlocks" ON lead_unlocks
  FOR SELECT
  USING (vendor_id = auth.uid());

-- Vendors can insert their own unlocks (via RPC)
CREATE POLICY "Vendors can insert own unlocks" ON lead_unlocks
  FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

-- Create unlock_lead RPC function for vendors to unlock lead contact information
CREATE OR REPLACE FUNCTION unlock_lead(p_lead_id UUID, p_cost INTEGER)
RETURNS JSONB AS $$
DECLARE
  v_vendor_id UUID;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Get current vendor ID
  v_vendor_id := auth.uid();
  
  IF v_vendor_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;

  -- Check if already unlocked
  SELECT EXISTS (
    SELECT 1 FROM lead_unlocks
    WHERE vendor_id = v_vendor_id AND lead_id = p_lead_id
  ) INTO v_already_unlocked;

  IF v_already_unlocked THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Lead already unlocked'
    );
  END IF;

  -- Get current credit balance from vendors table
  SELECT COALESCE(credit_balance, 0) INTO v_current_balance
  FROM vendors
  WHERE id = v_vendor_id;

  -- Check if vendor has enough credits
  IF v_current_balance < p_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient credits. Current balance: ' || v_current_balance
    );
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_cost;

  -- Deduct credits from vendor
  UPDATE vendors
  SET credit_balance = v_new_balance
  WHERE id = v_vendor_id;

  -- Record the unlock
  INSERT INTO lead_unlocks (vendor_id, lead_id, credits_spent)
  VALUES (v_vendor_id, p_lead_id, p_cost);

  -- Return success with new balance
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'message', 'Lead unlocked successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
