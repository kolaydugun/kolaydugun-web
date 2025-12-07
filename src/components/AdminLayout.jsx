import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>KolayDugun</h2>
                    <span className="admin-badge">Yönetim</span>
                </div>

                <nav className="admin-nav">
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">📊</span>
                        Başlangıç
                    </NavLink>
                    <NavLink to="/admin/translations" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">🌍</span>
                        Çeviriler
                    </NavLink>
                    <NavLink to="/admin/blog" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">📝</span>
                        Blog
                    </NavLink>
                    <NavLink to="/admin/comments" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">💬</span>
                        Blog Yorumları
                    </NavLink>
                    <NavLink to="/admin/pages" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">📄</span>
                        Sayfalar
                    </NavLink>
                    <NavLink to="/admin/faq" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">❓</span>
                        S.S.S.
                    </NavLink>
                    <NavLink to="/admin/notifications" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">📢</span>
                        Bildirimler
                    </NavLink>
                    <NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">🖼️</span>
                        Kategoriler
                    </NavLink>
                    <NavLink to="/admin/vendors" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">🏪</span>
                        Tedarikçiler
                    </NavLink>
                    <NavLink to="/admin/leads" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">📨</span>
                        Talepler
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">👥</span>
                        Kullanıcılar
                    </NavLink>
                    <NavLink to="/admin/reviews" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">⭐</span>
                        Yorumlar
                    </NavLink>
                    <NavLink to="/admin/credit-approval" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">✅</span>
                        Kredi Onayları
                    </NavLink>
                    <NavLink to="/admin/config" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">⚙️</span>
                        Ayarlar
                    </NavLink>
                    <NavLink to="/admin/pricing" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">💰</span>
                        Fiyatlandırma
                    </NavLink>
                    <NavLink to="/admin/finance" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">📊</span>
                        Finans
                    </NavLink>
                    <NavLink to="/admin/messaging" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">🆘</span>
                        Destek Hattı
                    </NavLink>
                    <NavLink to="/admin/messages" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <span className="icon">💬</span>
                        Platform Mesajları
                    </NavLink>
                </nav>

                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <span className="icon">🚪</span>
                        Çıkış Yap
                    </button>
                    <a href="/" className="back-to-site">
                        ← Siteye Dön
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <header className="admin-topbar">
                    <div className="admin-breadcrumbs">
                        {/* Breadcrumbs could go here */}
                        Yönetim Paneli
                    </div>
                    <div className="admin-user-menu">
                        Admin
                    </div>
                </header>
                <div className="admin-page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
