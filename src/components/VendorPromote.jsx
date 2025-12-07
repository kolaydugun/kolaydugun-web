import React, { useState } from 'react';
import { useVendors } from '../context/VendorContext';
import { useLanguage } from '../context/LanguageContext';
import './VendorPromote.css';

const VendorPromote = ({ vendor }) => {
    const { t } = useLanguage();
    const { buyFeaturedPackage } = useVendors();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handlePurchase = async () => {
        setLoading(true);
        setError('');
        try {
            await buyFeaturedPackage(vendor.id);
            setSuccess(true);
        } catch (err) {
            setError('Purchase failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="promote-container success">
                <h2>🎉 Success!</h2>
                <p>Your business is now featured on the homepage.</p>
                <p>This status will be active for 30 days.</p>
                <button className="btn btn-secondary" onClick={() => setSuccess(false)}>Back</button>
            </div>
        );
    }

    return (
        <div className="promote-container">
            <h2 className="promote-title">Promote Your Business</h2>
            <p className="promote-subtitle">Reach more couples by featuring your business on the homepage.</p>

            <div className="ad-product-card">
                <div className="ad-header">
                    <h3>Homepage Featured Listing</h3>
                    <span className="ad-price">€49.99 / 30 days</span>
                </div>
                <div className="ad-body">
                    <ul>
                        <li>✅ Appear in the "Featured Vendors" section on the homepage</li>
                        <li>✅ Higher visibility in search results</li>
                        <li>✅ "Featured" badge on your profile</li>
                    </ul>
                </div>
                <div className="ad-footer">
                    {vendor.isFeatured ? (
                        <button className="btn btn-disabled" disabled>
                            Currently Active (until {new Date(vendor.featured_until).toLocaleDateString()})
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handlePurchase}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Buy Now'}
                        </button>
                    )}
                </div>
                {error && <p className="error-text">{error}</p>}
            </div>
        </div>
    );
};

export default VendorPromote;
