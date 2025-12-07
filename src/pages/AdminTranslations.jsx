import React, { useState, useMemo } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminTranslations.css';

const AdminTranslations = () => {
    usePageTitle('Çeviri Yönetimi');
    const { translations, loading, updateTranslation } = useTranslations();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingKey, setEditingKey] = useState(null);
    const [editValues, setEditValues] = useState({ en: '', de: '', tr: '' });
    const [saving, setSaving] = useState(false);

    const filteredTranslations = useMemo(() => {
        if (!translations) return [];
        return Object.entries(translations).filter(([key, values]) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                key.toLowerCase().includes(searchLower) ||
                (typeof values.en === 'string' && values.en.toLowerCase().includes(searchLower)) ||
                (typeof values.tr === 'string' && values.tr.toLowerCase().includes(searchLower)) ||
                (typeof values.de === 'string' && values.de.toLowerCase().includes(searchLower))
            );
        }).sort((a, b) => a[0].localeCompare(b[0]));
    }, [translations, searchTerm]);

    const handleEditClick = (key, values) => {
        setEditingKey(key);
        setEditValues({ ...values });
    };

    const handleSave = async (key) => {
        setSaving(true);
        try {
            await updateTranslation(key, editValues);
            setEditingKey(null);
        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingKey(null);
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="admin-translations-page">
            <div className="admin-page-header">
                <h1>Çeviri Yönetimi</h1>
                <p>Sitedeki tüm metinleri buradan düzenleyebilirsiniz.</p>
            </div>

            <div className="admin-card">
                <div className="search-bar" style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Çeviri ara (Anahtar kelime, TR, EN, DE)..."
                        className="form-control"
                        style={{ padding: '10px', width: '100%', maxWidth: '400px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="translations-table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
                        <thead>
                            <tr style={{ background: '#f0f0f1', borderBottom: '2px solid #c3c4c7', textAlign: 'left' }}>
                                <th style={{ padding: '12px', width: '15%' }}>Anahtar (Key)</th>
                                <th style={{ padding: '12px', width: '25%' }}>🇹🇷 Türkçe</th>
                                <th style={{ padding: '12px', width: '25%' }}>🇬🇧 İngilizce</th>
                                <th style={{ padding: '12px', width: '25%' }}>🇩🇪 Almanca</th>
                                <th style={{ padding: '12px', width: '10%' }}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTranslations.map(([key, values]) => (
                                <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', verticalAlign: 'top', fontWeight: '500', color: '#2271b1' }}>
                                        {key}
                                    </td>

                                    {editingKey === key ? (
                                        <>
                                            <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                                <textarea
                                                    className="form-control"
                                                    style={{ width: '100%', minHeight: '60px' }}
                                                    value={editValues.tr}
                                                    onChange={(e) => setEditValues(prev => ({ ...prev, tr: e.target.value }))}
                                                />
                                            </td>
                                            <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                                <textarea
                                                    className="form-control"
                                                    style={{ width: '100%', minHeight: '60px' }}
                                                    value={editValues.en}
                                                    onChange={(e) => setEditValues(prev => ({ ...prev, en: e.target.value }))}
                                                />
                                            </td>
                                            <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                                <textarea
                                                    className="form-control"
                                                    style={{ width: '100%', minHeight: '60px' }}
                                                    value={editValues.de}
                                                    onChange={(e) => setEditValues(prev => ({ ...prev, de: e.target.value }))}
                                                />
                                            </td>
                                            <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleSave(key)}
                                                        disabled={saving}
                                                    >
                                                        {saving ? '...' : 'Kaydet'}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={handleCancel}
                                                        disabled={saving}
                                                    >
                                                        İptal
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={{ padding: '12px', verticalAlign: 'top', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={typeof values.tr === 'object' ? JSON.stringify(values.tr) : values.tr}>
                                                {typeof values.tr === 'object' ? JSON.stringify(values.tr) : values.tr}
                                            </td>
                                            <td style={{ padding: '12px', verticalAlign: 'top', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={typeof values.en === 'object' ? JSON.stringify(values.en) : values.en}>
                                                {typeof values.en === 'object' ? JSON.stringify(values.en) : values.en}
                                            </td>
                                            <td style={{ padding: '12px', verticalAlign: 'top', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={typeof values.de === 'object' ? JSON.stringify(values.de) : values.de}>
                                                {typeof values.de === 'object' ? JSON.stringify(values.de) : values.de}
                                            </td>
                                            <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEditClick(key, values)}
                                                    style={{ width: '100%' }}
                                                >
                                                    Düzenle
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default AdminTranslations;
