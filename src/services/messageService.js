import { supabase } from '../supabaseClient';

export const messageService = {
    // Get all messages for a specific lead
    async getMessages(leadId) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Send a new message
    async sendMessage(leadId, senderId, receiverId, content) {
        const { data, error } = await supabase
            .from('messages')
            .insert([
                {
                    lead_id: leadId,
                    sender_id: senderId,
                    receiver_id: receiverId,
                    content: content
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Mark messages as read
    async markAsRead(messageIds) {
        if (!messageIds || messageIds.length === 0) return;

        const { error } = await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', messageIds);

        if (error) throw error;
    },

    // Get unread message count for a user
    async getUnreadCount(userId) {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .is('read_at', null);

        if (error) throw error;
        return count;
    },

    // Subscribe to new messages for a lead
    subscribeToMessages(leadId, callback) {
        return supabase
            .channel(`public:messages:lead_id=eq.${leadId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `lead_id=eq.${leadId}`
            }, payload => {
                callback(payload.new);
            })
            .subscribe();
    }
};
