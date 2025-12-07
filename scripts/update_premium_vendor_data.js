import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Token retrieved from browser
const accessToken = "eyJhbGciOiJIUzI1NiIsImtpZCI6ImMrem02V0VMZ2NBUGRWcFAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3Jua3lnaG92dXJuYWl6a2h3Z3R2LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkYWI0YTY1Zi1jMDhlLTQyMTktOWFhOC1jMjJiZTg2ODRhZTkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY0MjExNjk0LCJpYXQiOjE3NjQyMDgwOTQsImVtYWlsIjoiZ3VsYXlAaG90bWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoiZ3VsYXlAaG90bWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiZ3VsYXkiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInJvbGUiOiJjb3VwbGUiLCJzdWIiOiJkYWI0YTY1Zi1jMDhlLTQyMTktOWFhOC1jMjJiZTg2ODRhZTkifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2NDIwODA5NH1dLCJzZXNzaW9uX2lkIjoiMWQ0MGZiOTgtMWRhZi00Y2RjLTliODctODM5ZDljMWUzNTc3IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.XPp5xw6FBnaRNE1BHOFjKWa83k2a0ns0CZ3XBHbTe7w";

const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }
});

const vendorId = 'dab4a65f-c08e-4219-9aa8-c22be8684ae9';

async function updateVendorData() {
    console.log('Updating vendor data...');

    const { data, error } = await supabase
        .from('vendors')
        .update({
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            latitude: 52.5200,
            longitude: 13.4050,
            is_claimed: true,
            claim_approved_at: new Date().toISOString()
        })
        .eq('id', vendorId)
        .select()
        .single();

    if (error) {
        console.error('Error updating vendor:', error);
    } else {
        console.log('Successfully updated vendor data:', data);
    }
}

updateVendorData();
