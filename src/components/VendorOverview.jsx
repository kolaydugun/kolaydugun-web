import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const VendorOverview = ({ vendor }) => {
    const { t } = useLanguage();

    return (
        <div className="vendor-overview">
            <h2 className="mb-lg">{t('dashboard.overview') || 'Übersicht'}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t('dashboard.views') || 'Profilaufrufe'}</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>128</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t('dashboard.inquiriesLabel') || 'Anfragen'}</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>5</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t('dashboard.rating') || 'Bewertung'}</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>{vendor.rating ?? 0} ⭐</div>
                </div>
            </div>

            <div className="card">
                <h3>{t('dashboard.welcome') || 'Willkommen'}, {vendor.name}!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{t('dashboard.welcomeMsg') || 'Hier ist ein Überblick über Ihre Aktivitäten.'}</p>
            </div>
        </div>
    );
};

export default VendorOverview;
