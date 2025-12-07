import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { CATEGORIES, CITIES, getCategoryTranslationKey } from '../../constants/vendorData';
import { useLanguage } from '../../context/LanguageContext';

const VendorEditModal = ({ vendor, onClose, onUpdated }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        category: '',
        city: '',
        subscriptionTier: 'free',
        creditBalance: 0,
        isClaimed: false,
        videoUrl: '',
        website: '',
        instagram: '',
        facebook: '',
        price: '',
        capacity: ''
    });

    useEffect(() => {
        if (vendor) {
            setFormData({
                businessName: vendor.business_name || vendor.name || '',
                category: vendor.category || '',
                city: vendor.city || '',
                subscriptionTier: vendor.subscription_tier || 'free',
                creditBalance: vendor.credit_balance || 0,
                price: vendor.price_range || '',
                capacity: vendor.capacity || '',
                isClaimed: vendor.is_claimed || false,
                videoUrl: vendor.video_url || '',
                website: vendor.social_media?.website || '',
                instagram: vendor.social_media?.instagram || '',
                facebook: vendor.social_media?.facebook || ''
            });
        }
    }, [vendor]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Update vendors table
            const { error: vendorError } = await supabase
                .from('vendors')
                .update({
                    business_name: formData.businessName,
                    category: formData.category,
                    city: formData.city,
                    subscription_tier: formData.subscriptionTier,
                    credit_balance: parseInt(formData.creditBalance) || 0, // Update credits
                    price_range: formData.price,
                    capacity: formData.capacity === '' ? null : (parseInt(formData.capacity) || 0),
                    is_claimed: formData.isClaimed,
                    video_url: formData.videoUrl,
                    social_media: {
                        website: formData.website,
                        instagram: formData.instagram,
                        facebook: formData.facebook
                    }
                })
                .eq('id', vendor.id);

            if (vendorError) throw vendorError;

            // 2. Sync vendor_profiles credits
            await supabase
                .from('vendor_profiles')
                .update({ credits: parseInt(formData.creditBalance) || 0 })
                .eq('user_id', vendor.id);

            // 3. Update vendor_subscriptions (Sync)
            if (formData.subscriptionTier !== (vendor.subscription_tier || 'free')) {
                // Check for active subscription
                const { data: activeSub } = await supabase
                    .from('vendor_subscriptions')
                    .select('id')
                    .eq('vendor_id', vendor.id)
                    .eq('status', 'active')
                    .single();

                // Get plan ID for the new tier
                const { data: plan } = await supabase
                    .from('subscription_plans')
                    .select('id')
                    .eq('name', formData.subscriptionTier === 'premium' ? 'pro_monthly' : 'free') // Map 'premium' to 'pro_monthly' for now
                    .single();

                if (plan) {
                    if (activeSub) {
                        // Update existing
                        await supabase
                            .from('vendor_subscriptions')
                            .update({
                                plan_id: plan.id,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', activeSub.id);
                    } else {
                        // Insert new
                        await supabase
                            .from('vendor_subscriptions')
                            .insert([{
                                vendor_id: vendor.id,
                                plan_id: plan.id,
                                status: 'active',
                                started_at: new Date().toISOString(),
                                auto_renew: true
                            }]);
                    }
                }
            }

            alert('✅ Tedarikçi güncellendi!');
            onUpdated();
            onClose();

        } catch (error) {
            console.error('Update error:', error);
            alert('Hata: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Tedarikçi Düzenle</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>İşletme Adı</label>
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Kategori</label>
                            <select name="category" value={formData.category} onChange={handleChange} required>
                                <option value="">Kategori Seçin</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>
                                        {t('categories.' + getCategoryTranslationKey(cat))}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Şehir</label>
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Şehir Seçin</option>
                                {CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Üyelik Tipi</label>
                            <select name="subscriptionTier" value={formData.subscriptionTier} onChange={handleChange}>
                                <option value="free">Free</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fiyat Aralığı</label>
                            <select name="price" value={formData.price} onChange={handleChange} className="form-control">
                                <option value="">Seçiniz</option>
                                <option value="€">{t('filters.price_1')}</option>
                                <option value="€€">{t('filters.price_2')}</option>
                                <option value="€€€">{t('filters.price_3')}</option>
                                <option value="€€€€">{t('filters.price_4')}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Kapasite</label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Kredi Bakiyesi</label>
                        <input
                            type="number"
                            name="creditBalance"
                            value={formData.creditBalance}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="isClaimed"
                                checked={formData.isClaimed}
                                onChange={handleChange}
                            />
                            Onaylı Hesap (Claimed Badge)
                        </label>
                    </div>

                    <hr />
                    <h3>Medya & İletişim</h3>

                    <div className="form-group">
                        <label>Video URL (YouTube)</label>
                        <input
                            type="text"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            placeholder="https://youtube.com/..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Website</label>
                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Instagram</label>
                            <input
                                type="text"
                                name="instagram"
                                value={formData.instagram}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary">İptal</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorEditModal;
