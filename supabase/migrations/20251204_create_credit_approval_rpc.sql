
-- Function to approve a transaction and add credits to vendor
CREATE OR REPLACE FUNCTION public.approve_transaction_admin(transaction_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    txn RECORD;
    v_user_id UUID;
    v_credits INTEGER;
BEGIN
    -- Get transaction details
    SELECT * INTO txn FROM public.transactions WHERE id = transaction_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
    END IF;

    IF txn.status = 'approved' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transaction already approved');
    END IF;

    -- Update transaction status
    UPDATE public.transactions
    SET status = 'approved', updated_at = NOW()
    WHERE id = transaction_id;

    -- Add credits to vendor
    -- Assuming credits_added is the column name in transactions, and user_id points to vendor
    -- And vendors table has credit_balance
    
    -- Check if credits_added exists, if not default to amount (or 0 if logic differs)
    -- For now assuming credits_added exists as per frontend code.
    
    v_credits := COALESCE(txn.credits_added, 0);
    v_user_id := txn.user_id;

    UPDATE public.vendors
    SET credit_balance = COALESCE(credit_balance, 0) + v_credits
    WHERE id = v_user_id; -- Note: user_id in transactions is the FK to vendors(id) based on recent fix

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Function to reject a transaction
CREATE OR REPLACE FUNCTION public.reject_transaction_admin(transaction_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.transactions
    SET status = 'rejected', updated_at = NOW()
    WHERE id = transaction_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
