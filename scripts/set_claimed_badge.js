import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://rnkyghovurnaizkhwgtv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0'
);

async function setClaimedBadge() {
    console.log('🔍 Fetching first vendor...');

    const { data: vendor, error: fetchError } = await supabase
        .from('vendors')
        .select('id, business_name')
        .limit(1)
        .single();

    if (fetchError) {
        console.error('❌ Error fetching vendor:', fetchError);
        return;
    }

    console.log('✅ Found vendor:', vendor.business_name);

    const { data, error } = await supabase
        .from('vendors')
        .update({
            is_claimed: true,
            claim_approved_at: new Date().toISOString()
        })
        .eq('id', vendor.id)
        .select();

    if (error) {
        console.error('❌ Error updating vendor:', error);
    } else {
        console.log('✅ Claimed badge set!');
        console.log('📛 is_claimed:', true);
        console.log('📅 claim_approved_at:', new Date().toISOString());
    }
}

setClaimedBadge();
