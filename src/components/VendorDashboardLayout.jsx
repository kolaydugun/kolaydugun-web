import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './VendorDashboardLayout.css';

const VendorDashboardLayout = ({ children }) => {
    const { t } = useLanguage();
    const location = useLocation();

    const menuItems = [
        { path: '/vendor/dashboard', label: t('dashboard.overview') || 'Overview', icon: '📊' },
        { path: '/vendor/dashboard/profile', label: t('dashboard.profileLabel') || 'Profile', icon: '👤' },
        { path: '/vendor/dashboard/services', label: t('dashboard.services') || 'Services', icon: '🛠️' },
        { path: '/vendor/dashboard/calendar', label: t('dashboard.calendar') || 'Calendar', icon: '📅' },
        { path: '/vendor/dashboard/messages', label: t('dashboard.messages') || 'Messages', icon: '✉️' },
        { path: '/vendor/dashboard/promote', label: 'Promote Business', icon: '🚀' },
        { path: '/vendor/dashboard/settings', label: t('dashboard.settings') || 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="vendor-dashboard-layout">
            <aside className="vendor-sidebar">
                <div className="sidebar-header">
                    <h3>Vendor Panel</h3>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="vendor-content">
                {children}
            </main>
        </div>
    );
};

export default VendorDashboardLayout;
