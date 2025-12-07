-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  role text check (role in ('couple', 'vendor', 'admin')) default 'couple',
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. VENDORS (Vendor details)
create table public.vendors (
  id uuid references public.profiles(id) on delete cascade not null primary key,
  business_name text not null,
  category text not null,
  city text not null,
  description text,
  price_range text,
  capacity integer,
  rating decimal(2,1) default 0.0,
  image_url text,
  featured_active boolean default false,
  featured_until timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.vendors enable row level security;

-- Policies
create policy "Vendors are viewable by everyone."
  on vendors for select
  using ( true );

create policy "Vendors can update own profile."
  on vendors for update
  using ( auth.uid() = id );

create policy "Vendors can insert own profile."
  on vendors for insert
  with check ( auth.uid() = id );

-- 3. AD PRODUCTS (Available packages)
create table public.ad_products (
  id text primary key, -- e.g., 'home_featured_30d'
  name text not null,
  description text,
  price decimal(10,2) not null,
  duration_days integer not null
);

-- Enable RLS
alter table public.ad_products enable row level security;

-- Policies
create policy "Ad products are viewable by everyone."
  on ad_products for select
  using ( true );

-- Insert default product
insert into public.ad_products (id, name, description, price, duration_days)
values ('home_featured_30d', 'Homepage Featured Listing', 'Appear on the homepage for 30 days.', 49.99, 30);

-- 4. VENDOR AD ORDERS (Transaction history)
create table public.vendor_ad_orders (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.vendors(id) not null,
  product_id text references public.ad_products(id) not null,
  amount decimal(10,2) not null,
  status text check (status in ('pending', 'paid', 'failed')) default 'pending',
  stripe_session_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.vendor_ad_orders enable row level security;

-- Policies
create policy "Vendors can view own orders."
  on vendor_ad_orders for select
  using ( auth.uid() = vendor_id );

create policy "Vendors can insert orders."
  on vendor_ad_orders for insert
  with check ( auth.uid() = vendor_id );
