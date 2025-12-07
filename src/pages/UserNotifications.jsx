import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import NotificationSettingsModal from '../components/NotificationSettingsModal';
import './UserNotifications.css';

const UserNotifications = () => {
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const { data, error } = await supabase.functions.invoke('list_user_notifications', {
                body: { page: 1, limit: 50 } // Fetch more for the full page
            });

            if (error) throw error;

            // Handle both array and object responses
            const notificationsList = data?.notifications || data || [];
            setNotifications(Array.isArray(notificationsList) ? notificationsList : []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const { error } = await supabase.functions.invoke('mark_notification_read', {
                body: { notification_id: id }
            });

            if (error) throw error;

            // Update local state
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
            ));

            // Dispatch event to update bell icon
            window.dispatchEvent(new Event('notificationUpdate'));

        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
            if (unreadIds.length === 0) return;

            await Promise.all(unreadIds.map(id =>
                supabase.functions.invoke('mark_notification_read', { body: { notification_id: id } })
            ));

            setNotifications(notifications.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
            window.dispatchEvent(new Event('notificationUpdate'));

        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'announcement': return '📢';
            case 'campaign': return '🎉';
            case 'system': return '🔔';
            default: return '📬';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return t('dashboard.justNow');
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${t('dashboard.minutesAgo')}`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${t('dashboard.hoursAgo')}`;
        return date.toLocaleDateString('tr-TR');
    };

    // Helper to safely translate if content is JSON or Object
    const getLocalizedContent = (content) => {
        try {
            if (!content) return '';

            // If it's already an object (JSONB from Supabase)
            if (typeof content === 'object') {
                if (content.key) {
                    return t(content.key, content.args);
                }
                return ''; // Unknown object structure
            }

            if (typeof content === 'string' && content.trim().startsWith('{')) {
                const parsed = JSON.parse(content);
                if (parsed.key) {
                    return t(parsed.key, parsed.args);
                }
            }
        } catch (e) {
            // Ignore error, treat as plain text
        }
        return content || '';
    };

    return (
        <div className="user-notifications-page">
            <div className="notifications-header">
                <h1>{t('dashboard.notifications.title')}</h1>
                <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        className="settings-btn"
                        onClick={() => setShowSettings(true)}
                        style={{
                            background: 'none',
                            border: '1px solid #ccc',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#666'
                        }}
                    >
                        ⚙️ {t('dashboard.settings')}
                    </button>
                    {Array.isArray(notifications) && notifications.some(n => !n.is_read) && (
                        <button className="mark-all-btn" onClick={markAllAsRead}>
                            Tümünü Okundu İşaretle
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="loading-state">{t('common.loading')}</div>
            ) : notifications.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <h3>{t('dashboard.notifications.empty')}</h3>
                </div>
            ) : (
                <div className="notifications-list">
                    {notifications.map(item => {
                        // Support both nested notification object (legacy/admin) and direct properties (messages/quotes)
                        const rawType = item.notification?.type || item.type;
                        const type = rawType || 'system';

                        const rawTitle = item.notification?.title || item.title;
                        const rawMessage = item.notification?.message || item.message;

                        const title = getLocalizedContent(rawTitle) || t('dashboard.notifications.title');
                        const message = getLocalizedContent(rawMessage);

                        return (
                            <div
                                key={item.id}
                                className={`notification-card ${!item.is_read ? 'unread' : ''}`}
                                onClick={() => !item.is_read && markAsRead(item.id)}
                            >
                                <div className="notification-icon">
                                    {getIcon(type)}
                                </div>
                                <div className="notification-content">
                                    <div className="notification-top">
                                        <span className="notification-type">
                                            {t(`dashboard.notifications.type.${type}`, { defaultValue: t('dashboard.notifications.type.system') })}
                                        </span>
                                        <span className="notification-time">{formatDate(item.created_at)}</span>
                                    </div>
                                    <h3 className="notification-title">{title}</h3>
                                    <p className="notification-message">{message}</p>
                                </div>
                                {!item.is_read && <div className="unread-dot"></div>}
                            </div>
                        )
                    })}
                </div>
            )}

            <NotificationSettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </div>
    );
};

export default UserNotifications;
