import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES, CITIES, getCategoryTranslationKey } from '../constants/vendorData';
import './Hero.css';

const Hero = ({ title, subtitle, backgroundImage }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (category) params.append('category', category);
        navigate(`/vendors?${params.toString()}`);
    };

    const heroStyle = backgroundImage ? {
        background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url("${backgroundImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    } : {};

    return (
        <section id="home" className="hero-section" style={heroStyle}>
            <div className="hero-overlay"></div>

            <div className="container hero-content">
                <h1 className="hero-title">
                    {title || t('hero.title')}
                </h1>
                <p className="hero-subtitle">
                    {subtitle || t('hero.subtitle')}
                </p>

                <form className="hero-search-form" onSubmit={handleSearch}>
                    <select
                        className="hero-search-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        aria-label="Select City"
                    >
                        <option value="">{t('search.cityPlaceholder') || 'Stadt wählen'}</option>
                        {CITIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    <select
                        className="hero-search-input"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        aria-label="Select Category"
                    >
                        <option value="">{t('search.categoryPlaceholder') || 'Kategorie wählen'}</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {t('categories.' + getCategoryTranslationKey(cat))}
                            </option>
                        ))}
                    </select>

                    <button type="submit" className="btn btn-primary hero-search-btn">
                        {t('search.button') || 'ARA'}
                    </button>
                </form>

                <div className="hero-cta-container">
                    <button
                        type="button"
                        className="hero-cta-button"
                        onClick={() => navigate('/contact')}
                    >
                        <span className="cta-icon">✨</span>
                        <span className="cta-text">{t('hero.getFreeQuote')}</span>
                        <span className="cta-subtext">{t('hero.ctaSubtext')}</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
