-- Create contact_messages table
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  status text default 'new', -- 'new', 'read', 'replied'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Policies
-- Allow anyone (anon) to insert
create policy "Allow public insert to contact_messages"
  on public.contact_messages for insert
  with check (true);

-- Allow admins to view all
create policy "Allow admins to view contact_messages"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Allow admins to update (mark as read)
create policy "Allow admins to update contact_messages"
  on public.contact_messages for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
