
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSlug() {
    const userId = '67de0013-f97d-4147-91a8-b837308e24e0';
    const newSlug = 'test-couple-live';

    console.log(`Updating slug for user ${userId} to ${newSlug}...`);

    const { data, error } = await supabase
        .from('wedding_details')
        .update({
            slug: newSlug,
            is_public: true,
            welcome_message: 'Welcome to our Wedding!',
            venue_name: 'Grand Venue'
        })
        .eq('user_id', userId)
        .select();

    if (error) {
        console.error('Error updating slug:', error);
    } else {
        console.log('Update successful:', data);
    }
}

updateSlug();
