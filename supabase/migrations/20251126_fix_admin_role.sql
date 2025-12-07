-- First, let's check and fix the user's role in profiles table
-- Update the admin user's role
UPDATE profiles 
SET role = 'admin' 
WHERE id = '13e2508f-e520-4bb3-bd3d-e1f4eee59024';

-- Verify the update
SELECT id, email, role FROM profiles WHERE id = '13e2508f-e520-4bb3-bd3d-e1f4eee59024';
