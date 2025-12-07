-- Rename variable to avoid conflict with system keyword current_role
DROP FUNCTION IF EXISTS delete_post_admin(UUID);

CREATE OR REPLACE FUNCTION delete_post_admin(post_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_current_user_id UUID;
  v_user_role TEXT;
  row_count INT;
BEGIN
  v_current_user_id := auth.uid();
  
  -- Use a distinct variable name
  SELECT role INTO v_user_role FROM profiles WHERE id = v_current_user_id;

  -- Check if user is admin
  IF v_user_role IS DISTINCT FROM 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized',
      'debug_uid', v_current_user_id,
      'debug_role', v_user_role,
      'system_user', current_user
    );
  END IF;

  DELETE FROM posts WHERE id = post_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', row_count,
    'debug_uid', v_current_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
