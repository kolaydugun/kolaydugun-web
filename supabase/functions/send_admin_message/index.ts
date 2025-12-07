// supabase/functions/send_admin_message/index.ts
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

        const { receiver_id, content, user_type } = await req.json();

        if (!content) {
            return new Response(JSON.stringify({ error: "Content is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Determine admin_id and user_id based on sender
        const { data: senderProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = senderProfile?.role === 'admin';

        let target_admin_id = receiver_id;

        // If sender is not admin and no receiver_id provided, find an admin
        if (!isAdmin && !target_admin_id) {
            const { data: adminUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'admin')
                .limit(1)
                .single();

            if (adminUser) {
                target_admin_id = adminUser.id;
            } else {
                return new Response(JSON.stringify({ error: "No admin found to send message to" }), {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }
        }

        const admin_id = isAdmin ? user.id : target_admin_id;
        const user_id = isAdmin ? receiver_id : user.id;

        // Find or create conversation
        let { data: conversation, error: convError } = await supabase
            .from('admin_conversations')
            .select('*')
            .eq('admin_id', admin_id)
            .eq('user_id', user_id)
            .single();

        if (convError || !conversation) {
            // Create new conversation
            const { data: newConv, error: createError } = await supabase
                .from('admin_conversations')
                .insert({
                    admin_id,
                    user_id,
                    user_type: user_type || 'vendor'
                })
                .select()
                .single();

            if (createError) throw createError;
            conversation = newConv;
        }

        // Send message
        const final_receiver_id = isAdmin ? receiver_id : target_admin_id;

        const { data: message, error: msgError } = await supabase
            .from('admin_messages')
            .insert({
                conversation_id: conversation.id,
                sender_id: user.id,
                receiver_id: final_receiver_id,
                content: content
            })
            .select()
            .single();

        if (msgError) throw msgError;

        // --- NOTIFICATION LOGIC (Explicit) ---
        // If the sender is a USER (not admin), we must notify the ADMIN.
        if (!isAdmin) {
            // Attempt to get a nice name for the notification
            let senderName = 'Bir Kullanıcı';

            // 1. Try Vendor Table
            const { data: vendorData } = await supabase
                .from('vendors')
                .select('business_name')
                .eq('user_id', user.id)
                .single();

            if (vendorData) {
                senderName = vendorData.business_name;
            } else {
                // 2. Try Profiles Table
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', user.id)
                    .single();
                if (profileData) {
                    senderName = profileData.full_name || profileData.email || 'Kullanıcı';
                }
            }

            // Insert Notification for the Admin
            // We use the same JSON+ID format so NotificationBell.jsx handles it correctly
            await supabase.from('user_notifications').insert({
                user_id: final_receiver_id, // This is the Admin ID
                type: 'new_message',
                title: 'new_message',
                message: JSON.stringify({
                    key: 'dashboard.notifications.new_message_message',
                    args: { name: senderName }
                }) + '|||' + conversation.id,
                related_id: conversation.id,
                created_at: new Date().toISOString(),
                is_read: false
            });
        }
        // -------------------------------------

        // Update conversation last_message_at
        await supabase
            .from('admin_conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversation.id);

        return new Response(JSON.stringify({ message, conversation_id: conversation.id }), {
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
