-- Update System Settings (Ensure Lead Cost is 5)
INSERT INTO public.system_settings (key, value, description)
VALUES ('lead_unlock_cost', '5', 'Cost in credits to unlock a single lead contact info')
ON CONFLICT (key) DO UPDATE SET value = '5';

-- Clear existing packages to reset with new logical pricing
DELETE FROM public.credit_packages;

-- Insert New Logical Credit Packages
INSERT INTO public.credit_packages (name, credits, price, currency, is_active)
VALUES
    ('Başlangıç Paketi', 10, 25.00, 'EUR', true),   -- €2.50 per lead
    ('Standart Paket', 50, 100.00, 'EUR', true),    -- €2.00 per lead (20% discount)
    ('Pro Paket', 100, 180.00, 'EUR', true);        -- €1.80 per lead (28% discount)

-- Update Subscription Plans
UPDATE public.subscription_plans
SET 
    price_monthly = 29.00,
    price_yearly = 290.00,
    features = jsonb_set(
        features, 
        '{monthly_free_credits}', 
        '10'
    )
WHERE id = 'premium';

UPDATE public.subscription_plans
SET 
    price_monthly = 0.00,
    price_yearly = 0.00,
    features = jsonb_set(
        features, 
        '{monthly_free_credits}', 
        '0'
    )
WHERE id = 'free';
