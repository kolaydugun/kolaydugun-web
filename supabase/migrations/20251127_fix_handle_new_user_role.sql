-- Replace handle_new_user function to correctly assign roles from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
BEGIN
  -- Get role from metadata, default to 'couple' if missing or null
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'couple');

  -- Insert into public.profiles
  INSERT INTO public.profiles (id, email, role, full_name, created_at)
  VALUES (
    new.id,
    new.email,
    v_role,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    now()
  );

  -- If the role is 'vendor', we might want to create a vendor entry here,
  -- but usually that's handled by the application or a separate process 
  -- to ensure all details are present. 
  -- However, to be safe, we ensure the profile has the correct role.

  RETURN new;
END;
$$;
