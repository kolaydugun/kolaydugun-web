// supabase/functions/list_admin_conversations/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader || "");

        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Get conversations for this user
        const { data: conversations, error } = await supabase
            .from('admin_conversations')
            .select('*')
            .or(`admin_id.eq.${user.id},user_id.eq.${user.id}`)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        // Get last message and unread count for each conversation
        const conversationsWithDetails = await Promise.all(
            conversations.map(async (conv) => {
                // Get last message
                const { data: lastMessage } = await supabase
                    .from('admin_messages')
                    .select('*')
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Get unread count
                const { count: unreadCount } = await supabase
                    .from('admin_messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conv.id)
                    .eq('receiver_id', user.id)
                    .is('read_at', null);

                // Get other user's vendor/couple profile
                const otherUserId = conv.admin_id === user.id ? conv.user_id : conv.admin_id;

                // Try to get vendor profile first
                const { data: vendorProfile } = await supabase
                    .from('vendors')
                    .select('business_name, category')
                    .eq('user_id', otherUserId)
                    .single();

                // Get user profile for name/surname
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', otherUserId)
                    .single();

                return {
                    ...conv,
                    last_message: lastMessage,
                    unread_count: unreadCount || 0,
                    other_user_profile: vendorProfile,
                    user_profile: userProfile
                };
            })
        );

        return new Response(JSON.stringify({ conversations: conversationsWithDetails }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message || "Server error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
