
-- Create credit_requests table
CREATE TABLE IF NOT EXISTS public.credit_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.credit_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Vendors can view their own credit requests" 
ON public.credit_requests FOR SELECT 
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create credit requests" 
ON public.credit_requests FOR INSERT 
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Admins can view all credit requests" 
ON public.credit_requests FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update credit requests" 
ON public.credit_requests FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
