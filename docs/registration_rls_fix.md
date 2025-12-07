# Registration RLS Fix

This document explains the fix for the "new row violates row-level security policy for table 'profiles'" error during registration.

## The Issue
When email verification is enabled in Supabase, a new user does not have an active session immediately after sign-up. However, the frontend was attempting to insert a row into the `public.profiles` table using the Supabase client. Since there was no active session, the RLS policy `auth.uid() = id` failed, blocking the registration.

## The Solution
We have moved the profile creation logic from the frontend to the database using a **Postgres Trigger**.
1.  When a user signs up, `auth.users` receives a new row.
2.  A trigger `on_auth_user_created` fires.
3.  The function `public.handle_new_user()` executes with `SECURITY DEFINER` privileges (bypassing RLS).
4.  This function inserts the new profile into `public.profiles`, using metadata passed during sign-up for fields like `role` and `full_name`.

## How to Apply the Fix
You must run the SQL contained in `supabase/handle_new_user.sql` in your Supabase project.

1.  Go to the [Supabase Dashboard](https://supabase.com/dashboard).
2.  Open your project.
3.  Go to the **SQL Editor**.
4.  Copy the contents of `supabase/handle_new_user.sql`.
5.  Paste it into the editor and click **Run**.

## Verification
1.  Try to register a new user on the site.
2.  You should no longer see the RLS error.
3.  Check the `public.profiles` table in Supabase to confirm the new user's profile was created.

## Note on Rate Limiting
You may still see the error: *"For security purposes, you can only request this after X seconds"*.
This is Supabase's built-in rate limiting for auth requests (to prevent spam). This is a security feature and is **expected behavior**. It is not a bug.
