import React, { useState } from 'react';

const GuestList = ({ guests, tables, onDelete }) => {
    const [filter, setFilter] = useState('all'); // all, assigned, unassigned
    const [tableFilter, setTableFilter] = useState('all');

    const filteredGuests = guests.filter(guest => {
        if (filter === 'assigned' && !guest.table_id) return false;
        if (filter === 'unassigned' && guest.table_id) return false;
        if (tableFilter !== 'all' && guest.table_id !== tableFilter) return false;
        return true;
    });

    const getTableName = (tableId) => {
        if (!tableId) return 'Yerleştirilmedi';
        const table = tables.find(t => t.id === tableId);
        return table ? table.name : 'Bilinmeyen Masa';
    };

    return (
        <div className="schema-layout">
            <div className="schema-sidebar">
                <h3>Filtrele</h3>
                <div className="form-group">
                    <label>Durum</label>
                    <div>
                        <label><input type="radio" name="filter" checked={filter === 'all'} onChange={() => setFilter('all')} /> Tüm misafirler</label>
                    </div>
                    <div>
                        <label><input type="radio" name="filter" checked={filter === 'assigned'} onChange={() => setFilter('assigned')} /> Yerleştirilenler</label>
                    </div>
                    <div>
                        <label><input type="radio" name="filter" checked={filter === 'unassigned'} onChange={() => setFilter('unassigned')} /> Yerleştirilmeyenler</label>
                    </div>
                </div>
                <div className="form-group">
                    <label>Masa</label>
                    <select className="form-control" value={tableFilter} onChange={(e) => setTableFilter(e.target.value)}>
                        <option value="all">Tümü</option>
                        {tables.map(table => (
                            <option key={table.id} value={table.id}>{table.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="schema-canvas" style={{ padding: '2rem', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {filteredGuests.map(guest => (
                        <div key={guest.id} style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <span style={{ fontWeight: '500' }}>{guest.name}</span>
                                {guest.plus_ones > 0 && <span className="badge" style={{ marginLeft: '0.5rem' }}>+{guest.plus_ones} kişi</span>}
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {getTableName(guest.table_id)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {guest.email && <span title={guest.email}>📧</span>}
                                {guest.phone && <span title={guest.phone}>📱</span>}
                                <button
                                    onClick={() => onDelete(guest.id)}
                                    style={{
                                        background: '#fee2e2',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        marginLeft: '0.5rem'
                                    }}
                                    title="Sil"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredGuests.length === 0 && <p>Misafir bulunamadı.</p>}
                </div>
            </div>
        </div>
    );
};

export default GuestList;
