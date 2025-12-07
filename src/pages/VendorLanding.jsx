import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import CategoryGrid from '../components/CategoryGrid';

const VendorLanding = () => {
    const { t } = useTranslation();

    return (
        <div className="vendor-landing-page">
            <div className="container section" style={{ textAlign: 'center' }}>
                <h2>{t('vendorLanding.title')}</h2>
                <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>{t('vendorLanding.subtitle')}</p>
                <Link to="/register" className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '1.1rem' }}>{t('nav.registerBtn')}</Link>
            </div>

            <CategoryGrid />
        </div>
    );
};

export default VendorLanding;
