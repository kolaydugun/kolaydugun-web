import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TableList = ({ tables, onDelete }) => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('all'); // all, empty, full
    const [typeFilter, setTypeFilter] = useState('all'); // all, round, rectangle, square

    const filteredTables = tables.filter(table => {
        if (typeFilter !== 'all' && table.type !== typeFilter) return false;
        // Add logic for empty/full when we have guest counts
        return true;
    });

    return (
        <div className="schema-layout">
            <div className="schema-sidebar">
                <h3>{t('seating_chart.filter')}</h3>
                <div className="form-group">
                    <label>{t('seating_chart.status')}</label>
                    <div>
                        <label><input type="radio" name="filter" checked={filter === 'all'} onChange={() => setFilter('all')} /> {t('seating_chart.all_tables')}</label>
                    </div>
                    <div>
                        <label><input type="radio" name="filter" checked={filter === 'empty'} onChange={() => setFilter('empty')} /> {t('seating_chart.empty_tables')}</label>
                    </div>
                    <div>
                        <label><input type="radio" name="filter" checked={filter === 'full'} onChange={() => setFilter('full')} /> {t('seating_chart.full_tables')}</label>
                    </div>
                </div>
                <div className="form-group">
                    <label>{t('seating_chart.table_type')}</label>
                    <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="all">{t('seating_chart.all')}</option>
                        <option value="round">{t('seating_chart.round')}</option>
                        <option value="rectangle">{t('seating_chart.rectangle')}</option>
                        <option value="square">{t('seating_chart.square')}</option>
                    </select>
                </div>
            </div>

            <div className="schema-canvas" style={{ padding: '2rem', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredTables.map((table, index) => (
                        <div key={table.id} style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>{index + 1}. {table.name}</h4>
                                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                                    {table.type === 'round' ? t('seating_chart.round') : table.type === 'rectangle' ? t('seating_chart.rectangle') : t('seating_chart.square')} {t('seating_chart.table')},
                                    {table.capacity} {t('seating_chart.seat')}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-icon" title={t('common.edit')}>✏️</button>
                                <button
                                    className="btn-icon"
                                    style={{ color: '#ef4444' }}
                                    onClick={() => onDelete(table.id)}
                                    title={t('common.delete')}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredTables.length === 0 && <p>{t('seating_chart.no_tables_found')}</p>}
                </div>
            </div>
        </div>
    );
};

export default TableList;
