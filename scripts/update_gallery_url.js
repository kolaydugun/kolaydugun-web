import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const updateGalleryUrl = async () => {
    const timestamp = Date.now();
    const email = `gallery_test_${timestamp}@example.com`;
    const password = 'password123';

    console.log(`Creating user: ${email}`);

    // 1. Sign Up
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
    });

    if (signUpError) {
        console.error('Sign up error:', signUpError);
        return;
    }

    console.log('User created:', user.id);

    // 2. Create Wedding Record
    const slug = `gallery-test-${timestamp}`;
    const { data: wedding, error: weddingError } = await supabase
        .from('wedding_details')
        .insert({
            user_id: user.id,
            slug: slug,
            is_public: true,
            gallery_url: 'https://photos.app.goo.gl/example',
            venue_name: 'Test Venue',
            welcome_message: 'Welcome to our gallery test!'
        })
        .select()
        .single();

    if (weddingError) {
        console.error('Error creating wedding:', weddingError);
    } else {
        console.log('Successfully created wedding with gallery_url:', wedding);
        console.log(`Visit public page at: http://localhost:5173/w/${slug}`);
    }
};

updateGalleryUrl();
