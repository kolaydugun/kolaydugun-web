-- Create credit_packages table
CREATE TABLE IF NOT EXISTS public.credit_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default packages
INSERT INTO public.credit_packages (name, credits, price) VALUES
('Başlangıç Paketi', 10, 29.90),
('Standart Paket', 50, 119.90),
('Pro Paket', 100, 199.90),
('Kurumsal Paket', 500, 899.90)
ON CONFLICT DO NOTHING;

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    package_id UUID REFERENCES public.credit_packages(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    credits_added INTEGER NOT NULL,
    type TEXT CHECK (type IN ('credit_purchase', 'usage', 'refund', 'bonus')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add credits column to vendor_profiles if not exists
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Credit Packages (Public read)
CREATE POLICY "Everyone can view credit packages" ON public.credit_packages FOR SELECT TO authenticated, anon USING (true);

-- Transactions (Users view their own)
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Transactions (Users can insert purchase records - in real app this should be server-side only)
-- For this demo, we allow authenticated users to insert 'credit_purchase' transactions
CREATE POLICY "Users can create purchase transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
