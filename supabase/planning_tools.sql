-- Planning Tools Tables

-- 1. Wedding Details (One per couple)
create table public.wedding_details (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  wedding_date date,
  total_budget decimal(12,2) default 0,
  partner_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.wedding_details enable row level security;

create policy "Users can view own wedding details"
  on wedding_details for select
  using ( auth.uid() = user_id );

create policy "Users can insert own wedding details"
  on wedding_details for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own wedding details"
  on wedding_details for update
  using ( auth.uid() = user_id );

-- 2. To-Do List (Tasks)
create table public.todos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text,
  month integer, -- Months before wedding (e.g., 12, 6, 1)
  is_completed boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.todos enable row level security;

create policy "Users can view own tasks"
  on todos for select
  using ( auth.uid() = user_id );

create policy "Users can insert own tasks"
  on todos for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own tasks"
  on todos for update
  using ( auth.uid() = user_id );

create policy "Users can delete own tasks"
  on todos for delete
  using ( auth.uid() = user_id );

-- 3. Seating Tables
create table public.seating_tables (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text check (type in ('round', 'rect')) default 'round',
  capacity integer default 8,
  x float default 0,
  y float default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.seating_tables enable row level security;

create policy "Users can view own tables"
  on seating_tables for select
  using ( auth.uid() = user_id );

create policy "Users can insert own tables"
  on seating_tables for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own tables"
  on seating_tables for update
  using ( auth.uid() = user_id );

create policy "Users can delete own tables"
  on seating_tables for delete
  using ( auth.uid() = user_id );

-- 4. Guests
create table public.guests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  table_id uuid references public.seating_tables(id) on delete set null,
  name text not null,
  email text,
  status text check (status in ('pending', 'confirmed', 'declined')) default 'pending',
  dietary_restrictions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.guests enable row level security;

create policy "Users can view own guests"
  on guests for select
  using ( auth.uid() = user_id );

create policy "Users can insert own guests"
  on guests for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own guests"
  on guests for update
  using ( auth.uid() = user_id );

create policy "Users can delete own guests"
  on guests for delete
  using ( auth.uid() = user_id );

-- 5. Budget Items
create table public.budget_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  estimated_cost decimal(12,2) default 0,
  actual_cost decimal(12,2) default 0,
  paid_amount decimal(12,2) default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.budget_items enable row level security;

create policy "Users can view own budget items"
  on budget_items for select
  using ( auth.uid() = user_id );

create policy "Users can insert own budget items"
  on budget_items for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own budget items"
  on budget_items for update
  using ( auth.uid() = user_id );

create policy "Users can delete own budget items"
  on budget_items for delete
  using ( auth.uid() = user_id );
