import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Services.css';

const ServiceCard = ({ title, desc, icon }) => (
    <div className="service-card">
        <div className="service-icon">
            {icon}
        </div>
        <h3 className="service-title">{title}</h3>
        <p className="service-desc">{desc}</p>
    </div>
);

const Services = () => {
    const { t } = useLanguage();

    return (
        <section id="services" className="section services-section">
            <div className="container">
                <h2 className="text-center mb-lg">{t('services.title')}</h2>

                <div className="services-grid">
                    <ServiceCard
                        title={t('services.venue')}
                        desc={t('services.venueDesc')}
                        icon="🏰"
                    />
                    <ServiceCard
                        title={t('services.catering')}
                        desc={t('services.cateringDesc')}
                        icon="🍽️"
                    />
                    <ServiceCard
                        title={t('services.decor')}
                        desc={t('services.decorDesc')}
                        icon="✨"
                    />
                    <ServiceCard
                        title={t('services.planning')}
                        desc={t('services.planningDesc')}
                        icon="📋"
                    />
                </div>
            </div>
        </section>
    );
};

export default Services;
