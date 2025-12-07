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

async function setPremium() {
    console.log(`Setting vendor ${vendorId} to Premium...`);

    const { data, error } = await supabase
        .from('vendors')
        .update({ subscription_tier: 'premium' })
        .eq('id', vendorId)
        .select();

    if (error) {
        console.error('Error updating vendor:', error);
    } else {
        console.log('Successfully set vendor to Premium:', data);
    }
}

setPremium();
