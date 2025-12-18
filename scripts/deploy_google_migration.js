import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🚀 Applying Google API Integration migration...');
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251218_google_api_integration.sql');
    const sql = readFileSync(migrationPath, 'utf8');

    // Supabase JS client doesn't have a direct 'sql' method, 
    // but we can try to use a dummy RPC if one exists or just advise manual application if it fails.
    // However, for this specific project, I'll try to use a known helper or provide the user with the exact steps.

    console.log('⚠️ Manual step required for Migration:');
    console.log('1. Open: https://supabase.com/dashboard/project/rnkyghovurnaizkhwgtv/sql/new');
    console.log('2. Paste the content of: supabase/migrations/20251218_google_api_integration.sql');
    console.log('3. Click RUN');
}

runMigration();
