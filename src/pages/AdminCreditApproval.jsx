import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminConfig.css'; // Reuse admin styles

const AdminCreditApproval = () => {
    usePageTitle('Ödeme Talepleri');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            // Join with vendors table to get business details
            let query = supabase
                .from('transactions')
                .select(`
                    *,
                    vendor:vendors!user_id(business_name, category, city)
                `)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            // alert('İşlemler yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (txnId) => {
        try {
            const { data, error } = await supabase.rpc('approve_transaction_admin', { transaction_id: txnId });

            if (error) throw error;
            if (data && data.success === false) throw new Error(data.error);

            alert('✅ İşlem onaylandı ve krediler yüklendi!');
            fetchTransactions(); // Refresh list
        } catch (error) {
            console.error('Approval error:', error);
            alert('Onaylama hatası: ' + error.message);
        }
    };

    const handleReject = async (txnId) => {
        try {
            const { data, error } = await supabase.rpc('reject_transaction_admin', { transaction_id: txnId });

            if (error) throw error;
            if (data && data.success === false) throw new Error(data.error);

            alert('❌ İşlem reddedildi.');
            fetchTransactions();
        } catch (error) {
            console.error('Rejection error:', error);
            alert('Reddetme hatası: ' + error.message);
        }
    };

    if (loading && !transactions.length) return <div className="p-4">Yükleniyor...</div>;

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <h1>Ödeme Talepleri</h1>
                <p>Tedarikçilerin kredi satın alma taleplerini buradan yönetebilirsiniz.</p>
            </div>

            <div className="filter-tabs" style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setFilter('pending')}
                    className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ marginRight: '10px' }}
                >
                    ⏳ Bekleyenler
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`btn ${filter === 'approved' ? 'btn-success' : 'btn-outline-secondary'}`}
                    style={{ marginRight: '10px' }}
                >
                    ✅ Onaylananlar
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={`btn ${filter === 'rejected' ? 'btn-danger' : 'btn-outline-secondary'}`}
                    style={{ marginRight: '10px' }}
                >
                    ❌ Reddedilenler
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`btn ${filter === 'all' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                >
                    📋 Tümü
                </button>
            </div>

            {transactions.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <h3>Kayıt bulunamadı</h3>
                    <p>Bu filtreye uygun işlem yok.</p>
                </div>
            ) : (
                <div className="admin-card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#666' }}>
                                <th style={{ padding: '12px' }}>Tarih</th>
                                <th style={{ padding: '12px' }}>Tedarikçi</th>
                                <th style={{ padding: '12px' }}>Açıklama</th>
                                <th style={{ padding: '12px' }}>Tutar</th>
                                <th style={{ padding: '12px' }}>Kredi</th>
                                <th style={{ padding: '12px' }}>Durum</th>
                                <th style={{ padding: '12px' }}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(txn => (
                                <tr key={txn.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>
                                        {new Date(txn.created_at).toLocaleString('tr-TR')}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{txn.vendor?.business_name || 'İsimsiz'}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{txn.vendor?.category || '-'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{txn.vendor?.city || '-'}</div>
                                    </td>
                                    <td style={{ padding: '12px' }}>{txn.description}</td>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>€{txn.amount}</td>
                                    <td style={{ padding: '12px', color: '#1976d2' }}>+{txn.credits_added}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            background: txn.status === 'pending' ? '#fff3cd' : txn.status === 'approved' ? '#d1e7dd' : '#f8d7da',
                                            color: txn.status === 'pending' ? '#856404' : txn.status === 'approved' ? '#0f5132' : '#842029'
                                        }}>
                                            {txn.status === 'pending' ? 'Bekliyor' : txn.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {txn.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button
                                                    onClick={() => handleApprove(txn.id)}
                                                    className="btn btn-sm btn-success"
                                                    title="Onayla"
                                                >
                                                    ✅
                                                </button>
                                                <button
                                                    onClick={() => handleReject(txn.id)}
                                                    className="btn btn-sm btn-danger"
                                                    title="Reddet"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminCreditApproval;
