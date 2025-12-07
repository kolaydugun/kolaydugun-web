
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key, might need service role if RLS blocks, but let's try.
// Actually, for admin RPCs we might need to be logged in as admin or use service role key.
// Since I don't have service role key easily available (it's usually in .env but maybe not exposed to client),
// I will try with anon key. If RLS blocks, I might need to simulate login or ask user.
// But wait, I can use the `service_role` key if it is in .env. Let's check .env content? No I can't read .env directly safely.
// I'll assume VITE_SUPABASE_SERVICE_ROLE_KEY might exist or I have to rely on existing RLS allowing public insert (unlikely) or use a logged in session.
// However, for this test script, I'll try to find a vendor and insert as that vendor if possible, or just insert if RLS allows.
// The RPC `security definer` should bypass RLS for the execution part.

// Let's try to use VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
// If insert fails, I'll know.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreditApproval() {
    console.log('Starting Credit Approval Test...');

    // 1. Get a vendor
    const { data: vendors, error: vendorError } = await supabase
        .from('vendors')
        .select('id, credit_balance, business_name')
        .limit(1);

    if (vendorError || !vendors || vendors.length === 0) {
        console.error('Error fetching vendor or no vendors found:', vendorError);
        return;
    }

    const vendor = vendors[0];
    console.log(`Using Vendor: ${vendor.business_name} (ID: ${vendor.id})`);
    console.log(`Initial Credit Balance: ${vendor.credit_balance}`);

    // 2. Create a pending transaction
    // Check if credits_added column exists by trying to insert it.
    // If it fails, we might need to add it.
    const creditsToAdd = 50;
    const amount = 100.00;

    const transactionPayload = {
        user_id: vendor.id,
        amount: amount,
        credits_added: creditsToAdd,
        status: 'pending',
        type: 'credit_purchase',
        description: 'Test Credit Purchase via Script'
    };

    console.log('Creating pending transaction...');
    const { data: txn, error: txnError } = await supabase
        .from('transactions')
        .insert(transactionPayload)
        .select()
        .single();

    if (txnError) {
        console.error('Error creating transaction:', txnError);
        if (txnError.message.includes('credits_added')) {
            console.log('HINT: The "credits_added" column might be missing in "transactions" table.');
        }
        return;
    }

    console.log(`Transaction Created! ID: ${txn.id}, Status: ${txn.status}`);

    // 3. Approve the transaction using RPC
    console.log('Calling approve_transaction_admin RPC...');
    const { data: rpcData, error: rpcError } = await supabase
        .rpc('approve_transaction_admin', { transaction_id: txn.id });

    if (rpcError) {
        console.error('RPC Error:', rpcError);
        return;
    }

    if (rpcData && !rpcData.success) {
        console.error('RPC Failed:', rpcData.error);
        return;
    }

    console.log('RPC Success!', rpcData);

    // 4. Verify Vendor Balance
    const { data: updatedVendor, error: verifyError } = await supabase
        .from('vendors')
        .select('credit_balance')
        .eq('id', vendor.id)
        .single();

    if (verifyError) {
        console.error('Error verifying vendor balance:', verifyError);
        return;
    }

    console.log(`Updated Credit Balance: ${updatedVendor.credit_balance}`);
    const expectedBalance = (vendor.credit_balance || 0) + creditsToAdd;

    if (updatedVendor.credit_balance === expectedBalance) {
        console.log('✅ TEST PASSED: Balance updated correctly.');
    } else {
        console.error(`❌ TEST FAILED: Expected balance ${expectedBalance}, got ${updatedVendor.credit_balance}`);
    }
}

testCreditApproval();
