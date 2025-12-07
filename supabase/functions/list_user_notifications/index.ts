// supabase/functions/list_user_notifications.ts
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
    // Handle CORS preflight requests
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

        // Get user notifications - both admin announcements and message notifications
        // Using service role but manually filtering by user_id for security
        const { data: notifications, error } = await supabase
            .from("user_notifications")
            .select(`
        id,
        type,
        title,
        message,
        is_read,
        read_at,
        created_at,
        related_id,
        related_conversation_id,
        related_message_id,
        related_lead_id,
        notification:admin_notifications(
          id,
          title,
          message,
          type,
          created_at
        )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform notifications to have consistent structure
        const transformedNotifications = notifications?.map(notif => {
            if (notif.type === 'new_message' || notif.type === 'new_quote') {
                // Message & Quote notification - use direct columns
                return {
                    id: notif.id,
                    is_read: notif.is_read,
                    read_at: notif.read_at,
                    created_at: notif.created_at,
                    notification: {
                        type: notif.type,
                        title: notif.title,
                        message: notif.message
                    },
                    related_id: notif.related_id,
                    related_conversation_id: notif.related_conversation_id,
                    related_message_id: notif.related_message_id,
                    related_lead_id: notif.related_lead_id
                };
            } else {
                // Admin announcement - use joined data
                return notif;
            }
        }) || [];

        return new Response(JSON.stringify({ notifications: transformedNotifications }), {
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
