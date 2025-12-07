import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';
import './FeatureGate.css';

const FeatureGate = ({ feature, children, fallback, showUpgrade = true }) => {
    const { hasFeature, loading, planName } = useSubscription();

    if (loading) {
        return <div className="feature-gate-loading">Loading...</div>;
    }

    const hasAccess = hasFeature(feature);

    if (!hasAccess) {
        if (fallback) {
            return <>{fallback}</>;
        }

        if (!showUpgrade) {
            return null;
        }

        return (
            <div className="feature-locked">
                <div className="feature-locked-content">
                    <div className="lock-icon">🔒</div>
                    <h3>PRO Feature</h3>
                    <p>This feature requires a PRO subscription</p>
                    <p className="current-plan">Current plan: <strong>{planName}</strong></p>
                    <Link to="/vendor/pricing" className="btn btn-primary">
                        Upgrade to PRO
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default FeatureGate;
