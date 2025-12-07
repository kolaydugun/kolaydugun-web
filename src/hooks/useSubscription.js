import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useSubscription = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchSubscription();
        } else {
            setSubscription(null);
            setLoading(false);
        }
    }, [user]);

    const fetchSubscription = async () => {
        try {
            const { data, error } = await supabase
                .from('vendor_subscriptions')
                .select(`
          *,
          plan:subscription_plans(*)
        `)
                .eq('vendor_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching subscription:', error);
            }

            if (data) {
                setSubscription(data);
            } else {
                // Default to FREE plan
                const { data: freePlan } = await supabase
                    .from('subscription_plans')
                    .select('*')
                    .eq('name', 'free')
                    .single();

                setSubscription({
                    plan: freePlan,
                    status: 'active'
                });
            }
        } catch (err) {
            console.error('Subscription fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const hasFeature = (feature) => {
        if (!subscription?.plan?.features) return false;
        return subscription.plan.features[feature] === true;
    };

    const canAccessLeads = () => {
        return hasFeature('lead_access');
    };

    const getPhotoLimit = () => {
        if (!subscription?.plan?.features) return 1;
        return subscription.plan.features.photos || 1;
    };

    const isPro = () => {
        return subscription?.plan?.name?.includes('pro');
    };

    const isFree = () => {
        return subscription?.plan?.name === 'free';
    };

    const getPlanName = () => {
        return subscription?.plan?.display_name || 'Free';
    };

    const refreshSubscription = () => {
        if (user) {
            fetchSubscription();
        }
    };

    return {
        subscription,
        loading,
        hasFeature,
        canAccessLeads,
        getPhotoLimit,
        isPro: isPro(),
        isFree: isFree(),
        planName: getPlanName(),
        refreshSubscription
    };
};
