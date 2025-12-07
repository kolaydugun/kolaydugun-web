// supabase/functions/create_notification.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Expected JSON payload:
 * {
 *   "title": "...",
 *   "message": "...",
 *   "type": "announcement" | "campaign" | "system",
 *   "target_type": "all" | "couples" | "vendors" | "category" | "city" | "custom",
 *   "target_category_id": "uuid?",
 *   "target_city": "string?",
 *   "send_email": boolean
 * }
 */

serve(async (req) => {
    try {
        const { user } = await supabase.auth.getUser(req.headers.get("Authorization")?.replace("Bearer ", "") || "");
        if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        // Only admin role can create notifications
        const { data: { role } } = await supabase.from("auth.users").select("role").eq("id", user.id).single();
        if (role !== "admin") return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

        const payload = await req.json();
        const {
            title,
            message,
            type,
            target_type,
            target_category_id,
            target_category, // Add this
            target_city,
            send_email = false,
        } = payload;

        // Use target_category if target_category_id is not provided
        const final_category_id = target_category_id || target_category;

        // Insert admin notification
        const { data: notif, error: notifErr } = await supabase.from("admin_notifications").insert({
            title,
            message,
            type,
            target_type,
            target_category_id: final_category_id, // Store the actual value used
            target_city,
            send_email,
            created_by: user.id,
        }).select().single();
        if (notifErr) throw notifErr;

        // Determine recipient user IDs based on target_type
        let userIds: string[] = [];

        if (target_type === "all") {
            // Get all vendors
            const { data: vendors } = await supabase.from("vendors").select("user_id").is("deleted_at", null);
            // Get all couples
            const { data: couples } = await supabase.from("profiles").select("id").eq("role", "couple");

            const vendorIds = vendors?.map((v: any) => v.user_id) || [];
            const coupleIds = couples?.map((c: any) => c.id) || [];
            userIds = [...new Set([...vendorIds, ...coupleIds])];

        } else if (target_type === "couples") {
            const { data: couples } = await supabase.from("profiles").select("id").eq("role", "couple");
            userIds = couples?.map((c: any) => c.id) || [];

        } else if (target_type === "vendors") {
            const { data: vendors } = await supabase.from("vendors").select("user_id").is("deleted_at", null);
            userIds = vendors?.map((v: any) => v.user_id) || [];

        } else if (target_type === "category" && final_category_id) {
            // target_category_id is actually the category NAME string now (from frontend)
            // But let's support both or assume string if it comes from the new frontend
            const { data: vendors } = await supabase
                .from("vendors")
                .select("user_id")
                .eq("category", final_category_id) // Using string column
                .is("deleted_at", null);

            userIds = vendors?.map((v: any) => v.user_id) || [];

        } else if (target_type === "city" && target_city) {
            const { data: vendors } = await supabase
                .from("vendors")
                .select("user_id")
                .eq("city", target_city)
                .is("deleted_at", null);
            userIds = vendors?.map((v: any) => v.user_id) || [];
        }

        // Filter out null/undefined userIds
        userIds = userIds.filter(id => id);

        if (userIds.length === 0) {
            return new Response(JSON.stringify({ success: true, message: "No recipients found", notification: notif }), { status: 200 });
        }

        // Insert into user_notifications for each user
        const userNotifs = userIds.map((uid: string) => ({
            user_id: uid,
            notification_id: notif.id,
        }));
        const { error: batchErr } = await supabase.from("user_notifications").insert(userNotifs);
        if (batchErr) throw batchErr;

        // 4. Send emails if enabled
        if (send_email && userIds.length > 0) {
            // Fetch user settings to filter who wants emails
            const { data: settings } = await supabase
                .from('user_notification_settings')
                .select('user_id, email_enabled')
                .in('user_id', userIds);

            // Create a set of users who have explicitly disabled emails
            const disabledUserIds = new Set(
                settings?.filter((s: any) => s.email_enabled === false).map((s: any) => s.user_id)
            );

            // Filter recipients
            const emailRecipients = userIds.filter((id: string) => !disabledUserIds.has(id));

            if (emailRecipients.length > 0) {
                await supabase.functions.invoke("send_notification_email", {
                    body: {
                        userIds: emailRecipients,
                        title,
                        message,
                    },
                });
            }
        }



        return new Response(JSON.stringify({ success: true, notification: notif }), { status: 200 });
    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message || "Server error" }), { status: 500 });
    }
});
