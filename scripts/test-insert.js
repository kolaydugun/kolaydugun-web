
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

async function testInsert() {
    console.log('Testing Insert...');

    // Get a vendor
    const { data: vendors } = await supabase.from('vendors').select('id').limit(1);
    if (!vendors || vendors.length === 0) {
        console.error('No vendors found');
        return;
    }
    const vendorId = vendors[0].id;

    const payload = {
        user_id: vendorId,
        amount: 100.00,
        credits_added: 50,
        status: 'pending',
        type: 'credit_purchase',
        description: 'Test Insert Script',
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('transactions')
        .insert(payload)
        .select();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Insert Success:', data);
    }
}

testInsert();
