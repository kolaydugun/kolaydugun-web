import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://rnkyghovurnaizkhwgtv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0'
);

async function addVideoAndSocial() {
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
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            social_media: {
                facebook: 'https://facebook.com/example',
                instagram: 'https://instagram.com/example',
                website: 'https://example.com'
            }
        })
        .eq('id', vendor.id)
        .select();

    if (error) {
        console.error('❌ Error updating vendor:', error);
    } else {
        console.log('✅ Video and social media added!');
        console.log('🎥 Video URL:', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        console.log('📱 Social Media:', { facebook: 'facebook.com/example', instagram: 'instagram.com/example', website: 'example.com' });
    }
}

addVideoAndSocial();
