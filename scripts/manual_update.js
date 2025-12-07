
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpdate() {
    console.log('Authenticating...');
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'test.user.final.v2@example.com',
        password: 'Test123456!'
    });

    if (authError) {
        console.error('Auth error:', authError);
        return;
    }

    const user = session.user;
    console.log('Logged in as:', user.id);

    // 1. Fetch existing
    console.log('Fetching existing details...');
    const { data: existing, error: fetchError } = await supabase
        .from('wedding_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (fetchError) {
        console.error('Fetch error:', fetchError);
    } else {
        console.log('Current gallery_url:', existing ? existing.gallery_url : 'No record found');
    }

    // 2. Update or Insert
    const newUrl = 'https://drive.google.com/drive/folders/script_test_' + Date.now();
    console.log('Saving new URL:', newUrl);

    let result;
    if (existing) {
        console.log('Updating...');
        result = await supabase
            .from('wedding_details')
            .update({ gallery_url: newUrl, updated_at: new Date() })
            .eq('user_id', user.id)
            .select()
            .single();
    } else {
        console.log('Inserting...');
        result = await supabase
            .from('wedding_details')
            .insert([{ user_id: user.id, gallery_url: newUrl }])
            .select()
            .single();
    }

    if (result.error) {
        console.error('Save error:', result.error);
        return;
    }

    console.log('Save successful. New gallery_url:', result.data.gallery_url);

    // 3. Verify persistence (wait a bit?)
    console.log('Waiting 2 seconds...');
    await new Promise(r => setTimeout(r, 2000));

    console.log('Re-fetching to verify persistence...');
    const { data: verified, error: verifyError } = await supabase
        .from('wedding_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (verifyError) {
        console.error('Verify error:', verifyError);
    } else {
        console.log('Verified gallery_url:', verified.gallery_url);
        if (verified.gallery_url === newUrl) {
            console.log('✅ SUCCESS: Data persisted.');
        } else {
            console.error('❌ FAILURE: Data did not persist.');
        }
    }
}

testUpdate();
