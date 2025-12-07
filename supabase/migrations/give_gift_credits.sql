-- Give 10 gift credits to existing vendors who have 0 credits
UPDATE public.vendors
SET credit_balance = 10
WHERE credit_balance IS NULL OR credit_balance = 0;

-- Also sync vendor_profiles just in case
UPDATE public.vendor_profiles
SET credits = 10
WHERE credits IS NULL OR credits = 0;
