-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create credit_packages table
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

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id text PRIMARY KEY, -- e.g. 'free', 'premium'
    name text NOT NULL,
    price_monthly decimal(10, 2) NOT NULL,
    price_yearly decimal(10, 2) NOT NULL,
    features jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_settings
-- Admin can do everything
CREATE POLICY "Admin can manage system settings" ON public.system_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Authenticated users can read settings (e.g. to know lead cost)
CREATE POLICY "Authenticated users can read system settings" ON public.system_settings
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for credit_packages
-- Admin can manage
CREATE POLICY "Admin can manage credit packages" ON public.credit_packages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Public can read active packages
CREATE POLICY "Public can read active credit packages" ON public.credit_packages
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- RLS Policies for subscription_plans
-- Admin can manage
CREATE POLICY "Admin can manage subscription plans" ON public.subscription_plans
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Public can read active plans
CREATE POLICY "Public can read active subscription plans" ON public.subscription_plans
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Seed Data

-- System Settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('lead_unlock_cost', '5', 'Cost in credits to unlock a single lead contact info')
ON CONFLICT (key) DO NOTHING;

-- Credit Packages
INSERT INTO public.credit_packages (name, credits, price, currency)
VALUES
    ('Starter', 10, 45.00, 'EUR'),
    ('Pro', 50, 200.00, 'EUR'),
    ('Enterprise', 100, 350.00, 'EUR');

-- Subscription Plans
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
ON CONFLICT (id) DO NOTHING;
