
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectVendors() {
    console.log('Inspecting vendors table columns...');
    const { data, error } = await supabase.from('vendors').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Vendor keys:', data && data.length > 0 ? Object.keys(data[0]) : 'No data found to inspect keys');
    }
}

inspectVendors();
