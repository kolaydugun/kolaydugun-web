
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function updatePricing() {
    console.log('--- Current Data ---')
    const { data: plans, error: pErr } = await supabase.from('subscription_plans').select('*')
    if (pErr) console.error('Plans error:', pErr)
    else console.table(plans)

    const { data: pkgs, error: kErr } = await supabase.from('credit_packages').select('*')
    if (kErr) console.error('Pkgs error:', kErr)
    else console.table(pkgs)

    console.log('\n--- Updating Subscription Plans ---')
    const { error: upErr1 } = await supabase
        .from('subscription_plans')
        .update({ price_monthly: 29.00, price_yearly: 290.00 })
        .eq('id', 'premium')
    if (upErr1) console.error('Update Premium Error:', upErr1)
    else console.log('Premium Subscription updated to 29€')

    console.log('\n--- Updating Credit Packages ---')

    // Update logic based on typical credit package IDs or names if found
    // I will try to be generic if IDs match common patterns (10, 50, 100)
    if (pkgs) {
        for (const pkg of pkgs) {
            let newPrice = null;
            if (pkg.credits === 10) newPrice = 15.00;
            else if (pkg.credits === 50) newPrice = 50.00;
            else if (pkg.credits === 100) newPrice = 80.00;

            if (newPrice !== null) {
                const { error: upErr } = await supabase
                    .from('credit_packages')
                    .update({ price: newPrice, is_active: true })
                    .eq('id', pkg.id)

                if (upErr) console.error(`Error updating package ${pkg.credits}:`, upErr)
                else console.log(`Package ${pkg.credits} credits updated to ${newPrice}€`)
            }
        }
    }
}

updatePricing()
