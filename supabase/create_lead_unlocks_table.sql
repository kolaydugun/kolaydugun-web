-- Create lead_unlocks table
CREATE TABLE IF NOT EXISTS public.lead_unlocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Assuming vendor_id is auth.uid()
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, lead_id)
);

-- Enable RLS
ALTER TABLE public.lead_unlocks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Vendors can view their own unlocks" ON public.lead_unlocks
FOR SELECT TO authenticated
USING (auth.uid() = vendor_id);

-- Stored Procedure to unlock lead
CREATE OR REPLACE FUNCTION public.unlock_lead(
    p_lead_id UUID,
    p_cost INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_vendor_id UUID;
    v_current_credits INTEGER;
    v_lead_exists BOOLEAN;
BEGIN
    -- Get vendor ID from auth
    v_vendor_id := auth.uid();

    -- Check if lead exists
    SELECT EXISTS(SELECT 1 FROM public.leads WHERE id = p_lead_id) INTO v_lead_exists;
    IF NOT v_lead_exists THEN
        RETURN jsonb_build_object('success', false, 'message', 'Lead not found');
    END IF;

    -- Check if already unlocked
    IF EXISTS(SELECT 1 FROM public.lead_unlocks WHERE vendor_id = v_vendor_id AND lead_id = p_lead_id) THEN
        RETURN jsonb_build_object('success', true, 'message', 'Already unlocked');
    END IF;

    -- Get current credits
    SELECT credits INTO v_current_credits FROM public.vendor_profiles WHERE user_id = v_vendor_id;
    
    IF v_current_credits IS NULL OR v_current_credits < p_cost THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient credits');
    END IF;

    -- Deduct credits
    UPDATE public.vendor_profiles
    SET credits = credits - p_cost
    WHERE user_id = v_vendor_id;

    -- Create unlock record
    INSERT INTO public.lead_unlocks (vendor_id, lead_id)
    VALUES (v_vendor_id, p_lead_id);

    -- Create transaction record
    INSERT INTO public.transactions (user_id, amount, credits_added, type, description)
    VALUES (v_vendor_id, 0, -p_cost, 'usage', 'Lead unlock');

    RETURN jsonb_build_object('success', true, 'new_balance', v_current_credits - p_cost);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
