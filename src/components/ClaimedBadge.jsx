import React from 'react';
import './ClaimedBadge.css';
import { useLanguage } from '../context/LanguageContext';

const ClaimedBadge = ({ claimedDate }) => {
    const { t } = useLanguage();

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="claimed-badge" title={`${t('common.claimed')} ${formatDate(claimedDate)}`}>
            <svg
                className="claimed-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span className="claimed-text">{t('common.claimed')}</span>
        </div>
    );
};

export default ClaimedBadge;
