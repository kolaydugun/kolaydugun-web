
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
// Using the ANON key from check_schema.js
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFixes() {
    console.log('--- Verifying Database Fixes ---');
    let allGood = true;

    // 1. Check wedding_details for gallery_url
    console.log('\n1. Checking wedding_details.gallery_url...');
    const { data: weddingData, error: weddingError } = await supabase
        .from('wedding_details')
        .select('gallery_url')
        .limit(1);

    if (weddingError) {
        console.error('❌ Error checking wedding_details:', weddingError.message);
        allGood = false;
    } else {
        // If we selected it successfully, the column exists (or at least the query didn't fail on column name)
        // Note: Supabase/PostgREST might ignore non-existent columns in select if not strict, but usually it errors if column doesn't exist.
        // Actually, let's check if the returned data has the key if there is data.
        if (weddingData && weddingData.length > 0) {
            if (weddingData[0].hasOwnProperty('gallery_url')) {
                console.log('✅ gallery_url column exists.');
            } else {
                console.log('⚠️ Query worked but gallery_url not in response (might be null or not selected properly).');
            }
        } else {
            console.log('✅ Query for gallery_url executed without error (Table exists, column likely exists).');
        }
    }

    // 2. Check budget_items table
    console.log('\n2. Checking budget_items table...');
    const { error: budgetError } = await supabase.from('budget_items').select('id').limit(1);
    if (budgetError) {
        console.error('❌ budget_items table issue:', budgetError.message);
        allGood = false;
    } else {
        console.log('✅ budget_items table exists.');
    }

    // 3. Check todos table
    console.log('\n3. Checking todos table...');
    const { error: todosError } = await supabase.from('todos').select('id').limit(1);
    if (todosError) {
        console.error('❌ todos table issue:', todosError.message);
        allGood = false;
    } else {
        console.log('✅ todos table exists.');
    }

    // 4. Check seating_tables table
    console.log('\n4. Checking seating_tables table...');
    const { error: seatingError } = await supabase.from('seating_tables').select('id').limit(1);
    if (seatingError) {
        console.error('❌ seating_tables table issue:', seatingError.message);
        allGood = false;
    } else {
        console.log('✅ seating_tables table exists.');
    }

    console.log('\n--- Verification Complete ---');
    if (allGood) {
        console.log('🎉 All checks passed! The fixes seem to be applied.');
    } else {
        console.log('bummer. Some checks failed.');
    }
}

verifyFixes();
