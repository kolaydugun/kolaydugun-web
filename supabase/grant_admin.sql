-- Kullanıcınızı Admin Yapma Komutu
-- 1. Supabase Dashboard > SQL Editor'e gidin.
-- 2. Aşağıdaki komutu çalıştırın (email adresinizi kendi emailinizle değiştirin):

UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);

-- Eğer 'profiles' tablosunda 'role' kolonu yoksa, 'type' olabilir:
-- UPDATE profiles SET type = 'admin' ...
