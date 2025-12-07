
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listWeddings() {
    console.log('Listing all wedding details...');

    const { data, error } = await supabase
        .from('wedding_details')
        .select('*');

    if (error) {
        console.error('Error fetching weddings:', error);
    } else {
        console.log(`Found ${data.length} records:`);
        data.forEach(w => {
            console.log(`- User: ${w.user_id}, Slug: ${w.slug}, Public: ${w.is_public}`);
        });
    }
}

listWeddings();
