
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

async function inspectSchema() {
    console.log('Inspecting transactions table columns...');

    // We can't directly query information_schema easily with JS client without RPC.
    // But we can try to insert a row with invalid column and see error, or try to select specific columns.

    // Let's try to select 'user_id' and 'vendor_id' specifically.

    const { error: userIdError } = await supabase.from('transactions').select('user_id').limit(1);
    console.log('Has user_id?', !userIdError ? 'Yes' : 'No', userIdError ? userIdError.message : '');

    const { error: updatedError } = await supabase.from('transactions').select('updated_at').limit(1);
    console.log('Has updated_at?', !updatedError ? 'Yes' : 'No', updatedError ? updatedError.message : '');
}

inspectSchema();
