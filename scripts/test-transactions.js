
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

async function testTransactions() {
    console.log('Testing Total Revenue Query...');
    const { data: revenueData, error: revenueError } = await supabase
        .from('transactions')
        .select('amount')
        .in('type', ['credit_purchase', 'pro_subscription']);

    if (revenueError) {
        console.error('Revenue Query Error:', revenueError);
    } else {
        console.log('Revenue Query Success. Rows:', revenueData?.length);
    }

    console.log('\nTesting Recent Transactions Query...');
    const { data: recentData, error: recentError } = await supabase
        .from('transactions')
        .select(`
            id,
            amount,
            type,
            status,
            created_at,
            user_id,
            vendors (business_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (recentError) {
        console.error('Recent Transactions Query Error:', recentError);
    } else {
        console.log('Recent Transactions Query Success. Rows:', recentData?.length);
    }
}

testTransactions();
