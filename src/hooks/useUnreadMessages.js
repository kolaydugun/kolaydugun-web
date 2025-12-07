import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useUnreadMessages = (userId, userRole) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        const fetchUnreadCount = async () => {
            try {
                const { count, error } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('receiver_id', userId)
                    .is('read_at', null);

                if (error) {
                    console.error('Error fetching unread count:', error);
                    return;
                }

                setUnreadCount(count || 0);
            } catch (error) {
                console.error('Error in useUnreadMessages:', error);
            }
        };

        fetchUnreadCount();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('unread-messages')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${userId}`
                },
                () => {
                    fetchUnreadCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return unreadCount;
};
