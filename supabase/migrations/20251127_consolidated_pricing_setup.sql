-- 1. Create Tables (if they don't exist)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    credits integer NOT NULL,
    price decimal(10, 2) NOT NULL,
    currency text DEFAULT 'EUR',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id text PRIMARY KEY,
    name text NOT NULL,
    price_monthly decimal(10, 2) NOT NULL,
    price_yearly decimal(10, 2) NOT NULL,
    features jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Drop existing to avoid conflicts)
DROP POLICY IF EXISTS "Admin can manage system settings" ON public.system_settings;
CREATE POLICY "Admin can manage system settings" ON public.system_settings
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Authenticated users can read system settings" ON public.system_settings;
CREATE POLICY "Authenticated users can read system settings" ON public.system_settings
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin can manage credit packages" ON public.credit_packages;
CREATE POLICY "Admin can manage credit packages" ON public.credit_packages
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Public can read active credit packages" ON public.credit_packages;
CREATE POLICY "Public can read active credit packages" ON public.credit_packages
    FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage subscription plans" ON public.subscription_plans;
CREATE POLICY "Admin can manage subscription plans" ON public.subscription_plans
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Public can read active subscription plans" ON public.subscription_plans;
CREATE POLICY "Public can read active subscription plans" ON public.subscription_plans
    FOR SELECT TO anon, authenticated USING (is_active = true);

-- 4. Insert/Update Data (The New Pricing Strategy)

-- System Settings
INSERT INTO public.system_settings (key, value, description)
VALUES ('lead_unlock_cost', '5', 'Cost in credits to unlock a single lead contact info')
ON CONFLICT (key) DO UPDATE SET value = '5';

-- Clear existing packages to ensure clean slate
DELETE FROM public.credit_packages;

-- Insert New Logical Credit Packages
INSERT INTO public.credit_packages (name, credits, price, currency, is_active)
VALUES
    ('Başlangıç Paketi', 10, 25.00, 'EUR', true),   -- €2.50 per lead
    ('Standart Paket', 50, 100.00, 'EUR', true),    -- €2.00 per lead (20% discount)
    ('Pro Paket', 100, 180.00, 'EUR', true);        -- €1.80 per lead (28% discount)

-- Insert/Update Subscription Plans
INSERT INTO public.subscription_plans (id, name, price_monthly, price_yearly, features)
VALUES
    ('free', 'Free', 0.00, 0.00, '{
        "verified_badge": false,
        "top_placement": false,
        "social_links": false,
        "map_view": false,
        "monthly_free_credits": 0
    }'),
    ('premium', 'Premium', 29.00, 290.00, '{
        "verified_badge": true,
        "top_placement": true,
        "social_links": true,
        "map_view": true,
        "monthly_free_credits": 10
    }')
ON CONFLICT (id) DO UPDATE SET
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features;
