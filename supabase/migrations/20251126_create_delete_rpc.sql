-- Create a secure function to delete posts, bypassing RLS
CREATE OR REPLACE FUNCTION delete_post_admin(post_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Sadece yöneticiler silebilir.';
  END IF;

  DELETE FROM posts WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
