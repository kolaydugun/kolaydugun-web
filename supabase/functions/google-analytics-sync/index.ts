import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { JWT } from 'https://esm.sh/google-auth-library@8.7.0'

const GA4_PROPERTY_ID = "514625017"
const GSC_SITE_URL = "https://kolaydugun.de/"

serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization')!
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // 1. Get Google Credentials from Secrets
        const googleCredsRaw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
        if (!googleCredsRaw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not found')
        const creds = JSON.parse(googleCredsRaw)

        const client = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: [
                'https://www.googleapis.com/auth/analytics.readonly',
                'https://www.googleapis.com/auth/webmasters.readonly',
            ],
        })

        await client.authorize()

        // 2. Fetch GA4 Data (Last 30 days)
        const gaResponse = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${client.credentials.access_token}` },
            body: JSON.stringify({
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                metrics: [
                    { name: 'totalUsers' },
                    { name: 'newUsers' },
                    { name: 'sessions' },
                    { name: 'bounceRate' },
                    { name: 'averageSessionDuration' }
                ],
            })
        })
        const gaData = await gaResponse.json()
        const gaMetrics = gaData.rows?.[0]?.metricValues || []

        // 3. Fetch GSC Data (Last 30 days)
        const gscResponse = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}/searchAnalytics/query`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${client.credentials.access_token}` },
            body: JSON.stringify({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                dimensions: ['query'],
                rowLimit: 10
            })
        })
        const gscData = await gscResponse.json()

        // 4. Save to Database
        const { error: dbError } = await supabase
            .from('google_analytics_snapshots')
            .upsert({
                snapshot_date: new Date().toISOString().split('T')[0],
                total_users: parseInt(gaMetrics[0]?.value || '0'),
                new_users: parseInt(gaMetrics[1]?.value || '0'),
                sessions: parseInt(gaMetrics[2]?.value || '0'),
                bounce_rate: parseFloat(gaMetrics[3]?.value || '0'),
                avg_session_duration: parseFloat(gaMetrics[4]?.value || '0'),
                top_keywords: gscData.rows || [],
                updated_at: new Date().toISOString()
            }, { onConflict: 'snapshot_date' })

        if (dbError) throw dbError

        return new Response(JSON.stringify({ success: true, message: 'Sync complete' }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
})
