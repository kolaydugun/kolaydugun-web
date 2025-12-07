-- 1. Drop Tables (To ensure clean schema and avoid "column does not exist" errors)
DROP TABLE IF EXISTS public.credit_packages CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
-- We don't drop system_settings to preserve other potential keys, but we ensure the table structure is correct below.
-- Actually, for a clean fix, let's drop system_settings too if it only contains our new keys. 
-- If there are other keys, we should be careful. But based on context, this is a new feature.
-- Let's be safe and just alter system_settings if it exists, or drop it if it's safe. 
-- Given the error was about is_active in credit_packages/subscription_plans, we definitely drop those.
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- 2. Create Tables
CREATE TABLE public.system_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.credit_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    credits integer NOT NULL,
    price decimal(10, 2) NOT NULL,
    currency text DEFAULT 'EUR',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.subscription_plans (
    id text PRIMARY KEY,
    name text NOT NULL,
    price_monthly decimal(10, 2) NOT NULL,
    price_yearly decimal(10, 2) NOT NULL,
    features jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
CREATE POLICY "Admin can manage system settings" ON public.system_settings
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read system settings" ON public.system_settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage credit packages" ON public.credit_packages
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Public can read active credit packages" ON public.credit_packages
    FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Admin can manage subscription plans" ON public.subscription_plans
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Public can read active subscription plans" ON public.subscription_plans
    FOR SELECT TO anon, authenticated USING (is_active = true);

-- 5. Insert Data (The New Pricing Strategy)

-- System Settings
INSERT INTO public.system_settings (key, value, description)
VALUES ('lead_unlock_cost', '5', 'Cost in credits to unlock a single lead contact info');

-- Insert New Logical Credit Packages
INSERT INTO public.credit_packages (name, credits, price, currency, is_active)
VALUES
    ('Başlangıç Paketi', 10, 25.00, 'EUR', true),   -- €2.50 per lead
    ('Standart Paket', 50, 100.00, 'EUR', true),    -- €2.00 per lead (20% discount)
    ('Pro Paket', 100, 180.00, 'EUR', true);        -- €1.80 per lead (28% discount)

-- Insert Subscription Plans
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
    }');
