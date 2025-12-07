import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = 'https://kolaydugun.de';

const STATIC_PAGES = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/vendors', changefreq: 'daily', priority: 0.9 },
    { url: '/inspiration', changefreq: 'weekly', priority: 0.8 },
    { url: '/blog', changefreq: 'weekly', priority: 0.7 },
    { url: '/p/impressum', changefreq: 'monthly', priority: 0.5 },
    { url: '/p/privacy', changefreq: 'monthly', priority: 0.5 },
    { url: '/p/terms', changefreq: 'monthly', priority: 0.5 },
];

async function generateSitemap() {
    console.log('Starting sitemap generation...');

    // Fetch all vendors
    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('id, created_at')
        .eq('is_verified', true)
        .is('deleted_at', null);

    if (error) {
        console.error('Error fetching vendors:', error);
        return;
    }

    console.log(`Found ${vendors.length} vendors.`);

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    STATIC_PAGES.forEach(page => {
        sitemapContent += `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add vendor pages
    vendors.forEach(vendor => {
        const lastMod = vendor.created_at ? new Date(vendor.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        sitemapContent += `
  <url>
    <loc>${SITE_URL}/vendors/${vendor.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Fetch published blog posts
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('slug, updated_at')
        .eq('status', 'published');

    if (postsError) {
        console.error('Error fetching posts:', postsError);
    } else {
        console.log(`Found ${posts.length} published posts.`);
        posts.forEach(post => {
            const lastMod = post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            sitemapContent += `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });
    }

    sitemapContent += `
</urlset>`;

    const publicDir = path.join(__dirname, '../public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');

    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log(`Sitemap generated successfully at ${sitemapPath}`);
}

generateSitemap();
