import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { getCategoryTranslationKey } from '../constants/vendorData';
import './VendorListings.css';

const VendorListings = () => {
    usePageTitle('İlanlarım');
    const { user } = useAuth();
    const { t } = useLanguage();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchListings();
        }
    }, [user]);

    const fetchListings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('vendors')
            .select(`
                *,
                featured:featured_listings(featured_until)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setListings(data);
        } else if (error) {
            console.error('Error fetching vendor listings:', error);
        }
        setLoading(false);
    };

    const featureListing = async (listingId, days) => {
        try {
            const { data, error } = await supabase
                .rpc('feature_listing', {
                    p_listing_id: listingId,
                    p_duration_days: days
                });

            if (error) throw error;

            if (data.success) {
                alert(`✅ İlan ${days} gün boyunca öne çıkarıldı! ${data.credits_spent} kredi harcandı. Yeni bakiye: ${data.new_balance}`);
                fetchListings();
            } else {
                // Yetersiz kredi hatası
                if (data.error === 'Yetersiz kredi') {
                    const confirmLoad = window.confirm(
                        `Yetersiz kredi! Bu işlem için ${data.required} kredi gerekiyor, mevcut bakiyeniz: ${data.current}.\n\nKredi yüklemek ister misiniz?`
                    );
                    if (confirmLoad) {
                        window.location.href = '/vendor/wallet';
                    }
                } else {
                    alert(data.error || 'İlan öne çıkarılamadı');
                }
            }
        } catch (error) {
            console.error('Feature error:', error);
            alert('Bir hata oluştu: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="section container vendor-listings-container">
            <div className="vendor-listings-header">
                <h1>İlanlarım</h1>
                <p>İlanlarınızı yönetin ve öne çıkarın.</p>
            </div>

            {listings.length === 0 ? (
                <div className="empty-state">
                    <h3>Henüz ilan yok</h3>
                    <p>İlk ilanınızı oluşturun ve müşterilere ulaşın.</p>
                </div>
            ) : (
                <div className="listings-grid">
                    {listings.map(listing => {
                        const isFeatured = listing.featured?.some(f =>
                            new Date(f.featured_until) > new Date()
                        );
                        const featuredUntil = isFeatured
                            ? listing.featured.find(f => new Date(f.featured_until) > new Date())?.featured_until
                            : null;

                        return (
                            <div key={listing.id} className={`listing-card ${isFeatured ? 'featured' : ''}`}>
                                {isFeatured && (
                                    <div className="featured-badge">
                                        ⭐ Öne Çıkarılmış
                                    </div>
                                )}

                                <div className="listing-image">
                                    {listing.image_url ? (
                                        <img src={listing.image_url} alt={listing.business_name} />
                                    ) : (
                                        <div className="placeholder-image">📸</div>
                                    )}
                                </div>

                                <div className="listing-content">
                                    <h3>{listing.business_name}</h3>
                                    <p className="listing-category">
                                        {t('categories.' + getCategoryTranslationKey(listing.category))}
                                    </p>
                                    <p className="listing-location">📍 {listing.city}</p>

                                    {listing.price_range && (
                                        <p className="listing-price">
                                            {listing.price_range}
                                        </p>
                                    )}

                                    {isFeatured && featuredUntil && (
                                        <p className="featured-until">
                                            Öne çıkarma: {new Date(featuredUntil).toLocaleDateString('tr-TR')} tarihine kadar
                                        </p>
                                    )}

                                    <div className="listing-actions">
                                        {!isFeatured && (
                                            <div className="feature-buttons">
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => featureListing(listing.id, 7)}
                                                >
                                                    ⭐ 7 Gün Öne Çıkar
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => featureListing(listing.id, 30)}
                                                >
                                                    ⭐ 30 Gün Öne Çıkar
                                                </button>
                                            </div>
                                        )}
                                        <button className="btn btn-sm btn-outline">
                                            Düzenle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default VendorListings;
