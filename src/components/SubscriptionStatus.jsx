import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';
import './SubscriptionStatus.css';

const SubscriptionStatus = () => {
    const { subscription, planName, isPro, isFree, loading } = useSubscription();

    if (loading) {
        return <div className="subscription-status-loading">Loading...</div>;
    }

    const getStatusColor = () => {
        if (subscription?.status === 'active') return '#10b981';
        if (subscription?.status === 'cancelled') return '#f59e0b';
        if (subscription?.status === 'expired') return '#ef4444';
        return '#6b7280';
    };

    const getExpiryDate = () => {
        if (!subscription?.expires_at) return null;
        return new Date(subscription.expires_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="subscription-status-card">
            <div className="status-header">
                <h3>Subscription Status</h3>
                <span
                    className="status-badge"
                    style={{ background: getStatusColor() }}
                >
                    {subscription?.status || 'active'}
                </span>
            </div>

            <div className="status-details">
                <div className="status-item">
                    <span className="label">Current Plan:</span>
                    <span className="value">{planName}</span>
                </div>

                {subscription?.expires_at && (
                    <div className="status-item">
                        <span className="label">Renews on:</span>
                        <span className="value">{getExpiryDate()}</span>
                    </div>
                )}

                <div className="status-item">
                    <span className="label">Auto-renewal:</span>
                    <span className="value">
                        {subscription?.auto_renew ? '✓ Enabled' : '✗ Disabled'}
                    </span>
                </div>
            </div>

            <div className="status-actions">
                {isFree && (
                    <Link to="/vendor/pricing" className="btn btn-primary">
                        Upgrade to PRO
                    </Link>
                )}
                {isPro && (
                    <button className="btn btn-secondary">
                        Manage Subscription
                    </button>
                )}
            </div>
        </div>
    );
};

export default SubscriptionStatus;
