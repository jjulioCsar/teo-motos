-- PRODUCTION SCHEMA FOR DREAMMOTOS
-- Run this in the Supabase SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STORES Table
CREATE TABLE IF NOT EXISTS public.stores (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    logo_url text,
    primary_color text DEFAULT '#4f46e5',
    secondary_color text DEFAULT '#4f46e5',
    tertiary_color text DEFAULT '#ffffff',
    whatsapp text,
    address text,
    is_dark_mode boolean DEFAULT true,
    show_financing boolean DEFAULT true,
    hero_title text,
    hero_subtitle text,
    hero_image text,
    about_text text,
    about_subtitle text,
    about_image text,
    about_paragraphs text[] DEFAULT '{}',
    our_values text[] DEFAULT '{}',
    financing_text text,
    email text,
    instagram text,
    facebook text,
    map_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. MOTORCYCLES Table
CREATE TABLE IF NOT EXISTS public.motorcycles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    make text NOT NULL,
    model text NOT NULL,
    year integer NOT NULL,
    price numeric NOT NULL,
    images text[] DEFAULT '{}',
    status text DEFAULT 'available',
    mileage integer DEFAULT 0,
    color text,
    slug text,
    description text,
    features text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. LEADS Table
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    motorcycle_id uuid REFERENCES public.motorcycles(id) ON DELETE SET NULL,
    name text NOT NULL,
    phone text NOT NULL,
    source text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PROFILES Table (Admin Management)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
    role text DEFAULT 'admin',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RLS SETTINGS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. POLICIES

-- Stores: Public Read, Auth Update
CREATE POLICY "Public read stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Admins can update stores" ON public.stores FOR UPDATE 
USING (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.store_id = public.stores.id));

-- Motorcycles: Public Read, Auth All
CREATE POLICY "Public read motorcycles" ON public.motorcycles FOR SELECT USING (true);
CREATE POLICY "Admins can manage motorcycles" ON public.motorcycles 
FOR ALL USING (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.store_id = public.motorcycles.store_id));

-- Leads: Public Insert, Auth Read
CREATE POLICY "Public insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view leads" ON public.leads FOR SELECT 
USING (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.store_id = public.leads.store_id));

-- Profiles: Auth Read/Update own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- 8. INITIAL DATA (Optional - Add your store)
-- INSERT INTO public.stores (slug, name, primary_color) 
-- VALUES ('dreammotos', 'Dream Motos', '#4f46e5')
-- ON CONFLICT (slug) DO NOTHING;
