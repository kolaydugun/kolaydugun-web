
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

async function checkPending() {
    console.log('Checking for pending transactions...');

    // 1. Check count
    const { count, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    if (countError) {
        console.error('Count Error:', countError);
    } else {
        console.log(`Found ${count} pending transactions.`);
    }

    // 2. Fetch details
    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            vendors (business_name)
        `)
        .eq('status', 'pending')
        .limit(5);

    if (error) {
        console.error('Fetch Error:', error);
    } else {
        console.log('Pending Transactions:', data);
    }
    // 3. Check total vendors
    const { count: vendorCount, error: vendorError } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });

    console.log(`Total Vendors: ${vendorCount} (Error: ${vendorError?.message})`);

    // 4. Check total transactions
    const { count: totalTxn, error: totalTxnError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

    console.log(`Total Transactions: ${totalTxn} (Error: ${totalTxnError?.message})`);
}

checkPending();
