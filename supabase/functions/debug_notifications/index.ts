
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
    try {
        const userId = 'cc61b0f2-d0f4-46ef-a323-a0546f85e36a';

        // Get last 5 admin notifications
        const { data: adminNotifs, error: adminError } = await supabase
            .from('admin_notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (adminError) throw adminError;

        // Get user notifications for the specific user
        const { data: userNotifs, error: userError } = await supabase
            .from('user_notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (userError) throw userError;

        // Check user role in auth.users
        const { data: authUser } = await supabase
            .from('auth.users')
            .select('role, email')
            .eq('id', userId)
            .single();

        return new Response(JSON.stringify({ adminNotifs, userNotifs, authUser }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
});
