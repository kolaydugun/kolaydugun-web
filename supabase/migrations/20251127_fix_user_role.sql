-- Upgrade user Hamza Karabulut to admin role
UPDATE profiles
SET role = 'admin'
WHERE id = '2ea5fdee-da7b-4b9b-8733-3c944b7e11a4';
