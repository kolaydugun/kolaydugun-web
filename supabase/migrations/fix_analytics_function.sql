-- Admin analitik verilerini getiren fonksiyon (DÜZELTİLMİŞ VERSİYON)
-- deleted_at kolonu olmadığı için o kontrol kaldırıldı.

CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users_count INT;
  vendors_count INT;
  admins_count INT;
  couples_count INT;
  recent_users JSON;
  user_growth JSON;
BEGIN
  -- Toplam kullanıcı sayısı
  SELECT COUNT(*) INTO total_users_count FROM auth.users;

  -- Vendor sayısı (deleted_at kontrolü kaldırıldı çünkü tablo yapısında yok)
  SELECT COUNT(*) INTO vendors_count FROM public.vendor_profiles;

  -- Admin sayısı (Metadata kontrolü)
  SELECT COUNT(*) INTO admins_count 
  FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'admin';

  -- Çift sayısı (Geriye kalanlar veya rolü couple olanlar)
  SELECT COUNT(*) INTO couples_count 
  FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'couple' OR raw_user_meta_data->>'role' IS NULL;

  -- Son 10 kullanıcı
  SELECT json_agg(t) INTO recent_users
  FROM (
    SELECT 
      id, 
      email, 
      COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'Kullanıcı') as name,
      COALESCE(raw_user_meta_data->>'role', 'couple') as role,
      created_at
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 10
  ) t;

  -- Son 7 günlük büyüme grafiği
  SELECT json_agg(t) INTO user_growth
  FROM (
    SELECT 
      to_char(date_trunc('day', d)::date, 'YYYY-MM-DD') as date,
      COUNT(u.id) as count
    FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') d
    LEFT JOIN auth.users u ON to_char(u.created_at, 'YYYY-MM-DD') = to_char(d, 'YYYY-MM-DD')
    GROUP BY 1
    ORDER BY 1
  ) t;

  RETURN json_build_object(
    'totalUsers', total_users_count,
    'vendors', vendors_count,
    'admins', admins_count,
    'couples', couples_count,
    'recentUsers', COALESCE(recent_users, '[]'::json),
    'userGrowth', COALESCE(user_growth, '[]'::json)
  );
END;
$$;

-- Fonksiyonu kullanıma aç
GRANT EXECUTE ON FUNCTION get_admin_analytics() TO authenticated;
