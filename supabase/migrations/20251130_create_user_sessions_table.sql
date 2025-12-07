-- Create user_sessions table
create table if not exists public.user_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  user_agent text,
  ip_address text,
  created_at timestamptz default now(),
  last_activity timestamptz default now(),
  session_end timestamptz
);

-- Enable RLS
alter table public.user_sessions enable row level security;

-- Policies for user_sessions
create policy "Users can insert their own sessions"
  on public.user_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on public.user_sessions for update
  using (auth.uid() = user_id);

create policy "Users can view their own sessions"
  on public.user_sessions for select
  using (auth.uid() = user_id);

create policy "Admins can view all sessions"
  on public.user_sessions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create page_views table
create table if not exists public.page_views (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.user_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  page_path text,
  page_title text,
  viewed_at timestamptz default now()
);

-- Enable RLS
alter table public.page_views enable row level security;

-- Policies for page_views
create policy "Users can insert their own page views"
  on public.page_views for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own page views"
  on public.page_views for select
  using (auth.uid() = user_id);

create policy "Admins can view all page views"
  on public.page_views for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
