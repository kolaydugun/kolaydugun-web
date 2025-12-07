-- Adminlerin kullanıcı şifresini değiştirebilmesi için güvenli fonksiyon
-- Bu fonksiyon auth.users tablosuna doğrudan erişir, bu yüzden SECURITY DEFINER kullanılır.
-- Sadece 'admin' rolüne sahip kullanıcılar tarafından çalıştırılabilir.

-- pgcrypto eklentisinin açık olduğundan emin olalım
-- Adminlerin kullanıcı şifresini değiştirebilmesi için güvenli fonksiyon
-- Bu fonksiyon auth.users tablosuna doğrudan erişir, bu yüzden SECURITY DEFINER kullanılır.
-- Sadece 'admin' rolüne sahip kullanıcılar tarafından çalıştırılabilir.

-- pgcrypto eklentisinin açık olduğundan emin olalım
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION admin_set_user_password(target_user_id UUID, new_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  is_admin BOOLEAN;
  new_hash TEXT;
BEGIN
  -- 1. Check if the caller is an admin
  -- We check public.profiles because that's where the app manages roles
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) INTO is_admin;

  -- Fallback: Check metadata if not found in profiles (just in case)
  IF NOT is_admin THEN
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    ) INTO is_admin;
  END IF;

  IF NOT is_admin THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized action: Only admins can change passwords.');
  END IF;

  -- 2. Generate hash
  new_hash := crypt(new_password, gen_salt('bf', 10));

  -- 3. Update the password and other necessary fields
  -- We ensure:
  -- - Password is updated
  -- - Email is confirmed
  -- - User is NOT banned
  -- - 'email' provider is present in metadata (fixes issues if user signed up via Google but wants to use password)
  UPDATE auth.users
  SET 
    encrypted_password = new_hash,
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    banned_until = NULL,
    updated_at = now(),
    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider": "email", "providers": ["email"]}'::jsonb
  WHERE id = target_user_id;

  IF FOUND THEN
    RETURN json_build_object('success', true, 'message', 'Password updated successfully.', 'debug_hash', new_hash);
  ELSE
    RETURN json_build_object('success', false, 'error', 'User not found.');
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
