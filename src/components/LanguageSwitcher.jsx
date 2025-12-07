import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();

    return (
        <div className="language-switcher">
            <button
                onClick={() => changeLanguage('de')}
                className={`lang-btn ${language === 'de' ? 'active' : ''}`}
                aria-label="Deutsch"
            >
                DE
            </button>
            <span className="lang-divider">|</span>
            <button
                onClick={() => changeLanguage('en')}
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                aria-label="English"
            >
                EN
            </button>
            <span className="lang-divider">|</span>
            <button
                onClick={() => changeLanguage('tr')}
                className={`lang-btn ${language === 'tr' ? 'active' : ''}`}
                aria-label="Türkçe"
            >
                TR
            </button>
        </div>
    );
};

export default LanguageSwitcher;
