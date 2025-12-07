import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend("re_7qaDXNov_KonC6T8JZ8bSaYgpPztcCrRG"); // API Key from user

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
        const { to, subject, html, text } = await req.json();

        const data = await resend.emails.send({
            from: 'KolayDugun <onboarding@resend.dev>', // Default Resend sender
            to: to, // This must be the user's verified email in Resend free tier, or any email if domain is verified
            subject: subject,
            html: html,
            text: text || '',
        });

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
