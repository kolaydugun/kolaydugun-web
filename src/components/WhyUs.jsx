import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './WhyUs.css';

const WhyUs = () => {
    const { t } = useLanguage();

    const features = [
        { id: 'verified', icon: '✅' },
        { id: 'tools', icon: '🛠️' },
        { id: 'support', icon: '🌍' }
    ];

    return (
        <section className="section container why-us">
            <h2 className="section-title">{t('whyUs.title') || 'Warum KolayDugun?'}</h2>
            <div className="features-grid">
                {features.map((feature) => (
                    <div key={feature.id} className="feature-card">
                        <div className="feature-icon">{feature.icon}</div>
                        <h3 className="feature-title">{t(`whyUs.${feature.id}.title`)}</h3>
                        <p className="feature-desc">{t(`whyUs.${feature.id}.desc`)}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WhyUs;
