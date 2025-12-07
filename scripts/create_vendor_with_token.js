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

async function createVendor() {
    console.log('Creating new vendor...');

    const userId = 'dab4a65f-c08e-4219-9aa8-c22be8684ae9';

    const { data, error } = await supabase
        .from('vendors')
        .insert([{
            id: userId, // Match the user ID
            user_id: userId,
            business_name: 'Premium Test Vendor',
            category: 'Wedding Venues',
            city: 'Berlin',
            subscription_tier: 'free' // Start as free
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating vendor:', error);
    } else {
        console.log('Successfully created vendor:', data);

        // Now upgrade it
        console.log('Upgrading new vendor to Premium...');
        const { data: updated, error: updateError } = await supabase
            .from('vendors')
            .update({ subscription_tier: 'premium' })
            .eq('id', data.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error upgrading vendor:', updateError);
        } else {
            console.log('Successfully upgraded new vendor:', updated);
        }
    }
}

createVendor();
