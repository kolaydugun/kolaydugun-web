import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminLeads.css';

const AdminLeads = () => {
    usePageTitle('Talep Yönetimi');
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedNotes, setSavedNotes] = useState({}); // Track saved status per lead

    useEffect(() => {
        if (user) {
            fetchLeads();
        }
    }, [user]);

    const fetchLeads = async () => {
        setLoading(true);
        console.log('🔍 Fetching leads from admin panel...');

        const { data, error } = await supabase
            .from('leads')
            .select(`
                *,
                category:categories(name),
                city:cities(name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching leads:', error);
        }

        if (data) {
            console.log('✅ Leads fetched:', data.length, 'leads');
            setLeads(data);
        } else {
            console.warn('⚠️ No lead data returned');
        }

        setLoading(false);
    };

    const updateLeadStatus = async (leadId, newStatus) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ admin_notes: notes })
                .eq('id', leadId)
                .select();

            if (error) {
                console.error('Supabase error updating notes:', error);
                throw error;
            }

            console.log('Notes updated successfully:', data);

            // Update local state
            setLeads(leads.map(l => l.id === leadId ? { ...l, admin_notes: notes } : l));

            // Show saved indicator
            setSavedNotes(prev => ({ ...prev, [leadId]: true }));
            setTimeout(() => {
                setSavedNotes(prev => ({ ...prev, [leadId]: false }));
            }, 2000);

        } catch (error) {
            console.error('Error updating notes:', error);
            alert('Hata: Not kaydedilemedi. ' + error.message);
        }
    };

    const handleDelete = async (leadId) => {
        // Direct delete without confirmation dialog to avoid interaction issues
        // if (!window.confirm('Bu talebi silmek istediğinize emin misiniz?')) return;

        try {
            const { data, error } = await supabase.rpc('delete_lead_admin', { lead_id: leadId });

            if (error) {
                console.error('RPC Error:', error);
                alert('Silme işlemi başarısız: ' + error.message);
                return;
            }

            if (data && data.success === false) {
                alert('Silme başarısız: ' + (data.error || 'Bilinmeyen hata'));
                return;
            }

            setLeads(leads.filter(l => l.id !== leadId));
            alert('✅ Talep silindi.');

        } catch (error) {
            console.error('Error deleting lead:', error);
            alert('Silme işlemi başarısız: ' + error.message);
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
        <div className="section container admin-leads-container">
            <div className="admin-leads-header">
                <h1>Talep Yönetimi (CRM)</h1>
                <p>Talepleri takip edin, durumlarını güncelleyin ve notlar alın.</p>
            </div>

            {leads.length === 0 ? (
                <div className="empty-state">
                    <h3>Talep yok</h3>
                    <p>Henüz hiç talep oluşturulmamış.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="leads-table">
                        <thead>
                            <tr>
                                <th style={{ width: '140px' }}>Durum</th>
                                <th>Tarih</th>
                                <th>İsim & Detaylar</th>
                                <th>İletişim</th>
                                <th style={{ width: '300px' }}>Admin Notu</th>
                                <th style={{ width: '50px' }}>Sil</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => (
                                <tr key={lead.id}>
                                    <td>
                                        <select
                                            className={`status-select ${lead.status || 'new'}`}
                                            value={lead.status || 'new'}
                                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                        >
                                            <option value="new">🆕 Yeni</option>
                                            <option value="contacted">📞 Arandı</option>
                                            <option value="quoted">📄 Teklif</option>
                                            <option value="won">✅ Anlaşıldı</option>
                                            <option value="lost">❌ Olumsuz</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem', color: '#555' }}>
                                            {new Date(lead.created_at).toLocaleDateString('tr-TR')}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                            {new Date(lead.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{lead.contact_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                            <span className="badge-outline">{lead.category?.name || '-'}</span> • {lead.city?.name || '-'}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                                            <strong>Bütçe:</strong> {lead.budget_min} - {lead.budget_max}
                                        </div>
                                        {lead.additional_notes && (
                                            <div style={{ marginTop: '6px', fontStyle: 'italic', color: '#666', fontSize: '0.85rem', background: '#f5f5f5', padding: '4px', borderRadius: '4px' }}>
                                                "{lead.additional_notes}"
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <a href={`mailto:${lead.contact_email}`} className="contact-link">
                                            📧 {lead.contact_email}
                                        </a>
                                        <a href={`tel:${lead.contact_phone}`} className="contact-link">
                                            📱 {lead.contact_phone}
                                        </a>
                                    </td>
                                    <td>
                                        <div className="admin-notes-wrapper">
                                            <textarea
                                                className="admin-notes-input"
                                                value={lead.admin_notes || ''}
                                                placeholder="Not ekle..."
                                                rows="3"
                                                onChange={(e) => {
                                                    // Update local state immediately for typing
                                                    setLeads(leads.map(l =>
                                                        l.id === lead.id ? { ...l, admin_notes: e.target.value } : l
                                                    ));
                                                }}
                                            />
                                            <button
                                                className="btn btn-sm btn-primary"
                                                style={{ marginTop: '8px', width: '100%' }}
                                                onClick={() => updateAdminNotes(lead.id, lead.admin_notes || '')}
                                            >
                                                💾 Kaydet
                                            </button>
                                            {savedNotes[lead.id] && (
                                                <span className="note-saved-indicator">✓ Kaydedildi</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleDelete(lead.id)}
                                            className="btn-icon delete"
                                            title="Sil"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        >
                                            🗑️
                                        </button>
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

export default AdminLeads;
