import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './NotificationSettingsModal.css';

const NotificationSettingsModal = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState({
        email_enabled: true,
        sms_enabled: true,
        push_enabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    const fetchSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_notification_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error('Error fetching settings:', error);
            }

            if (data) {
                setSettings({
                    email_enabled: data.email_enabled,
                    sms_enabled: data.sms_enabled,
                    push_enabled: data.push_enabled
                });
            } else {
                // If no settings exist, create default
                await createDefaultSettings(user.id);
            }
        } catch (error) {
            console.error('Error in fetchSettings:', error);
        } finally {
            setLoading(false);
        }
    };

    const createDefaultSettings = async (userId) => {
        try {
            const { error } = await supabase
                .from('user_notification_settings')
                .insert([{ user_id: userId }]);

            if (error) console.error('Error creating default settings:', error);
        } catch (error) {
            console.error('Error in createDefaultSettings:', error);
        }
    };

    const handleToggle = async (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('user_notification_settings')
                .upsert({
                    user_id: user.id,
                    ...newSettings,
                    updated_at: new Date()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error updating settings:', error);
            // Revert on error
            setSettings({ ...settings, [key]: settings[key] });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Bildirim Ayarları</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-spinner">Yükleniyor...</div>
                    ) : (
                        <div className="settings-list">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h3>E-posta Bildirimleri</h3>
                                    <p>Kampanyalar ve duyurular hakkında e-posta al.</p>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.email_enabled}
                                        onChange={() => handleToggle('email_enabled')}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <h3>SMS Bildirimleri</h3>
                                    <p>Önemli güncellemeler için SMS al.</p>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.sms_enabled}
                                        onChange={() => handleToggle('sms_enabled')}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <h3>Anlık Bildirimler (Push)</h3>
                                    <p>Tarayıcı ve uygulama bildirimlerini al.</p>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.push_enabled}
                                        onChange={() => handleToggle('push_enabled')}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {saving && <span className="saving-indicator">Kaydediliyor...</span>}
                    <button className="btn-primary" onClick={onClose}>Tamam</button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsModal;
