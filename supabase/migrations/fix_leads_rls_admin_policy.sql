-- Fix Admin Leads RLS Policy
-- Sorun: Admin kullanıcıları lead'leri göremiyor

-- Mevcut politikayı kaldır
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;

-- Yeni, daha esnek politika oluştur
CREATE POLICY "Admins can view all leads" ON public.leads
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
        OR
        -- Eğer profiles tablosunda yoksa, direkt auth.users'dan kontrol et
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email LIKE '%admin%' OR email = 'karabuluthamza@gmail.com'
        )
    );

-- Admin'lerin lead'leri güncelleyebilmesi için
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads" ON public.leads
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admin'lerin lead'leri silebilmesi için
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can delete leads" ON public.leads
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Doğrulama: Şimdi lead'leri görebiliyor musunuz?
SELECT COUNT(*) as visible_leads FROM leads;
