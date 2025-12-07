import React, { useState } from 'react';
import StarRating from './StarRating';
import { useLanguage } from '../../context/LanguageContext';
import './ReviewForm.css';

const ReviewForm = ({ onSubmit, onCancel }) => {
    const { t } = useLanguage();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError(t('reviews.ratingRequired') || 'Please select a rating');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await onSubmit(rating, comment);
            setRating(0);
            setComment('');
        } catch (err) {
            setError(t('reviews.submitError') || 'Error submitting review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <h3>{t('reviews.writeReview') || 'Write a Review'}</h3>

            <div className="form-group">
                <label>{t('reviews.rating') || 'Rating'}</label>
                <StarRating rating={rating} setRating={setRating} size="large" />
            </div>

            <div className="form-group">
                <label>{t('reviews.comment') || 'Comment'}</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('reviews.commentPlaceholder') || 'Share your experience...'}
                    rows="4"
                    required
                />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? t('common.loading') : t('reviews.submit') || 'Submit Review'}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
