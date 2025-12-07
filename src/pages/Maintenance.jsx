import React from 'react';
import { Link } from 'react-router-dom';

const Maintenance = () => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '20px',
            background: '#f8fafc'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛠️</div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#1e293b' }}>Bakımdayız</h1>
            <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', marginBottom: '30px' }}>
                Sitemizi daha iyi hale getirmek için kısa bir bakım çalışması yapıyoruz.
                Lütfen daha sonra tekrar ziyaret edin.
            </p>
            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                &copy; {new Date().getFullYear()} KolayDugun.de
            </div>
            <Link to="/login" style={{ marginTop: '20px', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.8rem' }}>Admin Girişi</Link>
        </div>
    );
};

export default Maintenance;
