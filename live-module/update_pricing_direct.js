
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
