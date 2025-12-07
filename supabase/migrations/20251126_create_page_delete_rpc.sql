-- Create RPC function for admin page deletion
CREATE OR REPLACE FUNCTION delete_page_admin(page_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_current_user_id UUID;
  v_user_role TEXT;
  row_count INT;
BEGIN
  v_current_user_id := auth.uid();
  
  -- Get user role
  SELECT role INTO v_user_role FROM profiles WHERE id = v_current_user_id;

  -- Check if user is admin
  IF v_user_role IS DISTINCT FROM 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized',
      'debug_uid', v_current_user_id,
      'debug_role', v_user_role
    );
  END IF;

  -- Delete the page
  DELETE FROM pages WHERE id = page_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', row_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
