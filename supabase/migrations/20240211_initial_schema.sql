-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create STORES table
create table public.stores (
    id uuid primary key default uuid_generate_v4(),
    slug text unique not null,
    name text not null,
    logo_url text,
    primary_color text default '#000000',
    owner_id uuid references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create PROFILES table (extends auth.users)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    store_id uuid references public.stores(id) on delete set null,
    full_name text,
    role text check (role in ('owner', 'admin', 'staff')) default 'owner',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create MOTORCYCLES table
create table public.motorcycles (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid references public.stores(id) on delete cascade not null,
    make text not null,
    model text not null,
    year integer not null,
    price numeric not null,
    mileage integer,
    color text,
    condition text check (condition in ('New', 'Used')) default 'Used',
    description text,
    features text[] default '{}',
    images text[] default '{}',
    status text check (status in ('available', 'sold', 'reserved')) default 'available',
    slug text not null, -- SEO friendly slug
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for all tables
alter table public.stores enable row level security;
alter table public.profiles enable row level security;
alter table public.motorcycles enable row level security;

-- RLS POLICIES

-- Stores: Anyone can view public store info
create policy "Stores are viewable by everyone"
on public.stores for select
using (true);

-- Stores: Owners can update their own store
create policy "Owners can update their own store"
on public.stores for update
using (auth.uid() = owner_id);

-- Profiles: Users can see their own profile
create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

-- Profiles: Owners can see all profiles in their store
create policy "Owners can view profiles in their store"
on public.profiles for select
using (
    exists (
        select 1 from public.profiles as p
        where p.id = auth.uid() and p.role = 'owner' and p.store_id = public.profiles.store_id
    )
);

-- Motorcycles: Public can view available motorcycles
create policy "Public can view available motorcycles"
on public.motorcycles for select
using (status = 'available');

-- Motorcycles: Store users can view all motorcycles in their store
create policy "Store users can view all motorcycles in their store"
on public.motorcycles for select
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.store_id = public.motorcycles.store_id
    )
);

-- Motorcycles: Store users (admin/owner) can insert/update/delete
create policy "Admins can manage motorcycles in their store"
on public.motorcycles for all
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() 
        and profiles.store_id = public.motorcycles.store_id 
        and profiles.role in ('owner', 'admin')
    )
);
