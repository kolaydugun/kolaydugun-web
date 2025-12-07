import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './NotificationCenter.css';

const NotificationCenter = () => {
    const { t } = useLanguage();
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'review': return '⭐';
            case 'credit_request': return '💳';
            case 'transaction': return '💰';
            case 'lead': return '📋';
            case 'registration': return '👥';
            default: return '🔔';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#f44336';
            case 'medium': return '#ff9800';
            case 'low': return '#4caf50';
            default: return '#2196f3';
        }
    };

    const handleNotificationClick = (notification) => {
        // Mark as read
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        // Navigate to related page
        switch (notification.related_type) {
            case 'review':
                navigate('/admin/reviews');
                break;
            case 'credit_request':
                navigate('/admin/credit-approval');
                break;
            case 'transaction':
                navigate('/admin/analytics');
                break;
            case 'lead':
                navigate('/admin/leads');
                break;
            default:
                break;
        }

        setIsOpen(false);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return t('dashboard.justNow');
        if (diffMins < 60) return `${diffMins} ${t('dashboard.minutesAgo')}`;
        if (diffHours < 24) return `${diffHours} ${t('dashboard.hoursAgo')}`;
        if (diffDays < 7) return `${diffDays} ${t('dashboard.daysAgo')}`;
        return date.toLocaleDateString('tr-TR');
    };

    return (
        <div className="notification-center">
            <button
                className="notification-bell"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Bildirimler"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="notification-overlay" onClick={() => setIsOpen(false)} />
                    <div className="notification-dropdown">
                        <div className="notification-header">
                            <h3>Bildirimler</h3>
                            {unreadCount > 0 && (
                                <button
                                    className="mark-all-read-btn"
                                    onClick={markAllAsRead}
                                >
                                    Tümünü Okundu İşaretle
                                </button>
                            )}
                        </div>

                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="no-notifications">
                                    <p>Henüz bildirim yok</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="notification-icon">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">
                                                <span
                                                    className="priority-indicator"
                                                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                                                />
                                                {notification.title}
                                            </div>
                                            <div className="notification-message">
                                                {notification.message}
                                            </div>
                                            <div className="notification-time">
                                                {formatTime(notification.created_at)}
                                            </div>
                                        </div>
                                        <button
                                            className="delete-notification-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            aria-label="Sil"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="notification-footer">
                                <button
                                    className="view-all-btn"
                                    onClick={() => {
                                        navigate('/admin');
                                        setIsOpen(false);
                                    }}
                                >
                                    Dashboard'a Dön
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
