import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    ShoppingBag,
    Users,
    MessageSquare,
    User
} from 'lucide-react';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
    return (
        <nav className="mobile-bottom-nav lg:hidden">
            <div className="mobile-nav-container">
                <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                    <Home className="nav-icon" />
                    <span>Ana Sayfa</span>
                </NavLink>

                <NavLink to="/tr/shop" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                    <ShoppingBag className="nav-icon" />
                    <span>Mağaza</span>
                </NavLink>

                <NavLink to="/vendors" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                    <Users className="nav-icon" />
                    <span>Tedarikçiler</span>
                </NavLink>

                <NavLink to="/community" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                    <MessageSquare className="nav-icon" />
                    <span>Forum</span>
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                    <User className="nav-icon" />
                    <span>Profil</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default MobileBottomNav;
