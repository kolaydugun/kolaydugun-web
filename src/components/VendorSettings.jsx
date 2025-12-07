import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './VendorSettings.css';

const VendorSettings = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState({
        businessName: 'My Wedding Business',
        email: 'vendor@example.com',
        emailNotifications: true,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock API call
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const renderGeneralTab = () => (
        <div className="settings-tab-content">
            <div className="form-group">
                <label>{t('settings.businessName')}</label>
                <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="settings-input"
                />
            </div>
            <div className="form-group">
                <label>{t('settings.email')}</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="settings-input"
                />
            </div>
        </div>
    );

    const renderNotificationsTab = () => (
        <div className="settings-tab-content">
            <div className="form-group checkbox-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={formData.emailNotifications}
                        onChange={handleInputChange}
                    />
                    <span className="checkbox-text">{t('settings.emailNotifications')}</span>
                </label>
            </div>
        </div>
    );

    const renderSecurityTab = () => (
        <div className="settings-tab-content">
            <h3>{t('settings.changePassword')}</h3>
            <div className="form-group">
                <label>{t('settings.currentPassword')}</label>
                <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="settings-input"
                />
            </div>
            <div className="form-group">
                <label>{t('settings.newPassword')}</label>
                <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="settings-input"
                />
            </div>
            <div className="form-group">
                <label>{t('settings.confirmNewPassword')}</label>
                <input
                    type="password"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    className="settings-input"
                />
            </div>
        </div>
    );

    return (
        <div className="vendor-settings-container">
            <h2 className="settings-title">{t('settings.title')}</h2>

            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    {t('settings.general')}
                </button>
                <button
                    className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    {t('settings.notifications')}
                </button>
                <button
                    className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    {t('settings.security')}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="settings-form">
                {activeTab === 'general' && renderGeneralTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'security' && renderSecurityTab()}

                <div className="settings-actions">
                    <button type="submit" className="save-button">
                        {t('common.save')}
                    </button>
                </div>

                {showSuccess && (
                    <div className="success-message">
                        {t('settings.saveSuccess')}
                    </div>
                )}
            </form>
        </div>
    );
};

export default VendorSettings;
