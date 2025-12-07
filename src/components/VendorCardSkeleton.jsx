import React from 'react';
import './VendorCard.css'; // Reuse basic card styles

const VendorCardSkeleton = () => {
    return (
        <div className="vendor-card skeleton-card">
            <div className="vendor-card-image-wrapper skeleton-image"></div>
            <div className="vendor-card-content">
                <div className="vendor-card-header">
                    <div className="skeleton-text skeleton-category"></div>
                    <div className="skeleton-text skeleton-rating"></div>
                </div>
                <div className="skeleton-text skeleton-title"></div>
                <div className="skeleton-text skeleton-location"></div>
                <div className="vendor-card-footer">
                    <div className="skeleton-text skeleton-price"></div>
                    <div className="skeleton-button"></div>
                </div>
            </div>
        </div>
    );
};

export default VendorCardSkeleton;
