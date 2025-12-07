-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    code VARCHAR(50) PRIMARY KEY,
    discount_type VARCHAR(20) NOT NULL, -- 'free_premium', 'discount_percent', 'discount_amount'
    discount_value INTEGER NOT NULL, -- months for free_premium, percentage, or amount
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read active promo codes"
    ON public.promo_codes FOR SELECT
    USING (is_active = true);

-- Insert initial codes
INSERT INTO public.promo_codes (code, discount_type, discount_value, max_uses, expires_at)
VALUES
('EARLY100', 'free_premium', 6, 100, '2025-12-31 23:59:59+00'),
('FOUNDING50', 'free_premium', 12, 50, '2025-12-31 23:59:59+00')
ON CONFLICT (code) DO NOTHING;
