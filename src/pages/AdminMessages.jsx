import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminDashboard.css';

const AdminMessages = () => {
    usePageTitle('Admin Messages');
    const [searchParams] = useSearchParams();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [expandedMessages, setExpandedMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState(searchParams.get('tab') === 'contact' ? 'contact' : 'platform');
    const [contactMessages, setContactMessages] = useState([]);
    const [selectedContactMessages, setSelectedContactMessages] = useState([]);
    const [contactDeleteConfirm, setContactDeleteConfirm] = useState(null);
    const [bulkContactDeleteConfirm, setBulkContactDeleteConfirm] = useState(false);

    useEffect(() => {
        // Update view mode if URL parameter changes
        const tab = searchParams.get('tab');
        if (tab === 'contact' && viewMode !== 'contact') {
            setViewMode('contact');
        } else if (!tab && viewMode !== 'platform') {
            // Optional: Default to platform if no tab matching
        }
    }, [searchParams]);

    useEffect(() => {
        fetchMessages();
        fetchContactMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_admin_platform_messages');

            if (error) {
                console.error('Error fetching messages:', error);
                setError(error);
                setMessages([]);
            } else {
                setError(null);
                // Map to match existing component structure (camelCase)
                const mappedMessages = (data || []).map(msg => ({
                    ...msg,
                    senderName: msg.sender_name,
                    senderRole: msg.sender_role,
                    receiverName: msg.receiver_name,
                    receiverRole: msg.receiver_role,
                    lead: { contact_name: msg.lead_name },
                    lead_name: msg.lead_name,
                    lead_event_date: msg.lead_event_date,
                    lead_guests: msg.lead_guests,
                    lead_phone: msg.lead_phone
                }));
                setMessages(mappedMessages);
            }
        } catch (error) {
            console.error('Error in fetchMessages:', error);
            setError(error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchContactMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContactMessages(data || []);
        } catch (error) {
            console.error('Error fetching contact messages:', error);
        }
    };

    const handleDeleteContactMessage = async (id) => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setContactMessages(prev => prev.filter(m => m.id !== id));
            setContactDeleteConfirm(null);
            setSelectedContactMessages(prev => prev.filter(mid => mid !== id));
        } catch (error) {
            console.error('Error deleting contact message:', error);
            alert('Mesaj silinemedi: ' + error.message);
        }
    };

    const handleMarkContactAsRead = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ read_at: currentStatus ? null : new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            setContactMessages(prev => prev.map(m =>
                m.id === id ? { ...m, read_at: currentStatus ? null : new Date().toISOString() } : m
            ));
        } catch (error) {
            console.error('Error updating read status:', error);
        }
    };

    const handleBulkDeleteContact = () => {
        setBulkContactDeleteConfirm(true);
    };

    const executeBulkDeleteContact = async () => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .in('id', selectedContactMessages);

            if (error) throw error;

            setContactMessages(prev => prev.filter(m => !selectedContactMessages.includes(m.id)));
            setSelectedContactMessages([]);
            setBulkContactDeleteConfirm(false);
        } catch (error) {
            console.error('Error deleting contact messages:', error);
            alert('Toplu silme başarısız: ' + error.message);
        }
    };

    const handleBulkReadContact = async () => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ read_at: new Date().toISOString() })
                .in('id', selectedContactMessages);

            if (error) throw error;

            setContactMessages(prev => prev.map(m =>
                selectedContactMessages.includes(m.id) ? { ...m, read_at: new Date().toISOString() } : m
            ));
            setSelectedContactMessages([]);
        } catch (error) {
            console.error('Error updating bulk read status:', error);
        }
    };

    const toggleSelectAllContact = (e) => {
        if (e.target.checked) {
            setSelectedContactMessages(contactMessages.map(m => m.id));
        } else {
            setSelectedContactMessages([]);
        }
    };

    const toggleSelectContactMessage = (id) => {
        if (selectedContactMessages.includes(id)) {
            setSelectedContactMessages(prev => prev.filter(mid => mid !== id));
        } else {
            setSelectedContactMessages(prev => [...prev, id]);
        }
    };

    const getSenderName = (msg) => {
        if (msg.senderRole === 'vendor') return (msg.senderName || 'Bilinmeyen Tedarikçi') + ' (Tedarikçi)';
        if (msg.senderRole === 'admin') return (msg.senderName || 'Admin') + ' (Yönetici)';
        return (msg.senderName || 'Müşteri');
    };

    const getReceiverName = (msg) => {
        if (msg.receiverRole === 'vendor') return (msg.receiverName || 'Bilinmeyen Tedarikçi') + ' (Tedarikçi)';
        if (msg.receiverRole === 'admin') return (msg.receiverName || 'Admin') + ' (Yönetici)';
        return (msg.receiverName || 'Müşteri');
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            const { error } = await supabase.rpc('delete_admin_message', { target_message_id: messageId });

            if (error) throw error;

            setMessages(prev => prev.filter(m => m.id !== messageId));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Mesaj silinemedi: ' + error.message);
        }
    };

    const handleMarkAsRead = async (messageId) => {
        try {
            const { error } = await supabase.rpc('mark_admin_message_read', { target_message_id: messageId });
            if (error) throw error;

            // Update local state
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, read_at: new Date().toISOString() } : msg
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedMessages(filteredMessages.map(m => m.id));
        } else {
            setSelectedMessages([]);
        }
    };

    const toggleSelectMessage = (id) => {
        if (selectedMessages.includes(id)) {
            setSelectedMessages(prev => prev.filter(mId => mId !== id));
        } else {
            setSelectedMessages(prev => [...prev, id]);
        }
    };

    const toggleExpandMessage = (id) => {
        if (expandedMessages.includes(id)) {
            setExpandedMessages(prev => prev.filter(mId => mId !== id));
        } else {
            setExpandedMessages(prev => [...prev, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`${selectedMessages.length} mesajı silmek istediğinize emin misiniz?`)) return;

        try {
            const { error } = await supabase.rpc('bulk_delete_admin_messages', { target_message_ids: selectedMessages });
            if (error) throw error;

            setMessages(prev => prev.filter(m => !selectedMessages.includes(m.id)));
            setSelectedMessages([]);
            setBulkDeleteConfirm(false);
        } catch (error) {
            console.error('Error deleting messages:', error);
            alert('Toplu silme başarısız: ' + error.message);
        }
    };

    const handleBulkMarkAsRead = async () => {
        try {
            const { error } = await supabase.rpc('bulk_mark_admin_messages_read', { target_message_ids: selectedMessages });
            if (error) throw error;

            setMessages(prev => prev.map(msg =>
                selectedMessages.includes(msg.id) ? { ...msg, read_at: new Date().toISOString() } : msg
            ));
            setSelectedMessages([]);
        } catch (error) {
            console.error('Error marking messages as read:', error);
            alert('İşlem başarısız.');
        }
    };



    const filteredMessages = messages.filter(msg => {
        // Filter by read status
        if (filter === 'unread' && msg.read_at) return false;
        if (filter === 'read' && !msg.read_at) return false;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const content = msg.content?.toLowerCase() || '';
            const senderName = getSenderName(msg).toLowerCase();
            const receiverName = getReceiverName(msg).toLowerCase();
            const leadName = msg.lead?.contact_name?.toLowerCase() || '';

            return content.includes(query) ||
                senderName.includes(query) ||
                receiverName.includes(query) ||
                leadName.includes(query);
        }

        return true;
    });

    return (
        <div className="section container admin-dashboard-container" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="admin-dashboard-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#1a1a1a', fontWeight: '600' }}>Mesajlaşmalar</h1>
                <p style={{ color: '#666' }}>Çift-Tedarikçi ve İletişim Formu mesajlarını yönetin.</p>
            </div>

            {/* Tabs - Modern Pill Style */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: '#f8fafc', padding: '5px', borderRadius: '12px', width: 'fit-content' }}>
                <button
                    onClick={() => setViewMode('platform')}
                    style={{
                        padding: '10px 25px',
                        background: viewMode === 'platform' ? '#fff' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: viewMode === 'platform' ? '#2563eb' : '#64748b',
                        fontWeight: '600',
                        boxShadow: viewMode === 'platform' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Platform Mesajları
                </button>
                <button
                    onClick={() => setViewMode('contact')}
                    style={{
                        padding: '10px 25px',
                        background: viewMode === 'contact' ? '#fff' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: viewMode === 'contact' ? '#2563eb' : '#64748b',
                        fontWeight: '600',
                        boxShadow: viewMode === 'contact' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    İletişim Formu ({contactMessages.length})
                </button>
            </div>

            {viewMode === 'contact' && (
                <div style={{
                    marginBottom: '20px',
                    padding: '12px 16px',
                    backgroundColor: '#eff6ff',
                    borderLeft: '4px solid #3b82f6',
                    borderRadius: '4px',
                    color: '#1e40af',
                    fontSize: '0.9rem'
                }}>
                    <strong>ℹ️ Bilgi:</strong> Bu mesajlar, sitenizin "Bize Ulaşın" sayfasından veya site footer (alt) bölümündeki genel iletişim formundan gelen mesajlardır. Doğrudan site yönetimine gönderilirler.
                </div>
            )}

            {viewMode === 'platform' ? (
                <>
                    {/* Visual Improvement: Card Container */}
                    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden' }}>

                        {/* Search and Filters Bar */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                                <input
                                    type="text"
                                    placeholder="Mesajlarda ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 10px 10px 35px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer' }}
                                >
                                    <option value="all">Tüm Mesajlar</option>
                                    <option value="unread">Okunmamış</option>
                                    <option value="read">Okunmuş</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-spinner" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Yükleniyor...</div>
                        ) : (
                            <>
                                {/* Bulk Actions Bar */}
                                {selectedMessages.length > 0 && (
                                    <div style={{
                                        marginBottom: '10px',
                                        padding: '10px 15px',
                                        background: '#e0f2fe',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        border: '1px solid #bae6fd'
                                    }}>
                                        <span style={{ fontWeight: 600, color: '#0369a1' }}>
                                            {selectedMessages.length} mesaj seçildi
                                        </span>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={handleBulkMarkAsRead}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#fff',
                                                    color: '#0369a1',
                                                    border: '1px solid #0369a1',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: 500
                                                }}
                                            >
                                                Okundu Olarak İşaretle
                                            </button>
                                            <button
                                                onClick={handleBulkDelete}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: 500
                                                }}
                                            >
                                                Seçilenleri Sil
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <th style={{ padding: '16px 20px', textAlign: 'left', width: '40px' }}>
                                                    <input
                                                        type="checkbox"
                                                        onChange={toggleSelectAll}
                                                        checked={filteredMessages.length > 0 && selectedMessages.length === filteredMessages.length}
                                                    />
                                                </th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Tarih</th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Gönderen</th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Alıcı</th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left' }}>İçerik</th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Durum</th>
                                                <th style={{ padding: '16px 20px', textAlign: 'right' }}>İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredMessages.map((msg) => (
                                                <tr key={msg.id} style={{ borderBottom: '1px solid #f1f5f9', background: msg.read_at ? 'white' : '#f8fafc' }}>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMessages.includes(msg.id)}
                                                            onChange={() => toggleSelectMessage(msg.id)}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#64748b' }}>
                                                        {new Date(msg.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{getSenderName(msg)}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{msg.senderRole}</div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <div style={{ fontWeight: '500', color: '#334155' }}>{getReceiverName(msg)}</div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <div
                                                            onClick={() => toggleExpandMessage(msg.id)}
                                                            style={{
                                                                fontSize: '0.875rem',
                                                                color: '#334155',
                                                                maxWidth: expandedMessages.includes(msg.id) ? 'none' : '300px',
                                                                whiteSpace: expandedMessages.includes(msg.id) ? 'normal' : 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Tamamını görmek için tıklayın"
                                                        >
                                                            {msg.content}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                            {msg.lead_name && <span>👤 {msg.lead_name}</span>}
                                                            {msg.lead_event_date && <span>📅 {new Date(msg.lead_event_date).toLocaleDateString('tr-TR')}</span>}
                                                            {msg.lead_event_date && <span>📅 {new Date(msg.lead_event_date).toLocaleDateString('tr-TR')}</span>}
                                                            {msg.lead_phone && (
                                                                <a href={`tel:${msg.lead_phone}`} style={{ textDecoration: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                                                                    📱 {msg.lead_phone}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <span
                                                            onClick={() => !msg.read_at && handleMarkAsRead(msg.id)}
                                                            style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                backgroundColor: !msg.read_at ? '#dbeafe' : '#f0fdf4',
                                                                color: !msg.read_at ? '#1e40af' : '#166534',
                                                                cursor: !msg.read_at ? 'pointer' : 'default',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                            title={!msg.read_at ? "Okundu olarak işaretle" : "Okundu"}
                                                        >
                                                            <span style={{
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                backgroundColor: !msg.read_at ? '#3b82f6' : 'transparent',
                                                                display: !msg.read_at ? 'inline-block' : 'none'
                                                            }}></span>
                                                            {!msg.read_at ? 'Okunmadı' : 'Okundu'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 20px', textAlign: 'right', minWidth: '120px' }}>
                                                        {deleteConfirm === msg.id ? (
                                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                                                <button
                                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                                    title="Onayla"
                                                                    style={{
                                                                        padding: '8px',
                                                                        background: '#dcfce7',
                                                                        color: '#166534',
                                                                        border: 'none',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    ✅
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteConfirm(null)}
                                                                    title="İptal"
                                                                    style={{
                                                                        padding: '8px',
                                                                        background: '#f1f5f9',
                                                                        color: '#64748b',
                                                                        border: 'none',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    ❌
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setDeleteConfirm(msg.id)}
                                                                title="Sil"
                                                                style={{
                                                                    padding: '8px',
                                                                    background: '#fee2e2',
                                                                    color: '#dc2626',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    transition: 'background 0.2s',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <span style={{ fontSize: '1.1rem' }}>🗑️</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                </div>
                            </>
                        )}
                    </div>
                </>
            ) : (
                <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                    {/* Bulk Actions for Contact Messages */}
                    {selectedContactMessages.length > 0 && (
                        <div style={{
                            padding: '10px 15px',
                            background: '#e0f2fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #bae6fd'
                        }}>
                            <span style={{ fontWeight: 600, color: '#0369a1' }}>
                                {selectedContactMessages.length} mesaj seçildi
                            </span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleBulkReadContact}
                                    style={{
                                        padding: '6px 12px',
                                        background: '#fff',
                                        color: '#0369a1',
                                        border: '1px solid #0369a1',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    Okundu Olarak İşaretle
                                </button>

                                {bulkContactDeleteConfirm ? (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={executeBulkDeleteContact}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#dcfce7',
                                                color: '#166534',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            ✅ Onayla
                                        </button>
                                        <button
                                            onClick={() => setBulkContactDeleteConfirm(false)}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#f1f5f9',
                                                color: '#64748b',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            ❌ İptal
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleBulkDeleteContact}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                    >
                                        Seçilenleri Sil
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '16px 20px', width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            onChange={toggleSelectAllContact}
                                            checked={contactMessages.length > 0 && selectedContactMessages.length === contactMessages.length}
                                        />
                                    </th>
                                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>Tarih</th>
                                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>İsim</th>
                                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>Mesaj</th>
                                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', textAlign: 'right' }}>Durum</th>
                                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', textAlign: 'right' }}>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contactMessages.map((msg) => (
                                    <tr key={msg.id} style={{ borderBottom: '1px solid #f1f5f9', background: msg.read_at ? 'white' : '#f8fafc' }}>
                                        <td style={{ padding: '16px 20px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedContactMessages.includes(msg.id)}
                                                onChange={() => toggleSelectContactMessage(msg.id)}
                                            />
                                        </td>
                                        <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.875rem' }}>
                                            {new Date(msg.created_at).toLocaleString('tr-TR')}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{msg.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{msg.email}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px', color: '#334155', maxWidth: '400px' }}>
                                            {msg.message}
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            <span
                                                onClick={() => handleMarkContactAsRead(msg.id, msg.read_at)}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    backgroundColor: !msg.read_at ? '#dbeafe' : '#f0fdf4',
                                                    color: !msg.read_at ? '#1e40af' : '#166534',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <span style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: !msg.read_at ? '#3b82f6' : 'transparent',
                                                    display: !msg.read_at ? 'inline-block' : 'none'
                                                }}></span>
                                                {msg.read_at ? 'Okundu' : 'Yeni'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            {contactDeleteConfirm === msg.id ? (
                                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleDeleteContactMessage(msg.id)}
                                                        title="Onayla"
                                                        style={{ padding: '8px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                                    >
                                                        ✅
                                                    </button>
                                                    <button
                                                        onClick={() => setContactDeleteConfirm(null)}
                                                        title="İptal"
                                                        style={{ padding: '8px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setContactDeleteConfirm(msg.id)}
                                                    style={{ padding: '8px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                                >
                                                    Sil
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {contactMessages.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Henüz iletişim formu mesajı yok.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMessages;
