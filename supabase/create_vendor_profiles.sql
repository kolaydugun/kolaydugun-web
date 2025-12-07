-- Create vendor_profiles table
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
  credits INTEGER DEFAULT 0, -- Used for credit system
  whatsapp_number TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Vendors can view own profile"
  ON public.vendor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update own profile"
  ON public.vendor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert own profile"
  ON public.vendor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
