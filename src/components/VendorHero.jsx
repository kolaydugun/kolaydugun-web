import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './VendorHero.css';

const VendorHero = ({ totalVendors }) => {
    const { t } = useLanguage();

    return (
        <div className="vendor-hero">
            <div className="vendor-hero-overlay"></div>
            <div className="vendor-hero-content container">
                <h1 className="vendor-hero-title">
                    {t('vendorHero.title') || 'Hayalinizdeki Düğün Ekibini Bulun'}
                </h1>
                <p className="vendor-hero-subtitle">
                    {t('vendorHero.subtitle') || 'En iyi düğün mekanları, fotoğrafçılar ve organizasyon firmaları burada.'}
                </p>
                <div className="vendor-hero-stats">
                    <div className="stat-item">
                        <span className="stat-number">{totalVendors}+</span>
                        <span className="stat-label">{t('vendorHero.vendors') || 'Tedarikçi'}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">100%</span>
                        <span className="stat-label">{t('vendorHero.verified') || 'Doğrulanmış'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorHero;
