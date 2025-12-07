import React from 'react';

const ShareButtons = ({ url, title, lang = 'tr' }) => {
    const shareUrl = encodeURIComponent(url);
    const shareTitle = encodeURIComponent(title);

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareTitle}`,
        whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
    };

    const buttons = [
        { name: 'Facebook', icon: '📘', color: '#1877f2', link: shareLinks.facebook },
        { name: 'Twitter', icon: '🐦', color: '#1da1f2', link: shareLinks.twitter },
        { name: 'Pinterest', icon: '📌', color: '#e60023', link: shareLinks.pinterest },
        { name: 'WhatsApp', icon: '💬', color: '#25d366', link: shareLinks.whatsapp },
        { name: 'LinkedIn', icon: '💼', color: '#0077b5', link: shareLinks.linkedin }
    ];

    const handleShare = (link) => {
        window.open(link, '_blank', 'width=600,height=400');
    };

    return (
        <div className="share-buttons" style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '15px' }}>
                {lang === 'tr' ? '📤 Bu yazıyı paylaş' : lang === 'de' ? '📤 Artikel teilen' : '📤 Share this post'}
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {buttons.map(button => (
                    <button
                        key={button.name}
                        onClick={() => handleShare(button.link)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: button.color,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>{button.icon}</span>
                        <span>{button.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ShareButtons;
