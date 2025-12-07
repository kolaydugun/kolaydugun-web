import React from 'react';
import StarRating from './StarRating';
import { useLanguage } from '../../context/LanguageContext';
import './ReviewList.css';

const ReviewList = ({ reviews, onDelete, currentUserId }) => {
    const { t } = useLanguage();

    if (!reviews || reviews.length === 0) {
        return (
            <div className="no-reviews">
                <p>{t('reviews.noReviews') || 'No reviews yet. Be the first to review!'}</p>
            </div>
        );
    }

    return (
        <div className="review-list">
            {reviews.map((review) => (
                <div key={review.id} className="review-item">
                    <div className="review-header">
                        <div className="reviewer-info">
                            <span className="reviewer-name">
                                {review.profiles?.full_name || review.profiles?.email || 'Anonim Kullanıcı'}
                            </span>
                            <span className="review-date">
                                {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <StarRating rating={review.rating} readOnly size="small" />
                    </div>

                    <div className="review-content">
                        <p>{review.comment}</p>
                    </div>

                    {currentUserId === review.user_id && (
                        <button
                            className="delete-review-btn"
                            onClick={() => {
                                if (window.confirm(t('common.confirmDelete'))) {
                                    onDelete(review.id);
                                }
                            }}
                        >
                            {t('common.delete')}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
