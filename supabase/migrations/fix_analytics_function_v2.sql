-- Admin analitik verilerini getiren fonksiyon (DÜZELTİLMİŞ VE GÜNCELLENMİŞ VERSİYON)
-- Profiles tablosunu ve vendors.deleted_at kolonunu kullanır.

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
  -- Toplam kullanıcı sayısı (Profiles tablosundan)
  SELECT COUNT(*) INTO total_users_count FROM public.profiles;

  -- Vendor sayısı (vendors tablosundan, silinmemiş olanlar)
  -- Eğer vendors tablosu yoksa veya boşsa profiles tablosundan role='vendor' olanları sayar.
  -- Ancak kullanıcının belirttiği '3' sayısı muhtemelen vendors tablosundaki aktif kayıtlardır.
  SELECT COUNT(*) INTO vendors_count 
  FROM public.vendors 
  WHERE deleted_at IS NULL;

  -- Eğer vendors tablosu boş gelirse (örneğin henüz migrate edilmediyse), profiles'dan say
  IF vendors_count = 0 THEN
    SELECT COUNT(*) INTO vendors_count FROM public.profiles WHERE role = 'vendor';
  END IF;

  -- Admin sayısı (Profiles tablosundan)
  SELECT COUNT(*) INTO admins_count 
  FROM public.profiles 
  WHERE role = 'admin';

  -- Çift sayısı (Profiles tablosundan)
  SELECT COUNT(*) INTO couples_count 
  FROM public.profiles 
  WHERE role = 'couple';

  -- Son 10 kullanıcı (Profiles ve auth.users birleşimi)
  SELECT json_agg(t) INTO recent_users
  FROM (
    SELECT 
      p.id, 
      u.email, 
      COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', 'Kullanıcı') as name,
      p.role,
      p.created_at
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    ORDER BY p.created_at DESC
    LIMIT 10
  ) t;

  -- Son 7 günlük büyüme grafiği
  SELECT json_agg(t) INTO user_growth
  FROM (
    SELECT 
      to_char(date_trunc('day', d)::date, 'YYYY-MM-DD') as date,
      COUNT(p.id) as count
    FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') d
    LEFT JOIN public.profiles p ON to_char(p.created_at, 'YYYY-MM-DD') = to_char(d, 'YYYY-MM-DD')
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
