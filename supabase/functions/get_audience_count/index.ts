
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const { target_type, target_category, target_city } = await req.json();

        let count = 0;

        if (target_type === 'all') {
            // Count active vendors
            const { count: vendorCount, error: vendorError } = await supabase
                .from('vendors')
                .select('*', { count: 'exact', head: true })
                .is('deleted_at', null);

            if (vendorError) throw vendorError;

            // Count couples
            const { count: coupleCount, error: coupleError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'couple');

            if (coupleError) throw coupleError;

            count = (vendorCount || 0) + (coupleCount || 0);

        } else if (target_type === 'couples') {
            const { count: coupleCount, error: coupleError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'couple');

            if (coupleError) throw coupleError;
            count = coupleCount || 0;

        } else if (target_type === 'vendors') {
            const { count: vendorCount, error: vendorError } = await supabase
                .from('vendors')
                .select('*', { count: 'exact', head: true })
                .is('deleted_at', null);

            if (vendorError) throw vendorError;
            count = vendorCount || 0;

        } else if (target_type === 'category' && target_category) {
            const { count: vendorCount, error: vendorError } = await supabase
                .from('vendors')
                .select('*', { count: 'exact', head: true })
                .eq('category', target_category)
                .is('deleted_at', null);

            if (vendorError) throw vendorError;
            count = vendorCount || 0;

        } else if (target_type === 'city' && target_city) {
            const { count: vendorCount, error: vendorError } = await supabase
                .from('vendors')
                .select('*', { count: 'exact', head: true })
                .eq('city', target_city)
                .is('deleted_at', null);

            if (vendorError) throw vendorError;
            count = vendorCount || 0;
        }

        return new Response(
            JSON.stringify({ count }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
