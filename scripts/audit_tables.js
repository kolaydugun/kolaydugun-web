import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://rnkyghovurnaizkhwgtv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0'
);

const REQUIRED_TABLES = [
    'profiles',
    'vendors',
    'vendor_profiles',
    'leads',
    'vendor_leads',
    'transactions',
    'wedding_details',
    'budget_items',
    'todos',
    'seating_tables',
    'guests',
    'pages',
    'posts',
    'categories',
    'cities',
    'credit_requests'
];

async function checkTables() {
    console.log('🔍 Database Audit - Checking Tables\n');
    console.log('='.repeat(60));

    const results = {
        existing: [],
        missing: []
    };

    for (const table of REQUIRED_TABLES) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

        if (error && error.message.includes('does not exist')) {
            console.log(`❌ ${table.padEnd(20)} - MISSING`);
            results.missing.push(table);
        } else if (error) {
            console.log(`✅ ${table.padEnd(20)} - EXISTS (RLS enabled)`);
            results.existing.push(table);
        } else {
            console.log(`✅ ${table.padEnd(20)} - EXISTS (${data?.length || 0} rows)`);
            results.existing.push(table);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Existing: ${results.existing.length}/${REQUIRED_TABLES.length}`);
    console.log(`❌ Missing:  ${results.missing.length}/${REQUIRED_TABLES.length}`);

    if (results.missing.length > 0) {
        console.log('\n⚠️  Missing tables:');
        results.missing.forEach(t => console.log(`   - ${t}`));
    }

    console.log('\n' + '='.repeat(60));
}

checkTables();
