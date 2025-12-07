import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://rnkyghovurnaizkhwgtv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0'
);

async function addTestLocationData() {
    console.log('🔍 Fetching first vendor...');

    const { data: vendor, error: fetchError } = await supabase
        .from('vendors')
        .select('id, business_name, city')
        .limit(1)
        .single();

    if (fetchError) {
        console.error('❌ Error fetching vendor:', fetchError);
        return;
    }

    console.log('✅ Found vendor:', vendor.business_name);

    // Berlin coordinates
    const { data, error } = await supabase
        .from('vendors')
        .update({
            latitude: 52.5200,
            longitude: 13.4050,
            address: `${vendor.city || 'Berlin'}, Germany`
        })
        .eq('id', vendor.id)
        .select();

    if (error) {
        console.error('❌ Error updating vendor:', error);
    } else {
        console.log('✅ Test location data added!');
        console.log('📍 Latitude:', 52.5200);
        console.log('📍 Longitude:', 13.4050);
        console.log('📍 Address:', `${vendor.city || 'Berlin'}, Germany`);
    }
}

addTestLocationData();
