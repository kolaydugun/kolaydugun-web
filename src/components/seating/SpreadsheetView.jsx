import React from 'react';

const SpreadsheetView = ({ guests, tables }) => {
    const getTableName = (tableId) => {
        if (!tableId) return 'Yerleştirilmedi';
        const table = tables.find(t => t.id === tableId);
        return table ? table.name : 'Bilinmeyen Masa';
    };

    return (
        <div className="schema-layout">
            <div className="schema-sidebar">
                <h3>Tablo Görünümü</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Eklediğin misafirlerin listesi.
                </p>
            </div>

            <div className="schema-canvas" style={{ padding: '2rem', overflowY: 'auto' }}>
                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Ad Soyad</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Telefon</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>E-posta</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Beraberindeki Kişi</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Masa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guests.map(guest => (
                                <tr key={guest.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>{guest.name}</td>
                                    <td style={{ padding: '1rem' }}>{guest.phone || '-'}</td>
                                    <td style={{ padding: '1rem' }}>{guest.email || '-'}</td>
                                    <td style={{ padding: '1rem' }}>{guest.plus_ones}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`status-badge ${guest.table_id ? 'active' : 'inactive'}`}>
                                            {getTableName(guest.table_id)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {guests.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                                        İlk misafirini ekle!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SpreadsheetView;
