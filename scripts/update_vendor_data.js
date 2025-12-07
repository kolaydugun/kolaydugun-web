import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const vendorId = 'e7e6002d-0937-4555-8416-fd99853fbdd4';

const updateData = {
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Sample video
    social_media: {
        facebook: 'https://facebook.com/okanaran',
        instagram: 'https://instagram.com/okanaran',
        website: 'https://okanaran.com'
    },
    latitude: 52.5200, // Berlin
    longitude: 13.4050,
    is_claimed: true,
    claim_approved_at: new Date().toISOString()
};

async function updateVendor() {
    console.log(`Updating vendor ${vendorId}...`);
    const { data, error } = await supabase
        .from('vendors')
        .update(updateData)
        .eq('id', vendorId)
        .select();

    if (error) {
        console.error('Error updating vendor:', error);
    } else {
        console.log('Vendor updated successfully:', data);
    }
}

updateVendor();
