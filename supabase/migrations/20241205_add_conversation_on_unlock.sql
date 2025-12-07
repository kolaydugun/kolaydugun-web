-- Migration: Add conversation creation when vendor unlocks lead
-- This ensures vendors can immediately message couples after unlocking contact info

CREATE OR REPLACE FUNCTION public.unlock_lead(
    p_lead_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_vendor_id UUID;
    v_current_balance INTEGER;
    v_cost INTEGER;
    v_setting_value JSONB;
    v_couple_user_id UUID;
BEGIN
    -- Get the current user's ID
    v_vendor_id := auth.uid();
    
    -- 1. Determine the cost dynamically from system_settings
    SELECT value INTO v_setting_value
    FROM public.system_settings
    WHERE key = 'lead_unlock_cost';
    
    -- Robust casting: handle jsonb number or string
    -- If v_setting_value is null, use 5
    -- If it's a json number 5, #>> '{}' gives '5' -> cast to int 5
    -- If it's a json string "5", #>> '{}' gives '5' -> cast to int 5
    v_cost := COALESCE((v_setting_value #>> '{}')::integer, 5);

    -- 2. Check if already unlocked
    IF EXISTS (
        SELECT 1 FROM public.lead_unlocks 
        WHERE vendor_id = v_vendor_id AND lead_id = p_lead_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Lead already unlocked'
        );
    END IF;

    -- 3. Get current credit balance
    SELECT credit_balance INTO v_current_balance
    FROM public.vendors
    WHERE id = v_vendor_id;

    IF v_current_balance IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Vendor profile not found'
        );
    END IF;

    -- 4. Check sufficient funds
    IF v_current_balance < v_cost THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Insufficient credits',
            'required', v_cost,
            'current', v_current_balance
        );
    END IF;

    -- 5. Perform Transaction (Deduct credits & Record unlock)
    UPDATE public.vendors
    SET credit_balance = credit_balance - v_cost
    WHERE id = v_vendor_id;

    INSERT INTO public.lead_unlocks (vendor_id, lead_id, credits_spent)
    VALUES (v_vendor_id, p_lead_id, v_cost);

    -- 6. Create conversation for messaging
    -- Get the couple's user_id from the lead
    SELECT user_id INTO v_couple_user_id
    FROM public.leads
    WHERE id = p_lead_id;

    -- Create conversation if it doesn't exist
    IF v_couple_user_id IS NOT NULL THEN
        -- Check if conversation already exists to avoid ON CONFLICT issues
        IF NOT EXISTS (
            SELECT 1 FROM public.conversations
            WHERE vendor_id = v_vendor_id 
            AND user_id = v_couple_user_id 
            AND lead_id = p_lead_id
        ) THEN
            INSERT INTO public.conversations (vendor_id, user_id, lead_id, created_at, updated_at)
            VALUES (v_vendor_id, v_couple_user_id, p_lead_id, NOW(), NOW());
        END IF;
    END IF;

    -- 7. Return success with new balance
    RETURN jsonb_build_object(
        'success', true,
        'new_balance', v_current_balance - v_cost,
        'credits_spent', v_cost
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.unlock_lead(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_lead(UUID) TO service_role;
