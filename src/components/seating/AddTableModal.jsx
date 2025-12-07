import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AddTableModal = ({ onClose, onSave }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [shape, setShape] = useState('round'); // round, rectangle, square
    const [capacity, setCapacity] = useState(8);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, type: shape, capacity });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{t('seating_chart.add_table')}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('seating_chart.table_shape')}</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="shape"
                                    value="round"
                                    checked={shape === 'round'}
                                    onChange={(e) => setShape(e.target.value)}
                                />
                                {t('seating_chart.round')}
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="shape"
                                    value="rectangle"
                                    checked={shape === 'rectangle'}
                                    onChange={(e) => setShape(e.target.value)}
                                />
                                {t('seating_chart.rectangle')}
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="shape"
                                    value="square"
                                    checked={shape === 'square'}
                                    onChange={(e) => setShape(e.target.value)}
                                />
                                {t('seating_chart.square')}
                            </label>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div style={{
                        margin: '1.5rem 0',
                        height: '150px',
                        background: '#f9fafb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        border: '1px dashed #d1d5db'
                    }}>
                        <div style={{
                            width: shape === 'rectangle' ? '120px' : '80px',
                            height: '80px',
                            background: 'white',
                            border: '2px solid #9ca3af',
                            borderRadius: shape === 'round' ? '50%' : '8px',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{capacity} {t('seating_chart.person')}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('seating_chart.table_name')}</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('seating_chart.table_name_placeholder')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('seating_chart.guest_count')}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setCapacity(Math.max(2, parseInt(capacity) - 1))}
                            >-</button>
                            <input
                                type="number"
                                className="form-control"
                                style={{ width: '80px', textAlign: 'center' }}
                                value={capacity}
                                onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 0))}
                            />
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setCapacity(Math.min(50, parseInt(capacity) + 1))}
                            >+</button>
                        </div>
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

export default AddTableModal;
