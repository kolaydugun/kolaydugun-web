-- Create favorites table if it doesn't exist
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, vendor_id)
);

-- Enable RLS
alter table public.favorites enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own favorites" on public.favorites;
drop policy if exists "Users can insert their own favorites" on public.favorites;
drop policy if exists "Users can delete their own favorites" on public.favorites;

-- Policies
create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);
