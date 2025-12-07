// supabase/functions/get_admin_messages/index.ts
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

        const url = new URL(req.url);
        const conversation_id = url.searchParams.get('conversation_id');

        if (!conversation_id) {
            return new Response(JSON.stringify({ error: "Missing conversation_id" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Verify user is part of this conversation
        const { data: conversation, error: convError } = await supabase
            .from('admin_conversations')
            .select('*')
            .eq('id', conversation_id)
            .or(`admin_id.eq.${user.id},user_id.eq.${user.id}`)
            .single();

        if (convError || !conversation) {
            return new Response(JSON.stringify({ error: "Conversation not found or unauthorized" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Get messages
        const { data: messages, error } = await supabase
            .from('admin_messages')
            .select('*')
            .eq('conversation_id', conversation_id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Mark messages as read
        const unreadMessageIds = messages
            .filter(m => m.receiver_id === user.id && !m.read_at)
            .map(m => m.id);

        if (unreadMessageIds.length > 0) {
            try {
                await supabase
                    .from('admin_messages')
                    .update({ read_at: new Date().toISOString() })
                    .in('id', unreadMessageIds);
            } catch (updateError) {
                console.error('Error marking messages as read:', updateError);
                // Continue execution to return messages even if marking read fails
            }
        }

        return new Response(JSON.stringify({ messages }), {
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
