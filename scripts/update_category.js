import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCategory() {
    console.log('Updating category "Wedding Venues"...');

    const { data, error } = await supabase
        .from('categories')
        .upsert({
            name: 'Wedding Venues',
            description: 'Düğün mekanları, salonlar, kır düğünü alanları ve tarihi mekanlar',
            icon: '🏛️'
        }, { onConflict: 'name' })
        .select();

    if (error) {
        console.error('Error updating category:', error);
        console.log('NOTE: If this failed with a permission error (401/403), it means Row Level Security (RLS) is preventing anonymous updates. You will need to run the SQL script in the Supabase Dashboard.');
        process.exit(1);
    }

    console.log('Success! Category updated:', data);
}

updateCategory();
