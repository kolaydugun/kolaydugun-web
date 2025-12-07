import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import VendorCreateModal from '../components/Admin/VendorCreateModal';
import VendorEditModal from '../components/Admin/VendorEditModal';
import VendorImportModal from '../components/Admin/VendorImportModal';
import { useLanguage } from '../context/LanguageContext';
import { getCategoryTranslationKey } from '../constants/vendorData';
import './AdminVendors.css';

const AdminVendors = () => {
    usePageTitle('Vendor Yönetimi');
    const { user } = useAuth();
    const { t } = useLanguage();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, premium, free

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const PAGE_SIZE = 20;

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [confirmingFeatured, setConfirmingFeatured] = useState(null);

    // Showcase Modal State
    const [showShowcaseModal, setShowShowcaseModal] = useState(false);
    const [showcaseVendor, setShowcaseVendor] = useState(null);
    const [showcaseDuration, setShowcaseDuration] = useState('1_month'); // 1_week, 1_month, 3_months, custom, unlimited
    const [showcaseCustomDate, setShowcaseCustomDate] = useState('');
    const [showcaseOrder, setShowcaseOrder] = useState(0);

    useEffect(() => {
        window.supabase = supabase; // DEBUG: Expose for console access
        if (user) {
            // Debounce search
            const timer = setTimeout(() => {
                fetchVendors();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [user, filter, searchTerm, page]);

    const fetchVendors = async () => {
        setLoading(true);

        let query = supabase
            .from('vendors')
            .select('*', { count: 'exact' })
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('subscription_tier', filter);
        }

        // Apply Search Filter
        if (searchTerm) {
            query = query.ilike('business_name', `%${searchTerm}%`);
        }

        // Apply Pagination
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

        const { data: vendorsData, count, error: vendorsError } = await query;

        if (vendorsError) {
            console.error('Error fetching vendors:', vendorsError);
            setLoading(false);
            return;
        }

        setVendors(vendorsData || []);
        setTotalCount(count || 0);
        setLoading(false);
    };

    // Bulk Selection State
    const [selectedVendors, setSelectedVendors] = useState(new Set());
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);

    const toggleSelectAll = () => {
        if (selectedVendors.size === vendors.length) {
            setSelectedVendors(new Set());
        } else {
            setSelectedVendors(new Set(vendors.map(v => v.id)));
        }
    };

    const toggleSelectVendor = (id) => {
        const newSelected = new Set(selectedVendors);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedVendors(newSelected);
    };

    const handleBulkVerify = async () => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ is_verified: true })
                .in('id', Array.from(selectedVendors));

            if (error) throw error;

            // Update local state
            setVendors(vendors.map(v =>
                selectedVendors.has(v.id) ? { ...v, is_verified: true } : v
            ));

            alert('✅ Seçilen tedarikçiler onaylandı.');
            setSelectedVendors(new Set());
            setShowBulkConfirm(false);
        } catch (err) {
            console.error('Bulk verify error:', err);
            alert('Hata: ' + err.message);
        }
    };

    const handleBulkDelete = async () => {
        console.log('🗑️ BULK DELETE BAŞLATILDI');
        console.log('Seçilenler:', Array.from(selectedVendors));

        try {
            const { error } = await supabase
                .from('vendors')
                .update({ deleted_at: new Date().toISOString() })
                .in('id', Array.from(selectedVendors));

            if (error) {
                console.error('❌ Bulk Delete Error:', error);
                throw error;
            }

            console.log('✅ Bulk Delete Başarılı');
            alert('✅ Seçilen tedarikçiler silindi.');
            setSelectedVendors(new Set());
            setShowBulkConfirm(false);
            fetchVendors();
        } catch (err) {
            console.error('Bulk delete catch:', err);
            alert('Hata: ' + err.message);
        }
    };

    const openShowcaseModal = (vendor) => {
        setShowcaseVendor(vendor);
        setShowcaseOrder(vendor.featured_sort_order || 0);
        setShowcaseDuration('1_month');
        setShowShowcaseModal(true);
    };

    const handleShowcaseSubmit = async () => {
        if (!showcaseVendor) return;

        let expiresAt = null;
        const now = new Date();

        switch (showcaseDuration) {
            case '1_week':
                now.setDate(now.getDate() + 7);
                expiresAt = now.toISOString();
                break;
            case '1_month':
                now.setMonth(now.getMonth() + 1);
                expiresAt = now.toISOString();
                break;
            case '3_months':
                now.setMonth(now.getMonth() + 3);
                expiresAt = now.toISOString();
                break;
            case 'custom':
                if (showcaseCustomDate) {
                    expiresAt = new Date(showcaseCustomDate).toISOString();
                }
                break;
            case 'unlimited':
                expiresAt = null;
                break;
        }

        await toggleFeatured(showcaseVendor.id, true, expiresAt, showcaseOrder);
        setShowShowcaseModal(false);
        setShowcaseVendor(null);
    };

    const toggleFeatured = async (vendorId, newValue, expiresAt = null, sortOrder = 0) => {
        try {
            const { error } = await supabase.rpc('toggle_featured_vendor', {
                vendor_uuid: vendorId,
                is_featured_status: newValue,
                expires_at: expiresAt,
                sort_order: sortOrder
            });

            if (error) throw error;

            // Update local state immediately
            setVendors(vendors.map(v =>
                v.id === vendorId ? {
                    ...v,
                    is_featured: newValue,
                    featured_expires_at: expiresAt,
                    featured_sort_order: sortOrder
                } : v
            ));

        } catch (err) {
            console.error('Toggle featured error:', err);
            alert('Hata: ' + err.message);
        }
    };

    const toggleVerified = async (vendorId, newValue) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ is_verified: newValue })
                .eq('id', vendorId);

            if (error) throw error;

            // Update local state
            setVendors(vendors.map(v =>
                v.id === vendorId ? { ...v, is_verified: newValue } : v
            ));

        } catch (err) {
            console.error('Toggle verified error:', err);
            alert('Hata: ' + err.message);
        }
    };

    const updateSubscription = async (vendorId, newTier) => {
        try {
            // 1. Update vendors table
            const { error } = await supabase
                .from('vendors')
                .update({ subscription_tier: newTier })
                .eq('id', vendorId);

            if (error) throw error;

            // 2. Sync with vendor_subscriptions table
            try {
                const { data: plan } = await supabase
                    .from('subscription_plans')
                    .select('id')
                    .eq('name', newTier === 'premium' ? 'pro_monthly' : 'free')
                    .single();

                if (plan) {
                    // Check for active subscription
                    const { data: activeSub } = await supabase
                        .from('vendor_subscriptions')
                        .select('id')
                        .eq('vendor_id', vendorId)
                        .eq('status', 'active')
                        .single();

                    if (activeSub) {
                        await supabase
                            .from('vendor_subscriptions')
                            .update({
                                plan_id: plan.id,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', activeSub.id);
                    } else {
                        await supabase
                            .from('vendor_subscriptions')
                            .insert([{
                                vendor_id: vendorId,
                                plan_id: plan.id,
                                status: 'active',
                                started_at: new Date().toISOString(),
                                auto_renew: true
                            }]);
                    }
                }
            } catch (subErr) {
                console.warn('Subscription table update failed, but vendor table updated:', subErr);
            }

            fetchVendors();
        } catch (err) {
            console.error('Update error:', err);
            alert('Hata: ' + err.message);
        }
    };

    const [vendorToDelete, setVendorToDelete] = useState(null);

    const handleDeleteClick = (vendor) => {
        console.log('🖱️ Delete Clicked for:', vendor.id);
        setVendorToDelete(vendor);
    };

    const confirmDelete = async (vendorId) => {
        console.log('🔴 HARD DELETE BAŞLADI - Vendor ID:', vendorId);

        try {
            // Use RPC function for hard delete to handle all dependencies
            const { error } = await supabase.rpc('force_delete_vendor', {
                target_vendor_id: vendorId
            });

            if (error) {
                console.error('🔴 DELETE HATASI:', error);
                alert(`SİLME HATASI:\n${error.message}`);
                return;
            }

            console.log('✅ SİLME BAŞARILI');
            alert('✅ Tedarikçi ve ilişkili tüm veriler başarıyla silindi.');
            setVendorToDelete(null);
            fetchVendors();
        } catch (err) {
            console.error('Beklenmeyen hata:', err);
            alert('Hata: ' + err.message);
        }
    };

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    if (loading && !vendors.length) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="section container admin-vendors-container">
            <div className="admin-vendors-header">
                <div>
                    <h1>Vendor Yönetimi</h1>
                    <p>Tüm tedarikçileri görüntüleyin ve yönetin</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
                        📥 Import CSV
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        + Yeni Tedarikçi
                    </button>
                </div>
            </div>

            {/* Filters & Search - NEW Flex Container */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '20px',
                marginBottom: '20px',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => { setFilter('all'); setPage(1); }}
                    >
                        📋 Tümü
                    </button>
                    <button
                        className={`filter-tab ${filter === 'premium' ? 'active' : ''}`}
                        onClick={() => { setFilter('premium'); setPage(1); }}
                    >
                        👑 Premium
                    </button>
                    <button
                        className={`filter-tab ${filter === 'free' ? 'active' : ''}`}
                        onClick={() => { setFilter('free'); setPage(1); }}
                    >
                        🆓 Free
                    </button>
                </div>

                {/* SEARCH BAR */}
                <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Tedarikçi ara (işletme adı)..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1); // Reset to page 1 on search
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedVendors.size > 0 && (
                <div style={{
                    background: '#ffebee',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #ffcdd2'
                }}>
                    <span style={{ color: '#c62828', fontWeight: 'bold' }}>
                        {selectedVendors.size} tedarikçi seçildi
                    </span>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn btn-success"
                            onClick={handleBulkVerify}
                        >
                            ✅ Seçilenleri Onayla
                        </button>

                        {showBulkConfirm ? (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>Silmek istediğine emin misin?</span>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleBulkDelete}
                                >
                                    Evet, Sil
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowBulkConfirm(false)}
                                >
                                    İptal
                                </button>
                            </div>
                        ) : (
                            <button
                                className="btn btn-danger"
                                onClick={() => setShowBulkConfirm(true)}
                            >
                                🗑️ Seçilenleri Sil
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Vendors Table */}
            {vendors.length === 0 ? (
                <div className="empty-state">
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
                    <h3>Tedarikçi bulunamadı</h3>
                    <p>Bu filtreye veya aramaya uygun tedarikçi yok.</p>
                </div>
            ) : (
                <>
                    <div className="vendors-table">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedVendors.size === vendors.length && vendors.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th style={{ width: '50px', textAlign: 'center', color: '#888' }}>#</th>
                                    <th>İşletme Adı</th>
                                    <th>Kategori</th>
                                    <th>Şehir</th>
                                    <th>Üyelik</th>
                                    <th>Vitrin Durumu</th>
                                    <th>Durum</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendors.map((vendor, index) => (
                                    <tr key={vendor.id} className={selectedVendors.has(vendor.id) ? 'selected-row' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedVendors.has(vendor.id)}
                                                onChange={() => toggleSelectVendor(vendor.id)}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#888' }}>
                                            {vendors.length - index}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 'bold' }}>{vendor.business_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{vendor.id}</div>
                                        </td>
                                        <td>
                                            {t('categories.' + getCategoryTranslationKey(vendor.category))}
                                        </td>
                                        <td>{vendor.city}</td>
                                        <td>
                                            <select
                                                value={vendor.subscription_tier}
                                                onChange={(e) => updateSubscription(vendor.id, e.target.value)}
                                                className={`status-badge ${vendor.subscription_tier === 'premium' ? 'status-premium' : 'status-free'}`}
                                                style={{ border: 'none', cursor: 'pointer' }}
                                            >
                                                <option value="free">Free</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                        </td>
                                        <td>
                                            {vendor.is_featured ? (
                                                <div>
                                                    <span className="badge badge-success">Vitrinde</span>
                                                    {vendor.featured_expires_at && (
                                                        <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>
                                                            Bitiş: {new Date(vendor.featured_expires_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {vendor.featured_sort_order > 0 && (
                                                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                                            Sıra: {vendor.featured_sort_order}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="badge badge-secondary">Pasif</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${vendor.is_verified ? 'status-verified' : 'status-pending'}`}>
                                                {vendor.is_verified ? 'Onaylı' : 'Bekliyor'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {!vendor.is_verified && (
                                                    <button
                                                        className="btn-sm btn-success"
                                                        onClick={() => toggleVerified(vendor.id, true)}
                                                        title="Onayla"
                                                    >
                                                        ✅
                                                    </button>
                                                )}

                                                {vendor.is_featured ? (
                                                    <button
                                                        className="btn-sm btn-warning"
                                                        onClick={() => toggleFeatured(vendor.id, false)}
                                                        title="Vitrinden Kaldır"
                                                    >
                                                        ⭐
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn-sm btn-secondary"
                                                        onClick={() => openShowcaseModal(vendor)}
                                                        title="Vitrine Ekle"
                                                    >
                                                        ☆
                                                    </button>
                                                )}

                                                {vendor.subscription_tier === 'premium' ? (
                                                    <button
                                                        className="btn-sm btn-secondary"
                                                        onClick={() => updateSubscription(vendor.id, 'free')}
                                                        title="Free Yap"
                                                    >
                                                        📉
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn-sm btn-premium"
                                                        onClick={() => updateSubscription(vendor.id, 'premium')}
                                                        title="Premium Yap"
                                                    >
                                                        👑
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-sm btn-primary"
                                                    onClick={() => setEditingVendor(vendor)}
                                                    title="Düzenle"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-sm btn-danger"
                                                    onClick={() => handleDeleteClick(vendor)}
                                                    title="Sil"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #d1d5db',
                                    background: page === 1 ? '#f3f4f6' : '#fff',
                                    color: page === 1 ? '#9ca3af' : '#374151',
                                    borderRadius: '6px',
                                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                ← Önceki
                            </button>
                            <span style={{ fontSize: '14px', color: '#4b5563' }}>
                                Sayfa <strong>{page}</strong> / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #d1d5db',
                                    background: page === totalPages ? '#f3f4f6' : '#fff',
                                    color: page === totalPages ? '#9ca3af' : '#374151',
                                    borderRadius: '6px',
                                    cursor: page === totalPages ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Sonraki →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            {showCreateModal && (
                <VendorCreateModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchVendors();
                    }}
                />
            )}

            {showImportModal && (
                <VendorImportModal
                    onClose={() => setShowImportModal(false)}
                    onSuccess={() => {
                        setShowImportModal(false);
                        fetchVendors();
                    }}
                />
            )}

            {editingVendor && (
                <VendorEditModal
                    vendor={editingVendor}
                    onClose={() => setEditingVendor(null)}
                    onSuccess={() => {
                        setEditingVendor(null);
                        fetchVendors();
                    }}
                />
            )}

            {/* Showcase Modal */}
            {showShowcaseModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <h3>Vitrine Ekle: {showcaseVendor?.business_name}</h3>

                        <div className="form-group">
                            <label>Süre</label>
                            <select
                                value={showcaseDuration}
                                onChange={(e) => setShowcaseDuration(e.target.value)}
                                className="form-control"
                            >
                                <option value="1_week">1 Hafta</option>
                                <option value="1_month">1 Ay</option>
                                <option value="3_months">3 Ay</option>
                                <option value="unlimited">Süresiz</option>
                                <option value="custom">Özel Tarih</option>
                            </select>
                        </div>

                        {showcaseDuration === 'custom' && (
                            <div className="form-group">
                                <label>Bitiş Tarihi</label>
                                <input
                                    type="date"
                                    value={showcaseCustomDate}
                                    onChange={(e) => setShowcaseCustomDate(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Sıralama Önceliği (1 = En Üst)</label>
                            <input
                                type="number"
                                value={showcaseOrder}
                                onChange={(e) => setShowcaseOrder(parseInt(e.target.value))}
                                className="form-control"
                                min="0"
                            />
                            <small className="text-muted">Düşük numara daha üstte görünür.</small>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowShowcaseModal(false)}>İptal</button>
                            <button className="btn btn-primary" onClick={handleShowcaseSubmit}>Kaydet ve Ekle</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {vendorToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Tedarikçiyi Sil?</h3>
                        <p>
                            <strong>{vendorToDelete.business_name}</strong> isimli tedarikçiyi silmek istediğinize emin misiniz?
                        </p>
                        <div className="alert alert-danger">
                            ⚠️ Bu işlem geri alınamaz! Tedarikçiye ait tüm veriler (abonelikler, leadler, vb.) silinecektir.
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setVendorToDelete(null)}
                            >
                                İptal
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => confirmDelete(vendorToDelete.id)}
                            >
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVendors;
