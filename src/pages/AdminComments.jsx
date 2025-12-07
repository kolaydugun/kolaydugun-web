import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useTranslation } from 'react-i18next';

const AdminComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending'); // pending, approved, rejected, spam, all
    const [selectedComments, setSelectedComments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        fetchComments();
    }, [filterStatus]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('blog_comments')
                .select(`
                    *,
                    posts (
                        title,
                        slug
                    )
                `)
                .order('created_at', { ascending: false });

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            const { data, error } = await query;

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            alert('Yorumlar yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (commentId, newStatus) => {
        try {
            const { error } = await supabase
                .from('blog_comments')
                .update({ status: newStatus })
                .eq('id', commentId);

            if (error) throw error;

            // Update local state
            setComments(comments.filter(c => c.id !== commentId));

            // If we are in 'all' view, just update the status in place
            if (filterStatus === 'all') {
                fetchComments(); // Refresh to be safe or update local state properly
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Durum güncellenemedi.');
        }
    };

    const handleDeleteClick = (commentId) => {
        setDeleteConfirmId(commentId);
    };

    const handleCancelDelete = () => {
        setDeleteConfirmId(null);
    };

    const handleConfirmDelete = async (commentId) => {
        try {
            const { error } = await supabase
                .from('blog_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            setComments(comments.filter(c => c.id !== commentId));
            setDeleteConfirmId(null);
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Yorum silinemedi.');
        }
    };

    const handleBulkAction = async (action, skipConfirm = false) => {
        if (selectedComments.length === 0) return;

        // Only ask for confirmation if it's NOT a delete action (since delete has its own inline confirm)
        // OR if it's a delete action but skipConfirm is false (shouldn't happen with new UI but good for safety)
        if (action !== 'delete' && !window.confirm(`Seçili ${selectedComments.length} yorum için bu işlemi yapmak istediğinize emin misiniz?`)) return;

        try {
            if (action === 'delete') {
                const { error } = await supabase
                    .from('blog_comments')
                    .delete()
                    .in('id', selectedComments);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('blog_comments')
                    .update({ status: action })
                    .in('id', selectedComments);
                if (error) throw error;
            }

            setSelectedComments([]);
            setBulkDeleteConfirm(false);
            fetchComments();
        } catch (error) {
            console.error('Error performing bulk action:', error);
            alert('İşlem başarısız.');
        }
    };

    const filteredComments = comments.filter(comment => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            comment.author_name?.toLowerCase().includes(searchLower) ||
            comment.content?.toLowerCase().includes(searchLower) ||
            comment.author_email?.toLowerCase().includes(searchLower)
        );
    });

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#fef3c7', color: '#d97706', label: 'Bekliyor' },
            approved: { bg: '#d1fae5', color: '#059669', label: 'Onaylı' },
            rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Reddedildi' },
            spam: { bg: '#f3f4f6', color: '#374151', label: 'Spam' }
        };
        const style = styles[status] || styles.pending;
        return (
            <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                background: style.bg,
                color: style.color,
                fontSize: '12px',
                fontWeight: '600'
            }}>
                {style.label}
            </span>
        );
    };

    return (
        <div className="admin-page" style={{ paddingTop: '120px', paddingBottom: '50px', maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>Yorum Yönetimi</h1>
                    <p style={{ color: '#6b7280' }}>Blog yorumlarını buradan yönetebilirsiniz.</p>
                </div>
            </div>

            {/* Filters and Tabs */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    {['pending', 'approved', 'rejected', 'spam', 'all'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                background: filterStatus === status ? '#3b82f6' : 'transparent',
                                color: filterStatus === status ? '#fff' : '#6b7280',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                textTransform: 'capitalize'
                            }}
                        >
                            {status === 'all' ? 'Tümü' : status}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Yorumlarda ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            width: '300px'
                        }}
                    />

                    {selectedComments.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleBulkAction('approved')} className="btn btn-success" style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>✓ Onayla</button>
                            <button onClick={() => handleBulkAction('spam')} className="btn btn-warning" style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>🚫 Spam</button>

                            {bulkDeleteConfirm ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff1f2', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecdd3' }}>
                                    <span style={{ color: '#e11d48', fontWeight: '600', fontSize: '14px' }}>{selectedComments.length} yorum silinsin mi?</span>
                                    <button
                                        onClick={() => handleBulkAction('delete', true)}
                                        style={{ border: 'none', background: '#e11d48', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        Evet
                                    </button>
                                    <button
                                        onClick={() => setBulkDeleteConfirm(false)}
                                        style={{ border: 'none', background: '#e5e7eb', color: '#374151', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        Hayır
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setBulkDeleteConfirm(true)} className="btn btn-danger" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>🗑️ Sil</button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Comments List */}
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Yükleniyor...</div>
                ) : filteredComments.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Bu filtrede yorum bulunamadı.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedComments(filteredComments.map(c => c.id));
                                            } else {
                                                setSelectedComments([]);
                                            }
                                        }}
                                        checked={selectedComments.length > 0 && selectedComments.length === filteredComments.length}
                                    />
                                </th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Yazar</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Yorum</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Yazı</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Durum</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Tarih</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComments.map(comment => (
                                <tr key={comment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '16px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedComments.includes(comment.id)}
                                            onChange={() => {
                                                if (selectedComments.includes(comment.id)) {
                                                    setSelectedComments(selectedComments.filter(id => id !== comment.id));
                                                } else {
                                                    setSelectedComments([...selectedComments, comment.id]);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '600', color: '#111' }}>{comment.author_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{comment.author_email}</div>
                                    </td>
                                    <td style={{ padding: '16px', maxWidth: '400px' }}>
                                        <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', color: '#374151' }}>
                                            {comment.content}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <a href={`/blog/${comment.posts?.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>
                                            {comment.posts?.title?.tr || comment.posts?.title?.en || 'Yazı'} ↗
                                        </a>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {getStatusBadge(comment.status)}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem', color: '#6b7280' }}>
                                        {new Date(comment.created_at).toLocaleString('tr-TR')}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {comment.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(comment.id, 'approved')}
                                                        title="Onayla"
                                                        style={{ border: 'none', background: '#d1fae5', color: '#059669', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(comment.id, 'rejected')}
                                                        title="Reddet"
                                                        style={{ border: 'none', background: '#fee2e2', color: '#dc2626', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        ✕
                                                    </button>
                                                </>
                                            )}
                                            {comment.status === 'approved' && (
                                                <button
                                                    onClick={() => handleStatusChange(comment.id, 'rejected')}
                                                    title="Reddet"
                                                    style={{ border: 'none', background: '#fee2e2', color: '#dc2626', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                            {deleteConfirmId === comment.id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fff1f2', padding: '2px 6px', borderRadius: '4px' }}>
                                                    <span style={{ fontSize: '12px', color: '#e11d48', fontWeight: '600' }}>Sil?</span>
                                                    <button
                                                        onClick={() => handleConfirmDelete(comment.id)}
                                                        style={{ border: 'none', background: '#e11d48', color: 'white', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                    >
                                                        Evet
                                                    </button>
                                                    <button
                                                        onClick={handleCancelDelete}
                                                        style={{ border: 'none', background: '#e5e7eb', color: '#374151', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                    >
                                                        Hayır
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteClick(comment.id)}
                                                    title="Sil"
                                                    style={{ border: 'none', background: '#f3f4f6', color: '#6b7280', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminComments;
