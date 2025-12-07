import React, { useState, useEffect } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './VendorPlan.css';

// Pro Plan Subscription Component
const ProPlanSubscription = ({ currentPlan, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // NOT: PayPal Subscription için önce PayPal Dashboard'da plan oluşturulmalı
    // Bu örnek için basit checkout kullanıyoruz
    const createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: '29.99',
                    currency_code: 'EUR'
                },
                description: 'Pro Plan - Aylık Abonelik'
            }]
        });
    };

    const onApprove = async (data, actions) => {
        setLoading(true);
        setError(null);

        try {
            const details = await actions.order.capture();

            // Backend'e Pro plan aktivasyonu
            const { data: result, error } = await supabase.rpc('activate_pro_plan', {
                paypal_subscription_id: details.id,
                plan_duration: 'monthly'
            });

            if (error) throw error;

            if (result.success) {
                alert(`✅ Pro plan aktif edildi! Plan ${new Date(result.expires_at).toLocaleDateString('tr-TR')} tarihine kadar geçerli.`);
                onSuccess(); // Refresh plan data
            } else {
                throw new Error('Pro plan aktivasyonu başarısız');
            }
        } catch (err) {
            console.error('Subscription error:', err);
            setError('Abonelik işlemi başarısız. Lütfen tekrar deneyin.');
            alert('Abonelik işlemi başarısız. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const onError = (err) => {
        console.error('PayPal error:', err);
        setError('PayPal hatası. Lütfen tekrar deneyin.');
    };

    if (currentPlan === 'pro') {
        return (
            <button className="btn btn-primary" disabled>
                Mevcut Plan
            </button>
        );
    }

    return (
        <>
            {error && <p className="error-message" style={{ color: 'red', fontSize: '0.9rem', marginTop: '8px' }}>{error}</p>}
            {loading ? (
                <button className="btn btn-primary" disabled>
                    İşleniyor...
                </button>
            ) : (
                <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                    style={{ layout: 'vertical', label: 'subscribe' }}
                />
            )}
        </>
    );
};

const VendorPlan = () => {
    usePageTitle('Plan Yönetimi');
    const { user } = useAuth();
    const [vendorProfile, setVendorProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchVendorProfile();
        }
    }, [user]);

    const fetchVendorProfile = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('vendor_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!error && data) {
            setVendorProfile(data);
        }
        setLoading(false);
    };

    const planFeatures = {
        free: [
            '✅ Temel profil',
            '✅ 3 adete kadar ilan',
            '✅ Site içi mesajlaşma',
            '❌ WhatsApp/Telefon gösterimi',
            '❌ Sınırsız ilan',
            '❌ Üst sıralarda görünme',
            '❌ Öncelikli destek'
        ],
        pro: [
            '✅ Premium profil',
            '✅ Sınırsız ilan',
            '✅ Site içi mesajlaşma',
            '✅ WhatsApp/Telefon gösterimi',
            '✅ Üst sıralarda görünme',
            '✅ Öncelikli destek',
            '✅ Gelişmiş analitikler'
        ]
    };

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const currentPlan = vendorProfile?.plan_type || 'free';

    return (
        <div className="section container vendor-plan-container">
            <div className="plan-header">
                <h1>Plan Yönetimi</h1>
                <p>İşletmeniz için en uygun planı seçin.</p>
            </div>

            <div className="current-plan-card">
                <h2>Mevcut Planınız</h2>
                <div className={`plan-badge ${currentPlan}`}>
                    {currentPlan === 'pro' ? '⭐ Pro Plan' : '🆓 Free Plan'}
                </div>
                {currentPlan === 'pro' && vendorProfile?.plan_expires_at && (
                    <p className="plan-expiry">
                        Bitiş Tarihi: {new Date(vendorProfile.plan_expires_at).toLocaleDateString('tr-TR')}
                    </p>
                )}
            </div>

            <div className="plans-comparison">
                <div className="plan-card free-plan">
                    <div className="plan-header-card">
                        <h3>Free Plan</h3>
                        <p className="plan-price">€0<span>/ay</span></p>
                    </div>
                    <ul className="plan-features">
                        {planFeatures.free.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                        ))}
                    </ul>
                    {currentPlan === 'free' ? (
                        <button className="btn btn-outline" disabled>
                            Mevcut Plan
                        </button>
                    ) : (
                        <button className="btn btn-outline">
                            Free'ye Geç
                        </button>
                    )}
                </div>

                <div className="plan-card pro-plan">
                    <div className="plan-ribbon">Popüler</div>
                    <div className="plan-header-card">
                        <h3>Pro Plan</h3>
                        <p className="plan-price">€29.99<span>/ay</span></p>
                    </div>
                    <ul className="plan-features">
                        {planFeatures.pro.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                        ))}
                    </ul>
                    {currentPlan === 'pro' ? (
                        <button className="btn btn-primary" disabled>
                            Mevcut Plan
                        </button>
                    ) : (
                        <ProPlanSubscription
                            currentPlan={currentPlan}
                            onSuccess={fetchVendorProfile}
                        />
                    )}
                </div>
            </div>

            <div className="plan-info">
                <h2>Sıkça Sorulan Sorular</h2>
                <div className="faq-item">
                    <h4>Pro plan ne zaman aktif olur?</h4>
                    <p>PayPal entegrasyonu tamamlandıktan sonra (Faz 2) Pro plan satın alabileceksiniz.</p>
                </div>
                <div className="faq-item">
                    <h4>İstediğim zaman iptal edebilir miyim?</h4>
                    <p>Evet, Pro planı istediğiniz zaman iptal edebilirsiniz. İptal sonrası Free plana geçersiniz.</p>
                </div>
                <div className="faq-item">
                    <h4>Kredi sistemi nedir?</h4>
                    <p>Lead'leri açmak ve ilanları öne çıkarmak için kredi kullanırsınız. Krediyi cüzdan sayfasından satın alabilirsiniz.</p>
                </div>
            </div>
        </div>
    );
};

export default VendorPlan;
