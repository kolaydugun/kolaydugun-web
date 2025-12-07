import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './About.css';

const About = () => {
    const { t } = useLanguage();

    return (
        <section id="about" className="section">
            <div className="container">
                <div className="about-content">
                    <h2 className="mb-lg">{t('about.title')}</h2>
                    <p className="about-desc">
                        {t('about.desc')}
                    </p>
                    <div className="about-image"></div>
                </div>
            </div>
        </section>
    );
};

export default About;
