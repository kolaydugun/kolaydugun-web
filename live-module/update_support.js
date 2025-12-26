
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateSupport() {
    console.log('--- Updating Support Settings ---')

    const { error: waErr } = await supabase
        .from('system_settings')
        .upsert({ key: 'support_whatsapp', value: '4917643301828', updated_at: new Date() })

    if (waErr) console.error('WhatsApp Update Error:', waErr)
    else console.log('WhatsApp set to: 4917643301828')

    const { error: mailErr } = await supabase
        .from('system_settings')
        .upsert({ key: 'support_email', value: 'kontakt@kolaydugun.de', updated_at: new Date() })

    if (mailErr) console.error('Email Update Error:', mailErr)
    else console.log('Email set to: kontakt@kolaydugun.de')
}

updateSupport()
