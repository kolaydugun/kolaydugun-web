import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env file manually
const envContent = fs.readFileSync('.env', 'utf-8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateExistingVendor() {
    console.log('🎯 Updating existing vendor with profile enhancements...\n');

    // First, get the first vendor
    const { data: vendors, error: fetchError } = await supabase
        .from('vendors')
        .select('*')
        .limit(1);

    if (fetchError) {
        console.error('❌ Error fetching vendors:', fetchError);
        return;
    }

    if (!vendors || vendors.length === 0) {
        console.log('⚠️ No vendors found in database');
        return;
    }

    const vendorId = vendors[0].id;
    console.log(`📋 Found vendor: ${vendors[0].business_name} (ID: ${vendorId})`);

    // Update with profile enhancements
    const updates = {
        // Profile enhancements - Video
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',

        // Profile enhancements - Location/Map
        latitude: 52.5200,
        longitude: 13.4050,
        address: 'Unter den Linden 77, 10117 Berlin, Germany',

        // Profile enhancements - Claimed badge
        is_claimed: true,
        claim_approved_at: new Date().toISOString(),

        // Social media links (JSONB field)
        social_media: {
            website: 'https://elegantphoto.de',
            facebook: 'https://facebook.com/elegantphotoberlin',
            instagram: 'https://instagram.com/elegantphotoberlin'
        },

        // Gallery images (JSONB field)
        gallery: [
            'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
            'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
        ],

        // Additional enhancements
        description: 'Professional wedding photography services in Berlin. We capture your special moments with artistic vision and attention to detail. Over 10 years of experience in wedding photography.',
        image_url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
        years_experience: 10,
        languages: ['Deutsch', 'English', 'Türkçe'],
        payment_methods: ['Cash', 'Credit Card', 'Bank Transfer'],
        website_url: 'https://elegantphoto.de'
    };

    try {
        const { data, error } = await supabase
            .from('vendors')
            .update(updates)
            .eq('id', vendorId)
            .select();

        if (error) {
            console.error('❌ Error updating vendor:', error);
            return;
        }

        console.log('\n✅ Vendor updated successfully with profile enhancements!');
        console.log('📋 Updated vendor details:');
        console.log(`   ID: ${data[0].id}`);
        console.log(`   Name: ${data[0].business_name}`);
        console.log(`   Category: ${data[0].category}`);
        console.log(`   City: ${data[0].city}`);
        console.log(`   Video URL: ${data[0].video_url}`);
        console.log(`   Coordinates: ${data[0].latitude}, ${data[0].longitude}`);
        console.log(`   Address: ${data[0].address}`);
        console.log(`   Claimed: ${data[0].is_claimed}`);
        console.log(`   Social Media: ${JSON.stringify(data[0].social_media)}`);
        console.log(`   Gallery Images: ${data[0].gallery?.length || 0} images`);
        console.log(`\n🌐 View at: http://localhost:5173/vendors/${data[0].id}`);

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

updateExistingVendor();
