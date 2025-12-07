-- Update the function to return debug info
DROP FUNCTION IF EXISTS delete_post_admin(UUID);

CREATE OR REPLACE FUNCTION delete_post_admin(post_id UUID)
RETURNS JSONB AS $$
DECLARE
  current_user_id UUID;
  current_role TEXT;
  row_count INT;
BEGIN
  current_user_id := auth.uid();
  SELECT role INTO current_role FROM profiles WHERE id = current_user_id;

  -- Check if user is admin
  IF current_role IS DISTINCT FROM 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized',
      'debug_uid', current_user_id,
      'debug_role', current_role
    );
  END IF;

  DELETE FROM posts WHERE id = post_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', row_count,
    'debug_uid', current_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
