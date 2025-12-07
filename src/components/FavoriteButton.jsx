import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './FavoriteButton.css';

const FavoriteButton = ({ vendorId }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkFavoriteStatus();
        }
    }, [user, vendorId]);

    const checkFavoriteStatus = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('vendor_id', vendorId)
            .maybeSingle();

        if (data) {
            setIsFavorite(true);
        }
    };

    const toggleFavorite = async () => {
        if (!user) {
            alert(t('common.loginRequired') || 'Please login to save favorites');
            return;
        }

        setLoading(true);

        try {
            if (isFavorite) {
                // Remove from favorites
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('vendor_id', vendorId);

                if (error) throw error;
                setIsFavorite(false);
            } else {
                // Add to favorites
                const { error } = await supabase
                    .from('favorites')
                    .insert([{
                        user_id: user.id,
                        vendor_id: vendorId
                    }]);

                if (error) throw error;
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert(t('common.error') || 'Failed to update favorite. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
            onClick={toggleFavorite}
            disabled={loading}
            title={isFavorite ? t('common.removeFromFavorites') || 'Remove from favorites' : t('common.addToFavorites') || 'Add to favorites'}
        >
            <svg
                className="favorite-icon"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span className="favorite-text">
                {isFavorite ? t('common.saved') : t('common.save')}
            </span>
        </button>
    );
};

export default FavoriteButton;
