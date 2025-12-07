-- Create reviews table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  is_approved boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(vendor_id, user_id) -- One review per vendor per user
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies

-- Public can view approved reviews
create policy "Public can view approved reviews"
  on public.reviews for select
  using (is_approved = true);

-- Admins can view all reviews
create policy "Admins can view all reviews"
  on public.reviews for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Authenticated users (couples) can insert reviews
create policy "Couples can insert reviews"
  on public.reviews for insert
  with check (
    auth.role() = 'authenticated' and 
    auth.uid() = user_id
    -- Optionally check if user role is 'couple' via profiles table if needed, 
    -- but auth.uid() check is usually enough for ownership.
  );

-- Users can update their own reviews
create policy "Users can update their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

-- Users can delete their own reviews
create policy "Users can delete their own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Admins can delete any review
create policy "Admins can delete any review"
  on public.reviews for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update any review (e.g. toggle is_approved)
create policy "Admins can update any review"
  on public.reviews for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
