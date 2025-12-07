import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const InitialSetupModal = ({ onSave, initialData }) => {
    const { t } = useTranslation();
    const [totalGuests, setTotalGuests] = useState(initialData?.total_guests || '');
    const [venueName, setVenueName] = useState(initialData?.venue_name || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!totalGuests || !venueName) return;
        onSave({ totalGuests, venueName });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{t('seating_chart.welcome_title')}</h2>
                </div>
                <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                    {t('seating_chart.welcome_subtitle')}
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('seating_chart.total_guests_question')}</label>
                        <input
                            type="number"
                            className="form-control"
                            value={totalGuests}
                            onChange={(e) => setTotalGuests(e.target.value)}
                            placeholder="Örn: 250"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('seating_chart.venue_name_question')}</label>
                        <input
                            type="text"
                            className="form-control"
                            value={venueName}
                            onChange={(e) => setVenueName(e.target.value)}
                            placeholder={t('seating_chart.venue_name_placeholder')}
                            required
                        />
                    </div>
                    <div className="modal-footer">
                        <a href="/" style={{ marginRight: 'auto', alignSelf: 'center', color: '#6b7280', textDecoration: 'none' }}>
                            {t('common.home')}
                        </a>
                        <button type="submit" className="btn btn-primary">
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InitialSetupModal;
