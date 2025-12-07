import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AddGuestModal = ({ tables, onClose, onSave }) => {
    const { t } = useTranslation();
    const [fullName, setFullName] = useState('');
    const [tableId, setTableId] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [extraGuestCount, setExtraGuestCount] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name: fullName,
            table_id: tableId || null,
            email,
            phone, // Assuming phone column exists or we add it, prompt said optional
            plus_ones: extraGuestCount // Mapping to plus_ones column
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{t('seating_chart.add_guest')}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('seating_chart.guest_name')}</label>
                        <input
                            type="text"
                            className="form-control"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={t('seating_chart.guest_name_placeholder')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('seating_chart.table')}</label>
                        <select
                            className="form-control"
                            value={tableId}
                            onChange={(e) => setTableId(e.target.value)}
                        >
                            <option value="">{t('seating_chart.unassigned')}</option>
                            {tables.map(table => (
                                <option key={table.id} value={table.id}>
                                    {table.name} ({table.capacity} {t('seating_chart.person')})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('seating_chart.email_optional')}</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('seating_chart.phone_optional')}</label>
                        <input
                            type="tel"
                            className="form-control"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0555..."
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('seating_chart.plus_ones')}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setExtraGuestCount(Math.max(0, extraGuestCount - 1))}
                            >-</button>
                            <span style={{ fontWeight: '600', minWidth: '3rem', textAlign: 'center' }}>{extraGuestCount} {t('seating_chart.person')}</span>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setExtraGuestCount(Math.min(10, extraGuestCount + 1))}
                            >+</button>
                        </div>
                        <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                            {t('seating_chart.plus_ones_hint', { count: extraGuestCount })}
                        </small>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGuestModal;
