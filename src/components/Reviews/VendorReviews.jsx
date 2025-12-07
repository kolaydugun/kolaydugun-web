import React, { useState } from 'react';
import { useVendorReviews } from '../../hooks/useVendorReviews';
import { useAuth } from '../../context/AuthContext';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { useLanguage } from '../../context/LanguageContext';

const VendorReviews = ({ vendorId }) => {
    const { reviews, loading, error, userReview, addReview, deleteReview } = useVendorReviews(vendorId);
    const { user } = useAuth();
    const { t } = useLanguage();
    const [showForm, setShowForm] = useState(false);

    if (loading) return <div>{t('common.loading')}</div>;
    if (error) return <div>{t('common.error')}</div>;

    return (
        <div className="vendor-reviews">
            <div className="reviews-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>{t('reviews.title') || 'Reviews'} ({reviews.length})</h3>

                {user && !userReview && !showForm && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        {t('reviews.writeReview') || 'Write a Review'}
                    </button>
                )}
            </div>

            {showForm && (
                <ReviewForm
                    onSubmit={async (rating, comment) => {
                        await addReview(rating, comment);
                        setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <ReviewList
                reviews={reviews}
                onDelete={deleteReview}
                currentUserId={user?.id}
            />
        </div>
    );
};

export default VendorReviews;
