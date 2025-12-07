import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useVendorReviews = (vendorId) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userReview, setUserReview] = useState(null);

    const fetchReviews = useCallback(async () => {
        if (!vendorId) return;

        try {
            setLoading(true);
            // Fetch reviews with user profile information
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    id, 
                    rating, 
                    comment, 
                    created_at, 
                    user_id, 
                    is_approved,
                    profiles:user_id (
                        full_name,
                        email
                    )
                `)
                .eq('vendor_id', vendorId)
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setReviews(data || []);

            if (user) {
                const myReview = data.find(r => r.user_id === user.id);
                setUserReview(myReview || null);
            }

        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [vendorId, user]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const addReview = async (rating, comment) => {
        if (!user) throw new Error('User not logged in');

        try {
            const { data, error } = await supabase
                .from('reviews')
                .insert([{
                    vendor_id: vendorId,
                    user_id: user.id,
                    rating,
                    comment
                }])
                .select()
                .single();

            if (error) throw error;

            console.log('Review added:', data);
            fetchReviews();
            return data;
        } catch (err) {
            console.error('Error adding review:', err);
            throw err;
        }
    };

    const deleteReview = async (reviewId) => {
        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', reviewId);

            if (error) throw error;

            fetchReviews();
        } catch (err) {
            console.error('Error deleting review:', err);
            throw err;
        }
    };

    return {
        reviews,
        loading,
        error,
        userReview,
        addReview,
        deleteReview,
        refreshReviews: fetchReviews
    };
};
