import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import FavoritesList from '../components/UserDashboard/FavoritesList';
import BudgetPlanner from '../components/UserDashboard/BudgetPlanner';
import Checklist from '../components/UserDashboard/Checklist';
import './VendorDashboard.css'; // Reusing vendor dashboard styles for now

const UserDashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    if (!user) {
        navigate('/login');
        return null;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="dashboard-overview">
                        <h1>{t('dashboard.userOverview.welcomeTitle').replace('{{email}}', user.email)}</h1>
                        <p>{t('dashboard.userOverview.welcomeSubtitle')}</p>
                        <div className="stats-grid">
                            <div className="stat-card" onClick={() => setActiveTab('favorites')} style={{ cursor: 'pointer' }}>
                                <h3>❤️ {t('dashboard.userOverview.favoritesCard.title')}</h3>
                                <p>{t('dashboard.userOverview.favoritesCard.desc')}</p>
                            </div>
                            <div className="stat-card" onClick={() => setActiveTab('budget')} style={{ cursor: 'pointer' }}>
                                <h3>💰 {t('dashboard.userOverview.budgetCard.title')}</h3>
                                <p>{t('dashboard.userOverview.budgetCard.desc')}</p>
                            </div>
                            <div className="stat-card" onClick={() => setActiveTab('checklist')} style={{ cursor: 'pointer' }}>
                                <h3>✅ {t('dashboard.userOverview.checklistCard.title')}</h3>
                                <p>{t('dashboard.userOverview.checklistCard.desc')}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'favorites':
                return <FavoritesList userId={user.id} />;
            case 'budget':
                return <BudgetPlanner userId={user.id} />;
            case 'checklist':
                return <Checklist userId={user.id} />;
            default:
                return <div>{t('dashboard.pageNotFound')}</div>;
        }
    };

    return (
        <div className="section container dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h3>{t('dashboard.weddingPanel')}</h3>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        📊 {t('dashboard.sidebar.overview')}
                    </button>
                    <button className={activeTab === 'favorites' ? 'active' : ''} onClick={() => setActiveTab('favorites')}>
                        ❤️ {t('dashboard.sidebar.favorites')}
                    </button>
                    <button className={activeTab === 'budget' ? 'active' : ''} onClick={() => setActiveTab('budget')}>
                        💰 {t('dashboard.sidebar.budget')}
                    </button>
                    <button className={activeTab === 'checklist' ? 'active' : ''} onClick={() => setActiveTab('checklist')}>
                        ✅ {t('dashboard.sidebar.checklist')}
                    </button>
                    <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #eee' }} />
                    <button
                        className="support-btn"
                        onClick={() => window.location.href = '/messages?support=true'}
                        style={{ color: '#007bff', fontWeight: 'bold' }}
                    >
                        🆘 {t('dashboard.liveSupport')}
                    </button>
                </nav>
            </aside>
            <main className="dashboard-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default UserDashboard;
