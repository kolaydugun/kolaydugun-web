import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLinks() {
    console.log('🔍 Starting Affiliate Link Check...');

    // 1. Fetch all AI Blog Meta records
    const { data: records, error } = await supabase
        .from('ai_blog_meta')
        .select('id, affiliate_slots, blog_id');

    if (error) {
        console.error('Error fetching records:', error);
        return;
    }

    console.log(`Found ${records.length} blog records.`);

    let totalLinks = 0;
    let brokenLinks = 0;

    for (const record of records) {
        const slots = record.affiliate_slots || [];

        for (const slot of slots) {
            if (slot.assignedProduct && slot.assignedProduct.url) {
                totalLinks++;
                const url = slot.assignedProduct.url;

                try {
                    const response = await fetch(url, { method: 'HEAD', timeout: 5000 });

                    if (!response.ok) {
                        console.error(`❌ Broken Link [${response.status}]: ${url} (Blog ID: ${record.blog_id})`);
                        brokenLinks++;
                    } else {
                        // console.log(`✅ Valid: ${url}`);
                    }
                } catch (err) {
                    console.error(`❌ Network Error: ${url} - ${err.message}`);
                    brokenLinks++;
                }
            }
        }
    }

    console.log('\n--- Summary ---');
    console.log(`Total Links Checked: ${totalLinks}`);
    console.log(`Broken Links Found: ${brokenLinks}`);

    if (brokenLinks > 0) {
        console.log('⚠️ Action Required: Please review and update the broken links in the Admin Panel.');
        process.exit(1); // Exit with error code if broken links found
    } else {
        console.log('✅ All links are valid!');
    }
}

checkLinks();
