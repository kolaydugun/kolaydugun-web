import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
    {
        name: { tr: "Balayı Rehberi", en: "Honeymoon Guide", de: "Flitterwochen-Guide" },
        slug: "honeymoon-guide"
    },
    {
        name: { tr: "Güzellik ve Bakım", en: "Beauty & Care", de: "Schönheit & Pflege" },
        slug: "beauty-care"
    },
    {
        name: { tr: "Düğün Fotoğrafları", en: "Wedding Photography", de: "Hochzeitsfotografie" },
        slug: "wedding-photography"
    },
    {
        name: { tr: "Müzik ve Eğlence", en: "Music & Entertainment", de: "Musik & Unterhaltung" },
        slug: "music-entertainment"
    }
];

async function insertCategories() {
    console.log('Inserting categories...');

    // Check existing slugs first to avoid errors if unique constraint exists but we want to be safe
    const { data: existing } = await supabase.from('blog_categories').select('slug');
    const existingSlugs = existing ? existing.map(c => c.slug) : [];

    const toInsert = categories.filter(c => !existingSlugs.includes(c.slug));

    if (toInsert.length === 0) {
        console.log('All categories already exist.');
        return;
    }

    const { error } = await supabase.from('blog_categories').insert(toInsert);

    if (error) {
        console.error('Error inserting categories:', error);
    } else {
        console.log(`Successfully inserted ${toInsert.length} categories.`);
    }
}

insertCategories();
