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

async function upgradeVendor() {
    console.log(`Upgrading vendor ${vendorId} to Premium...`);

    // 1. Get Pro Plan ID
    const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', 'pro_monthly')
        .single();

    if (planError) {
        console.error('Error fetching plan:', planError);
        return;
    }

    if (!plan) {
        console.error('Pro Monthly plan not found');
        return;
    }

    console.log('Found Pro Plan ID:', plan.id);

    // 2. Insert Subscription
    // First, check if one exists and deactivate it (optional but good practice)
    await supabase
        .from('vendor_subscriptions')
        .update({ status: 'cancelled' })
        .eq('vendor_id', vendorId)
        .eq('status', 'active');

    const { data: sub, error: subError } = await supabase
        .from('vendor_subscriptions')
        .insert([{
            vendor_id: vendorId,
            plan_id: plan.id,
            status: 'active',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }])
        .select()
        .single();

    if (subError) {
        console.error('Error creating subscription:', subError);
    } else {
        console.log('Successfully upgraded vendor to Premium:', sub);
    }
}

upgradeVendor();
