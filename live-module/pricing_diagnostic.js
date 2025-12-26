
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUpdate() {
    console.log('Fetching Credit Packages...')
    const { data: pkgs, error: fetchErr } = await supabase.from('credit_packages').select('*')
    if (fetchErr) {
        console.error('Fetch Error:', fetchErr)
        return
    }
    console.log('Current Packages:', JSON.stringify(pkgs, null, 2))

    for (const pkg of pkgs) {
        let newPrice = null
        if (pkg.credits === 10) newPrice = 15.00
        else if (pkg.credits === 50) newPrice = 50.00
        else if (pkg.credits === 100) newPrice = 80.00

        if (newPrice !== null) {
            console.log(`Attempting to update ${pkg.credits} credits to ${newPrice}€...`)
            const { data, error } = await supabase
                .from('credit_packages')
                .update({ price: newPrice })
                .eq('id', pkg.id)
                .select()

            if (error) {
                console.error(`Update Error for ${pkg.credits}:`, error)
            } else {
                console.log(`Success for ${pkg.credits}:`, JSON.stringify(data, null, 2))
            }
        }
    }
}

testUpdate()
