import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import StarRating from '../components/Reviews/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminReviews.css';

const AdminReviews = () => {
    usePageTitle('Yorum Yönetimi');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedReviews, setSelectedReviews] = useState(new Set());

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (reviewsError) throw reviewsError;

            if (!reviewsData || reviewsData.length === 0) {
                setReviews([]);
                setLoading(false);
                return;
            }

            const userIds = [...new Set(reviewsData.map(r => r.user_id).filter(Boolean))];
            const vendorIds = [...new Set(reviewsData.map(r => r.vendor_id).filter(Boolean))];

            let profilesMap = {};
            if (userIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', userIds);

                if (profilesData) {
                    profilesData.forEach(p => profilesMap[p.id] = p);
                }
            }

            let vendorsMap = {};
            if (vendorIds.length > 0) {
                const { data: vendorsData } = await supabase
                    .from('vendors')
                    .select('id, business_name')
                    .in('id', vendorIds);
                if (vendorsData) {
                    vendorsData.forEach(v => vendorsMap[v.id] = v);
                }
            }

            const mergedReviews = reviewsData.map(r => ({
                ...r,
                profiles: profilesMap[r.user_id] || null,
                vendors: { name: vendorsMap[r.vendor_id]?.business_name || 'Bilinmeyen Firma' }
            }));

            setReviews(mergedReviews);

        } catch (error) {
            console.error('Error fetching reviews:', error);
            alert('Yorumlar yüklenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleApproval = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ is_approved: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setReviews(reviews.map(r =>
                r.id === id ? { ...r, is_approved: !currentStatus } : r
            ));
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Durum güncellenemedi: ' + error.message);
        }
    };

    const deleteReview = async (id) => {
        try {
            console.log('Deleting review:', id);
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Delete error:', error);
                throw error;
            }

            console.log('Delete successful');
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Yorum silinemedi: ' + error.message);
        }
    };

    const filteredReviews = reviews.filter(r => {
        if (filter === 'approved') return r.is_approved;
        if (filter === 'pending') return !r.is_approved;
        return true;
    });

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedReviews(new Set(filteredReviews.map(r => r.id)));
        } else {
            setSelectedReviews(new Set());
        }
    };

    const handleSelectReview = (id) => {
        const newSelected = new Set(selectedReviews);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedReviews(newSelected);
    };

    const bulkDelete = async () => {
        if (selectedReviews.size === 0) return;

        try {
            console.log('Bulk deleting:', Array.from(selectedReviews));
            const { error } = await supabase
                .from('reviews')
                .delete()
                .in('id', Array.from(selectedReviews));

            if (error) {
                console.error('Bulk delete error:', error);
                throw error;
            }

            console.log('Bulk delete successful');
            setReviews(reviews.filter(r => !selectedReviews.has(r.id)));
            setSelectedReviews(new Set());
        } catch (error) {
            console.error('Error deleting reviews:', error);
            alert('Yorumlar silinemedi: ' + error.message);
        }
    };

    const bulkApprove = async () => {
        if (selectedReviews.size === 0) return;

        try {
            const { error } = await supabase
                .from('reviews')
                .update({ is_approved: true })
                .in('id', Array.from(selectedReviews));

            if (error) throw error;

            setReviews(reviews.map(r =>
                selectedReviews.has(r.id) ? { ...r, is_approved: true } : r
            ));
            setSelectedReviews(new Set());
        } catch (error) {
            console.error('Error approving reviews:', error);
            alert('Durum güncellenemedi: ' + error.message);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="section container admin-reviews-page">
            <div className="admin-header">
                <h1>Yorum Yönetimi</h1>
                <div className="filter-controls">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tümü ({reviews.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilter('approved')}
                    >
                        Onaylananlar ({reviews.filter(r => r.is_approved).length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Bekleyenler ({reviews.filter(r => !r.is_approved).length})
                    </button>
                </div>
            </div>

            {selectedReviews.size > 0 && (
                <div className="bulk-actions-bar">
                    <span>{selectedReviews.size} yorum seçildi</span>
                    <div className="bulk-buttons">
                        <button
                            className="btn-bulk approve"
                            onClick={bulkApprove}
                        >
                            ✅ Seçilenleri Onayla
                        </button>
                        <button
                            className="btn-bulk delete"
                            onClick={bulkDelete}
                        >
                            🗑️ Seçilenleri Sil
                        </button>
                    </div>
                </div>
            )}

            <div className="reviews-table-container">
                <table className="reviews-table">
                    <thead>
                        <tr>
                            <th className="checkbox-cell">
                                <input
                                    type="checkbox"
                                    checked={filteredReviews.length > 0 && selectedReviews.size === filteredReviews.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Tarih</th>
                            <th>Kullanıcı</th>
                            <th>Firma</th>
                            <th>Puan</th>
                            <th>Yorum</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReviews.map(review => (
                            <tr key={review.id} className={selectedReviews.has(review.id) ? 'row-selected' : ''}>
                                <td className="checkbox-cell">
                                    <input
                                        type="checkbox"
                                        checked={selectedReviews.has(review.id)}
                                        onChange={() => handleSelectReview(review.id)}
                                    />
                                </td>
                                <td>{new Date(review.created_at).toLocaleDateString('tr-TR')}</td>
                                <td>
                                    {review.profiles?.full_name || 'İsimsiz Kullanıcı'}
                                    <br />
                                    <small>{review.profiles?.email || 'Email yok'}</small>
                                </td>
                                <td>{review.vendors?.name || 'Bilinmeyen Firma'}</td>
                                <td>
                                    <StarRating rating={review.rating} readOnly size="small" />
                                </td>
                                <td className="comment-cell">{review.comment}</td>
                                <td>
                                    <span className={`status-badge ${review.is_approved ? 'approved' : 'pending'}`}>
                                        {review.is_approved ? 'Yayında' : 'Onay Bekliyor'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {!review.is_approved && (
                                            <button
                                                className="btn-icon approve"
                                                onClick={() => toggleApproval(review.id, false)}
                                                style={{ backgroundColor: '#4caf50', color: 'white', marginRight: '5px' }}
                                            >
                                                ✅ Onayla
                                            </button>
                                        )}
                                        {review.is_approved && (
                                            <button
                                                className="btn-icon reject"
                                                onClick={() => toggleApproval(review.id, true)}
                                                style={{ backgroundColor: '#ff9800', color: 'white', marginRight: '5px' }}
                                            >
                                                🚫 Gizle
                                            </button>
                                        )}
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => deleteReview(review.id)}
                                            style={{ backgroundColor: '#f44336', color: 'white' }}
                                        >
                                            🗑️ Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredReviews.length === 0 && (
                    <div className="no-data">Görüntülenecek yorum yok.</div>
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
