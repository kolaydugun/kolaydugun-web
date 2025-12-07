
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function reproduceDelete() {
    const email = `admin.test.${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`1. Creating user: ${email}`);
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
    });

    if (signUpError) {
        console.error('SignUp failed:', signUpError);
        return;
    }

    console.log('User created:', user.id);

    // 2. We need to make this user an admin.
    // Since we can't run SQL from here, we have to rely on the user having run the SQL to allow admins to update profiles? 
    // No, usually admins can update profiles. But this new user is NOT an admin yet.
    // I cannot promote this user to admin without the Service Role key or the user running SQL.

    // WAIT. I can't test "Admin Delete" if I can't make an admin.
    // But I verified earlier that `karabulut.hamza@gmail.com` IS an admin.

    // Alternative: I can try to delete a post as the *existing* test user I created earlier?
    // But that user is likely NOT an admin.

    // I am stuck on *creating* an admin programmatically.

    // However, I can try to delete as a *normal* user and see the error. It should be "violates RLS".
    // If I see "violates RLS", it means RLS is active.

    // Let's try to inspect the policies by trying to delete a post that *belongs* to the user.
    // If I can delete my OWN post, then the "Admins can delete" policy might be the ONLY one, and maybe it's exclusive?
    // Usually users can delete their own posts.

    console.log('2. Logging in...');
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('Login failed:', loginError);
        return;
    }

    console.log('3. Creating a post...');
    const { data: post, error: createError } = await supabase
        .from('posts')
        .insert([{
            title: { en: 'Delete Test' },
            slug: `delete-test-${Date.now()}`,
            author_id: user.id,
            status: 'draft'
        }])
        .select()
        .single();

    if (createError) {
        console.error('Create failed:', createError);
        // If create fails, we can't test delete.
        return;
    }
    console.log('Post created:', post.id);

    console.log('4. Attempting to delete (as non-admin)...');
    const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

    if (deleteError) {
        console.error('Delete failed (Expected for non-admin?):', deleteError);
    } else {
        console.log('Delete successful (Unexpected for non-admin unless "Users can delete own" exists)!');
    }
}

reproduceDelete();
