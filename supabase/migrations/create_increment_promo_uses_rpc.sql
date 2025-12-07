CREATE OR REPLACE FUNCTION increment_promo_uses(code_input TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.promo_codes
  SET current_uses = current_uses + 1
  WHERE code = code_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
