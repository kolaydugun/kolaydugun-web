
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function checkPricing() {
    console.log('--- Subscription Plans ---')
    const { data: plans } = await supabase.from('subscription_plans').select('*')
    console.table(plans)

    console.log('\n--- Credit Packages ---')
    const { data: pkgs } = await supabase.from('credit_packages').select('*')
    console.table(pkgs)
}

checkPricing()
