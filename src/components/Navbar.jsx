import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import './Navbar.css';

import { useSiteSettings } from '../context/SiteSettingsContext';

const Navbar = () => {
    const { settings } = useSiteSettings() || { settings: {} };
    const { t } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const unreadCount = useUnreadMessages(user?.id, user?.role);

    // Hide navbar on public wedding pages
    if (location.pathname.startsWith('/w/')) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                    {settings?.logo_url ? (
                        <img
                            src={settings.logo_url}
                            alt="KolayDugun.de"
                            style={{ height: '40px', objectFit: 'contain' }}
                        />
                    ) : (
                        'KolayDugun.de'
                    )}
                </Link>

                <button className="hamburger-btn" onClick={toggleMobileMenu} aria-label="Toggle menu">
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                </button>

                <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/vendors" className="navbar-link" onClick={closeMobileMenu}>{t('nav.services')}</Link>
                    <Link to="/blog" className="navbar-link" onClick={closeMobileMenu}>Blog</Link>

                    <Link to="/tools" className="navbar-link" onClick={closeMobileMenu}>{t('nav.tools')}</Link>
                    <Link to="/vendor-landing" className="navbar-link" onClick={closeMobileMenu}>{t('nav.vendorJoin')}</Link>

                    {/* Mobile-only auth/user links */}
                    <div className="mobile-auth-links">
                        <LanguageSwitcher />
                        {user ? (
                            <>
                                <Link
                                    to={user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor/dashboard' : '/user-dashboard'}
                                    className="navbar-link"
                                    onClick={closeMobileMenu}
                                    style={{ position: 'relative' }}
                                >
                                    {t('nav.dashboard') || 'Panelim'}
                                    {user.role === 'vendor' && unreadCount > 0 && (
                                        <span className="unread-badge">{unreadCount}</span>
                                    )}
                                </Link>
                                {user.role === 'couple' && (
                                    <Link to="/messages" className="navbar-link" onClick={closeMobileMenu}>
                                        💬 {t('nav.messages')}
                                        {unreadCount > 0 && (
                                            <span className="unread-badge">{unreadCount}</span>
                                        )}
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="navbar-link btn-logout-mobile">
                                    {t('nav.logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="navbar-link" onClick={closeMobileMenu}>{t('login.title')}</Link>
                                <Link to="/register" className="navbar-link" onClick={closeMobileMenu}>{t('nav.registerBtn')}</Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="navbar-actions desktop-only">
                    <LanguageSwitcher />

                    {user ? (
                        <div className="navbar-user">
                            <NotificationBell />
                            <Link
                                to={user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor/dashboard' : '/user-dashboard'}
                                className="btn-dashboard"
                                style={{ position: 'relative' }}
                            >
                                {t('nav.dashboard') || 'Panelim'}
                                {user.role === 'vendor' && unreadCount > 0 && (
                                    <span className="unread-badge">{unreadCount}</span>
                                )}
                            </Link>
                            {user.role === 'couple' && (
                                <Link
                                    to="/messages"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: '#ff6b6b',
                                        color: 'white',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        fontSize: '0.9rem',
                                        marginRight: '10px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.3)';
                                    }}
                                >
                                    <span style={{ fontSize: '1.1rem' }}>💬</span>
                                    <span>{t('nav.messages')}</span>
                                    {unreadCount > 0 && (
                                        <span className="unread-badge" style={{
                                            position: 'absolute',
                                            top: '-5px',
                                            right: '-5px',
                                            background: '#ff4757',
                                            color: 'white',
                                            borderRadius: '50%',
                                            padding: '2px 6px',
                                            fontSize: '0.7rem',
                                            border: '2px solid white'
                                        }}>{unreadCount}</span>
                                    )}
                                </Link>
                            )}
                            <span className="user-name">{user.name || user.full_name || user.email}</span>
                            <button onClick={handleLogout} className="btn-logout" aria-label="Logout">
                                {t('nav.logout')}
                            </button>
                        </div>
                    ) : (
                        <div className="navbar-auth-links">
                            <Link to="/login" className="nav-auth-link">{t('login.title')}</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">{t('nav.registerBtn')}</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
