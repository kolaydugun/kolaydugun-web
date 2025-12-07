import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './HomePricing.css';

const HomePricing = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const translations = {
        tr: {
            title: 'Tedarikçiler İçin Paketler',
            subtitle: 'İşletmenizi büyütmek için size en uygun paketi seçin.',
            free: 'Ücretsiz',
            premium: 'Premium',
            month: '/ay',
            popular: 'EN POPÜLER',
            startFree: 'Ücretsiz Dene',
            startPremium: 'Hemen Başla',
            monthly: 'Aylık',
            annual: 'Yıllık',
            save: '2 AY HEDİYE',
            features: {
                verified_badge: 'Onaylı Rozeti',
                top_placement: 'Üst Sıralarda Gösterim',
                social_links: 'Sosyal Medya Linkleri',
                map_view: 'Harita Görünümü',
                monthly_free_credits: 'Aylık Hediye Kredi',
                messaging: 'Müşterilerle Mesajlaşma',
                faq: 'Sıkça Sorulan Sorular (SSS)'
            },
            credit_info: '(Her ay 4 müşteri iletişimi)'
        },
        en: {
            title: 'Packages for Vendors',
            subtitle: 'Choose the best plan to grow your business.',
            free: 'Free',
            premium: 'Premium',
            month: '/mo',
            popular: 'MOST POPULAR',
            startFree: 'Try for Free',
            startPremium: 'Get Started',
            monthly: 'Monthly',
            annual: 'Annual',
            save: 'SAVE 2 MONTHS',
            features: {
                verified_badge: 'Verified Badge',
                top_placement: 'Top Placement',
                social_links: 'Social Media Links',
                map_view: 'Map View',
                monthly_free_credits: 'Monthly Free Credits',
                messaging: 'Messaging with Customers',
                faq: 'Frequently Asked Questions (FAQ)'
            },
            credit_info: '(4 customer contacts/mo)'
        },
        de: {
            title: 'Pakete für Dienstleister',
            subtitle: 'Wählen Sie das beste Paket, um Ihr Geschäft auszubauen.',
            free: 'Kostenlos',
            premium: 'Premium',
            month: '/Monat',
            popular: 'BELIEBTESTE',
            startFree: 'Kostenlos testen',
            startPremium: 'Jetzt starten',
            monthly: 'Monatlich',
            annual: 'Jährlich',
            save: '2 MONATE GESCHENKT',
            features: {
                verified_badge: 'Verifiziertes Abzeichen',
                top_placement: 'Top-Platzierung',
                social_links: 'Social Media Links',
                map_view: 'Kartenansicht',
                monthly_free_credits: 'Monatliche Gratis-Credits',
                messaging: 'Nachrichten an Kunden',
                faq: 'Häufig gestellte Fragen (FAQ)'
            },
            credit_info: '(4 Kundenkontakte/Monat)'
        }
    };

    const currentLang = translations[language] || translations.tr;

    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            // Check visibility config first
            const { data: configData } = await supabase
                .from('marketplace_config')
                .select('value')
                .eq('key', 'show_pricing_plans')
                .single();

            // Robust check: handle "true", true, "false", false
            let showPlans = true;

            if (configData) {
                const val = configData.value;
                if (val === 'true' || val === true) showPlans = true;
                else if (val === 'false' || val === false) showPlans = false;
                else showPlans = Boolean(val);
            }

            if (!showPlans) {
                setPlans([]); // Empty plans triggers "Beta" view
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('is_active', true)
                .order('price_monthly', { ascending: true });

            if (data) {
                setPlans(data);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const { user } = useAuth();

    const handleGetStarted = (plan) => {
        const planType = plan.name.toLowerCase() === 'premium' ? 'premium' : 'free';

        if (user) {
            if (planType === 'premium') {
                // Pass billing cycle to checkout
                navigate('/checkout', { state: { billingCycle } });
            } else {
                navigate('/vendor/dashboard');
            }
        } else {
            navigate(`/register?type=vendor&plan=${planType}&billing=${billingCycle}`);
        }
    };

    if (loading) return null;

    return (
        <section className="home-pricing-section">
            <div className="container">
                <div className="pricing-header">
                    <h2 className="pricing-title">
                        {currentLang.title}
                    </h2>
                    <p className="pricing-subtitle">
                        {currentLang.subtitle}
                    </p>

                    {/* Billing Cycle Toggle */}
                    {plans.length > 0 ? (
                        <div className="billing-toggle-container">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`billing-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                            >
                                {currentLang.monthly}
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`billing-btn billing-btn-annual ${billingCycle === 'annual' ? 'active' : ''}`}
                            >
                                {currentLang.annual}
                                <span className="discount-badge">
                                    -17%
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            background: '#ecfdf5',
                            border: '1px solid #10b981',
                            padding: '30px',
                            borderRadius: '16px',
                            maxWidth: '600px',
                            margin: '30px auto 0 auto'
                        }}>
                            <h2 style={{ color: '#047857', marginBottom: '10px' }}>🚀 Beta Launch Special</h2>
                            <p style={{ fontSize: '1.1rem', color: '#065f46' }}>
                                {language === 'tr' ?
                                    'Şu an Beta aşamasındayız! Ücretsiz üye olun ve hediye kredilerle müşterilere ulaşın.' :
                                    language === 'de' ?
                                        'Wir sind in der Beta-Phase! Melden Sie sich kostenlos an und erhalten Sie Gratis-Credits.' :
                                        'We are in Beta! Sign up for free and get free credits to contact customers.'}
                            </p>
                            <button
                                onClick={() => navigate('/register?type=vendor&plan=free')}
                                className="btn btn-primary"
                                style={{ marginTop: '20px', fontSize: '1.1rem', padding: '12px 30px' }}
                            >
                                {currentLang.startFree}
                            </button>
                        </div>
                    )}
                </div>

                <div className="pricing-grid">
                    {plans.map((plan) => {
                        const isPremium = plan.name.toLowerCase() === 'premium';

                        // Calculate Price
                        let displayPrice = plan.price_monthly;
                        let period = currentLang.month;
                        let originalPrice = null;

                        if (billingCycle === 'annual' && isPremium) {
                            // Annual Price Calculation: 290€ / year
                            displayPrice = 290;
                            period = '/yıl';
                            originalPrice = 348; // 29 * 12
                        } else if (billingCycle === 'annual' && !isPremium) {
                            period = '/yıl'; // Free is free
                        }

                        // Inject messaging feature and ensure correct order
                        const displayFeatures = {
                            ...plan.features,
                            messaging: isPremium, // Only available for premium
                            faq: isPremium, // Only available for premium
                            monthly_free_credits: isPremium ? (billingCycle === 'annual' ? 150 : 12) : 0
                        };

                        // Define feature order for consistent display
                        const featureOrder = [
                            'monthly_free_credits',
                            'messaging',
                            'faq',
                            'map_view',
                            'social_links',
                            'top_placement',
                            'verified_badge'
                        ];

                        return (
                            <div key={plan.id} className={`pricing-card ${isPremium ? 'premium' : ''}`}>
                                {isPremium && (
                                    <div className="popular-badge">
                                        {billingCycle === 'annual' ? `🔥 ${currentLang.save}` : currentLang.popular}
                                    </div>
                                )}

                                <h3 className="plan-name">
                                    {plan.name.toLowerCase() === 'free' ? currentLang.free : currentLang.premium}
                                </h3>
                                <div className="plan-price-container">
                                    <span className="plan-price">€{displayPrice}</span>
                                    <span className="plan-period">{period}</span>
                                </div>
                                {originalPrice ? (
                                    <div className="original-price">
                                        €{originalPrice}
                                    </div>
                                ) : (
                                    <div className="price-spacer"></div>
                                )}

                                <ul className="features-list">
                                    {featureOrder.map((key) => {
                                        const value = displayFeatures[key];
                                        // Skip if feature key doesn't exist in our map (unless it's in the plan features)
                                        if (value === undefined && !plan.features[key]) return null;

                                        const isAvailable = value !== false && value !== 0;

                                        return (
                                            <li key={key} className={`feature-item ${!isAvailable ? 'unavailable' : ''}`}>
                                                <span className={`feature-icon ${isAvailable ? 'available' : 'unavailable'} ${isPremium ? 'premium' : ''}`}>
                                                    {isAvailable ? '✓' : '✕'}
                                                </span>
                                                {key === 'monthly_free_credits' ? (
                                                    <div>
                                                        <strong>
                                                            {value} {billingCycle === 'annual' && isPremium ? (language === 'tr' ? 'Toplu Hediye Kredi' : 'Credits Upfront') : currentLang.features[key]}
                                                        </strong>
                                                        <div className="credit-info">
                                                            {billingCycle === 'annual' && isPremium
                                                                ? (language === 'tr' ? '(Tüm yıl özgürce kullanın)' : '(Use freely all year)')
                                                                : currentLang.credit_info}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    currentLang.features[key] || key.replace(/_/g, ' ')
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>

                                <button
                                    onClick={() => handleGetStarted(plan)}
                                    className={`plan-btn ${isPremium ? 'premium' : 'free'}`}
                                >
                                    {isPremium ? currentLang.startPremium : currentLang.startFree}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HomePricing;
