import React, { useState } from 'react';
import './ShareButton.css';
import { useLanguage } from '../context/LanguageContext';

const ShareButton = ({ vendor }) => {
    const [copied, setCopied] = useState(false);
    const { t } = useLanguage();

    const handleShare = async () => {
        const shareData = {
            title: vendor.business_name || vendor.name,
            text: `Check out ${vendor.business_name || vendor.name} on KolayDugun!`,
            url: window.location.href
        };

        try {
            // Try Web Share API (mobile)
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard (desktop)
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            // User cancelled or error occurred
            console.log('Share cancelled or failed:', error);
        }
    };

    return (
        <button
            className="share-button"
            onClick={handleShare}
            title={t('common.share')}
        >
            <svg
                className="share-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 15.2491 15.0227 15.3715L8.08261 11.9013C7.54305 11.3453 6.8108 11 6 11C4.34315 11 3 12.3431 3 14C3 15.6569 4.34315 17 6 17C6.8108 17 7.54305 16.6547 8.08261 16.0987L15.0227 19.6285C15.0077 19.7509 15 19.8745 15 20C15 21.6569 16.3431 23 18 23C19.6569 23 21 21.6569 21 20C21 18.3431 19.6569 17 18 17C17.1892 17 16.457 17.3453 15.9174 17.9013L8.97733 14.3715C8.99229 14.2491 9 14.1255 9 14C9 13.8745 8.99229 13.7509 8.97733 13.6285L15.9174 10.0987C16.457 10.6547 17.1892 11 18 11C19.6569 11 21 9.65685 21 8C21 6.34315 19.6569 5 18 5C16.3431 5 15 6.34315 15 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span className="share-text">{copied ? 'Copied!' : t('common.share')}</span>
        </button>
    );
};

export default ShareButton;
