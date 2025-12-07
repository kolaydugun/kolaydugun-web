import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pzlasojhfqjvjqwzukqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6bGFzb2poZnFqdmpxd3p1a3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1OTI4NjMsImV4cCI6MjA0NzE2ODg2M30.0ztXGVCJtFLCWwjLxYcWwLjKtSPQFKZHLGNHqpqXsHw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixWeddingDates() {
    console.log('Fetching wedding details...');

    // Get all wedding details with dates
    const { data: weddings, error: fetchError } = await supabase
        .from('wedding_details')
        .select('user_id, wedding_date, slug')
        .not('wedding_date', 'is', null);

    if (fetchError) {
        console.error('Error fetching:', fetchError);
        return;
    }

    console.log(`Found ${weddings.length} weddings with dates`);

    for (const wedding of weddings) {
        const currentDate = wedding.wedding_date;

        // Check if date already has time component
        if (currentDate && !currentDate.includes('T')) {
            const fixedDate = currentDate + 'T12:00:00';
            console.log(`Fixing ${wedding.slug}: ${currentDate} -> ${fixedDate}`);

            const { error: updateError } = await supabase
                .from('wedding_details')
                .update({ wedding_date: fixedDate })
                .eq('user_id', wedding.user_id);

            if (updateError) {
                console.error(`Error updating ${wedding.slug}:`, updateError);
            } else {
                console.log(`✅ Fixed ${wedding.slug}`);
            }
        } else {
            console.log(`⏭️  Skipping ${wedding.slug} - already has time component`);
        }
    }

    console.log('Done!');
}

fixWeddingDates();
